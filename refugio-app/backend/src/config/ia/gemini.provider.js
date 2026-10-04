const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
// Mínimo de tokens de salida: si el modelo razona, esos tokens pueden contar
// dentro del límite y cortar la respuesta con presupuestos muy ajustados.
const MIN_TOKENS_SALIDA = 1024;
const GEMINI_TIMEOUT_MS = Number(process.env.IA_TIMEOUT_MS) || 30000;

export const nombre = 'gemini';

function errorIA(mensaje, statusCode) {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  return error;
}

/**
 * Genera texto con la API de Gemini (REST, sin SDK).
 * Misma interfaz que el proveedor de Ollama.
 *
 * @param {string} prompt
 * @param {object} [opciones]
 * @param {number} [opciones.temperature=0.7]
 * @param {number} [opciones.numPredict=200] - Se traduce a maxOutputTokens (con un mínimo).
 * @param {boolean} [opciones.json=false] - Fuerza salida application/json.
 * @returns {Promise<string>}
 * @throws Error con statusCode 502 (respuesta vacía/bloqueada), 503 (no disponible o cuota) o 504 (timeout).
 */
export async function generarTexto(prompt, opciones = {}) {
  const { temperature = 0.7, numPredict = 200, json = false } = opciones;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw errorIA('El servicio de IA no está configurado (falta GEMINI_API_KEY)', 503);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const respuesta = await fetch(
      `${GEMINI_URL}/models/${GEMINI_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens: Math.max(numPredict, MIN_TOKENS_SALIDA),
            // Opcional: nivel de razonamiento (los valores válidos dependen del modelo)
            ...(process.env.GEMINI_THINKING_LEVEL && {
              thinkingConfig: { thinkingLevel: process.env.GEMINI_THINKING_LEVEL }
            }),
            ...(json && { responseMimeType: 'application/json' })
          }
        }),
        signal: controller.signal
      }
    );

    if (!respuesta.ok) {
      // Se registra el detalle de Google en el servidor; al cliente solo le llega un mensaje genérico
      const detalle = await respuesta.text().catch(() => '');
      console.error(`[IA] Gemini respondió ${respuesta.status}: ${detalle.slice(0, 500)}`);
      if (respuesta.status === 429) {
        throw errorIA('Se ha superado la cuota del servicio de IA, inténtalo en unos instantes', 503);
      }
      throw errorIA(`El servicio de IA respondió con error (${respuesta.status})`, 503);
    }

    const datos = await respuesta.json();
    const partes = datos.candidates?.[0]?.content?.parts;
    if (!partes?.length) {
      // Respuesta bloqueada por filtros de seguridad o sin contenido
      throw errorIA('El servicio de IA no devolvió contenido', 502);
    }
    return partes.map((p) => p.text ?? '').join('').trim();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw errorIA('El servicio de IA ha tardado demasiado en responder', 504);
    }
    if (err.statusCode === undefined) {
      console.error('[IA] Fallo al llamar a Gemini:', err);
      throw errorIA('El servicio de IA no está disponible', 503);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Comprueba la configuración sin consumir cuota de generación:
 * solo valida que la API key permite consultar el modelo.
 */
export async function comprobar() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      proveedor: nombre,
      disponible: false,
      modelo: GEMINI_MODEL,
      error: 'Falta GEMINI_API_KEY'
    };
  }
  try {
    const respuesta = await fetch(`${GEMINI_URL}/models/${GEMINI_MODEL}`, {
      headers: { 'x-goog-api-key': apiKey },
      signal: AbortSignal.timeout(5000)
    });
    return {
      proveedor: nombre,
      disponible: respuesta.ok,
      modelo: GEMINI_MODEL,
      ...(!respuesta.ok && { error: `HTTP ${respuesta.status}` })
    };
  } catch (err) {
    return { proveedor: nombre, disponible: false, modelo: GEMINI_MODEL, error: err.message };
  }
}
