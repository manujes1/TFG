/**
 * Cliente HTTP mínimo para la API de Ollama.
 *
 * Se usa fetch nativo (Node 18+) en lugar de axios: la superficie de la API
 * que necesitamos es pequeña y así evitamos una dependencia extra.
 */

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS) || 180000;

/**
 * Genera texto a partir de un prompt.
 *
 * @param {string} prompt - Instrucción para el modelo.
 * @param {object} [opciones]
 * @param {number} [opciones.temperature=0.7] - Creatividad (0 = determinista).
 * @param {number} [opciones.numPredict=200] - Máximo de tokens a generar.
 * @returns {Promise<string>} Texto generado, ya recortado.
 * @throws Error con statusCode 503 (no disponible) o 504 (timeout).
 */
export async function generarTexto(prompt, opciones = {}) {
  const { temperature = 0.7, numPredict = 200 } = opciones;

  // AbortController para no dejar la petición colgada indefinidamente
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const respuesta = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { temperature, num_predict: numPredict }
      }),
      signal: controller.signal
    });

    if (!respuesta.ok) {
      const error = new Error(
        `El servicio de IA respondió con error (${respuesta.status})`
      );
      error.statusCode = 503;
      throw error;
    }

    const datos = await respuesta.json();
    return (datos.response ?? '').trim();
  } catch (err) {
    if (err.name === 'AbortError') {
      const error = new Error('El servicio de IA ha tardado demasiado en responder');
      error.statusCode = 504;
      throw error;
    }
    // Fallo de red: Ollama no está levantado
    if (err.statusCode === undefined) {
      const error = new Error('El servicio de IA no está disponible');
      error.statusCode = 503;
      throw error;
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Comprueba si Ollama está accesible y tiene el modelo descargado.
 * Se usa en el health check para diagnosticar el entorno de un vistazo.
 */
export async function comprobarOllama() {
  try {
    const respuesta = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!respuesta.ok) {
      return { disponible: false, modelo: OLLAMA_MODEL, error: `HTTP ${respuesta.status}` };
    }
    const datos = await respuesta.json();
    const modelos = (datos.models ?? []).map((m) => m.name);
    return {
      disponible: true,
      modelo: OLLAMA_MODEL,
      modeloDescargado: modelos.includes(OLLAMA_MODEL)
    };
  } catch (err) {
    return { disponible: false, modelo: OLLAMA_MODEL, error: err.message };
  }
}
