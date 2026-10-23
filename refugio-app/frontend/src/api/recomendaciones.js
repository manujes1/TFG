import api from './client.js';

/**
 * Guarda el perfil de preferencias del usuario logueado.
 */
export async function guardarPerfil(preferencias) {
  const res = await api.put('http://localhost:3001/api/auth/perfil', preferencias);
  return res.data.user;
}

/**
 * Animales recomendados para el usuario logueado, ordenados por compatibilidad.
 */
export async function fetchRecomendaciones(params = {}) {
  const res = await api.get('http://localhost:3010/api/recomendaciones', { params });
  return res.data;
}

/**
 * Interpreta una descripción libre de las preferencias del usuario
 * (con IA), la guarda como su perfil y devuelve las recomendaciones
 * resultantes. La compatibilidad la sigue calculando el algoritmo
 * determinista: el modelo solo traduce el texto a los campos del perfil.
 */
export async function recomendarDesdeTexto(texto) {
  const res = await api.post('http://localhost:3010/api/recomendaciones/desde-texto', { texto });
  return res.data;
}

/**
 * Compatibilidad del usuario logueado con un animal concreto.
 * Cálculo determinista, respuesta inmediata.
 */
export async function fetchCompatibilidad(animalId) {
  const res = await api.get(`http://localhost:3010/api/recomendaciones/animal/${animalId}`);
  return res.data;
}

/**
 * Compatibilidad de quien solicita una adopción con el animal (personal).
 */
export async function fetchCompatibilidadSolicitante(usuarioId, animalId) {
  const res = await api.get(
    `http://localhost:3010/api/recomendaciones/usuario/${usuarioId}/animal/${animalId}`
  );
  return res.data;
}

/**
 * Explicación en lenguaje natural de la compatibilidad.
 * Requiere inferencia del modelo local: puede tardar varios segundos.
 */
export async function explicarMatch(animalId) {
  const res = await api.post(`http://localhost:3009/api/animales/${animalId}/ia/explicar-match`);
  return res.data;
}

/**
 * Genera una descripción para un animal (staff).
 */
export async function generarDescripcionIA(animalId, guardar = false) {
  const res = await api.post(`http://localhost:3009/api/animales/${animalId}/ia/descripcion`, { guardar });
  return res.data;
}
