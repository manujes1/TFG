// Cliente HTTP del servicio de matchmaking (lo usan ia, recomendaciones y adopciones).
const MATCHMAKING_URL = process.env.MATCHMAKING_URL || 'http://localhost:3011';

// Devuelve un resultado por animal, en el mismo orden y con el animal incluido.
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

export async function evaluarAnimal(perfil, animal) {
  const [{ animal: _, ...resultado }] = await evaluarAnimales(perfil, [animal]);
  return resultado;
}
