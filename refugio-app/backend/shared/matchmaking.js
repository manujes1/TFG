/**
 * Cliente del servicio de matchmaking.
 *
 * Los servicios de ia y recomendaciones no calculan la compatibilidad: se la
 * piden por HTTP al servicio de matchmaking, enviándole el perfil del
 * adoptante y los animales a evaluar.
 */
const MATCHMAKING_URL = process.env.MATCHMAKING_URL || 'http://localhost:3011';

/**
 * Evalúa la compatibilidad del perfil con una lista de animales.
 * @returns {Promise<object[]>} Un resultado por animal, en el mismo orden,
 *   con el animal incluido (`{ animal, puntuacion, criterios, ... }`).
 */
export async function evaluarAnimales(perfil, animales) {
  let respuesta;
  try {
    respuesta = await fetch(`${MATCHMAKING_URL}/api/matchmaking/evaluar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ perfil, animales })
    });
  } catch {
    const error = new Error('El servicio de matchmaking no está disponible');
    error.statusCode = 503;
    throw error;
  }

  if (!respuesta.ok) {
    const error = new Error('El servicio de matchmaking respondió con un error');
    error.statusCode = 503;
    throw error;
  }

  const resultados = await respuesta.json();
  return animales.map((animal, i) => ({ animal, ...resultados[i] }));
}

/**
 * Evalúa la compatibilidad del perfil con un único animal.
 */
export async function evaluarAnimal(perfil, animal) {
  const [{ animal: _, ...resultado }] = await evaluarAnimales(perfil, [animal]);
  return resultado;
}
