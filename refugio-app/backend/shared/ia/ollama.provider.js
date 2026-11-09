const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS) || 180000;

export const nombre = 'ollama';

export async function generarTexto(prompt, opciones = {}) {
  const { temperature = 0.7, numPredict = 200, json = false } = opciones;

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
        ...(json && { format: 'json' }),
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
    // Fallo de red: Ollama no está arrancado
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

// Para /health: comprueba que Ollama responde y tiene el modelo descargado.
export async function comprobar() {
  try {
    const respuesta = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(5000)
    });
    if (!respuesta.ok) {
      return {
        proveedor: nombre,
        disponible: false,
        modelo: OLLAMA_MODEL,
        error: `HTTP ${respuesta.status}`
      };
    }
    const datos = await respuesta.json();
    const modelos = (datos.models ?? []).map((m) => m.name);
    return {
      proveedor: nombre,
      disponible: true,
      modelo: OLLAMA_MODEL,
      modeloDescargado: modelos.includes(OLLAMA_MODEL)
    };
  } catch (err) {
    return { proveedor: nombre, disponible: false, modelo: OLLAMA_MODEL, error: err.message };
  }
}
