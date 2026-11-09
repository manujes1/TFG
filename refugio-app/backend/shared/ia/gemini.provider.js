const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
// Con razonamiento activado, esos tokens cuentan en el límite y cortaban la respuesta.
const MIN_TOKENS_SALIDA = 1024;
const GEMINI_TIMEOUT_MS = Number(process.env.IA_TIMEOUT_MS) || 30000;

export const nombre = 'gemini';

function errorIA(mensaje, statusCode) {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  return error;
}

// Misma interfaz que ollama.provider.js. Llamada REST, sin SDK.
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
      // El detalle de Google solo se registra en el servidor
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
      // Bloqueada por los filtros de seguridad o vacía
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

// Para /health: consulta el modelo, que no gasta cuota.
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
