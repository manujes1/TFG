import api from './client.js';

/**
 * Crea una solicitud de adopción para un animal.
 * @param {{ animalId: string, notas?: string }} data
 */
export async function createAdopcion(data) {
  const res = await api.post('http://localhost:3005/api/adopciones', data);
  return res.data;
}

/**
 * Devuelve las solicitudes del usuario logueado.
 */
export async function fetchMisAdopciones() {
  const res = await api.get('http://localhost:3005/api/adopciones/mis-adopciones');
  return res.data;
}

/**
 * Listado global de adopciones (staff).
 */
export async function fetchAdopciones(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v != null)
  );
  const res = await api.get('http://localhost:3005/api/adopciones', { params: clean });
  return res.data;
}

/**
 * Cambia el estado de una adopción (staff).
 */
export async function updateEstadoAdopcion(id, data) {
  const res = await api.patch(`http://localhost:3005/api/adopciones/${id}/estado`, data);
  return res.data;
}
