import api from './client.js';

/**
 * Crea un apadrinamiento.
 * @param {{ animalId: string, tipo: 'MENSUAL'|'PUNTUAL', cantidad: number }} data
 */
export async function createApadrinamiento(data) {
  const res = await api.post('/api/apadrinamientos', data);
  return res.data;
}

/**
 * Apadrinamientos del usuario logueado.
 */
export async function fetchMisApadrinamientos() {
  const res = await api.get('/api/apadrinamientos/mis-apadrinamientos');
  return res.data;
}

/**
 * Cancela un apadrinamiento activo.
 */
export async function cancelarApadrinamiento(id) {
  const res = await api.patch(`/api/apadrinamientos/${id}/cancelar`);
  return res.data;
}
