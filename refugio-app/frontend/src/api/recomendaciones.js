import api from './client.js';

/**
 * Guarda el perfil de preferencias del usuario logueado.
 */
export async function guardarPerfil(preferencias) {
  const res = await api.put('/api/auth/perfil', preferencias);
  return res.data.user;
}

/**
 * Animales recomendados para el usuario logueado, ordenados por compatibilidad.
 */
export async function fetchRecomendaciones(params = {}) {
  const res = await api.get('/api/recomendaciones', { params });
  return res.data;
}

/**
 * Compatibilidad del usuario logueado con un animal concreto.
 * Cálculo determinista, respuesta inmediata.
 */
export async function fetchCompatibilidad(animalId) {
  const res = await api.get(`/api/recomendaciones/animal/${animalId}`);
  return res.data;
}

/**
 * Explicación en lenguaje natural de la compatibilidad.
 * Requiere inferencia del modelo local: puede tardar varios segundos.
 */
export async function explicarMatch(animalId) {
  const res = await api.post(`/api/animales/${animalId}/ia/explicar-match`);
  return res.data;
}

/**
 * Genera una descripción para un animal (staff).
 */
export async function generarDescripcionIA(animalId, guardar = false) {
  const res = await api.post(`/api/animales/${animalId}/ia/descripcion`, { guardar });
  return res.data;
}
