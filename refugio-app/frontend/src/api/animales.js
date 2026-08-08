import api from './client.js';

/**
 * Elimina claves vacías o nulas de un objeto de parámetros.
 */
function limpiar(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v != null)
  );
}

/**
 * Lista animales con filtros y paginación.
 */
export async function fetchAnimales(params = {}) {
  const res = await api.get('/api/animales', { params: limpiar(params) });
  return res.data;
}

/**
 * Detalle de un animal, con sus expedientes médicos.
 */
export async function fetchAnimalById(id) {
  const res = await api.get(`/api/animales/${id}`);
  return res.data;
}

/**
 * Crea un animal (staff).
 */
export async function createAnimal(data) {
  const res = await api.post('/api/animales', data);
  return res.data;
}

/**
 * Actualiza parcialmente un animal (staff).
 */
export async function updateAnimal(id, data) {
  const res = await api.patch(`/api/animales/${id}`, data);
  return res.data;
}

/**
 * Elimina un animal (solo admin).
 */
export async function deleteAnimal(id) {
  await api.delete(`/api/animales/${id}`);
}

/**
 * Sube una foto a un animal.
 * El navegador establece automáticamente el Content-Type multipart
 * con el boundary correcto al pasar un FormData.
 */
export async function uploadFotoAnimal(animalId, file) {
  const formData = new FormData();
  formData.append('foto', file);
  const res = await api.post(`/api/animales/${animalId}/fotos`, formData);
  return res.data;
}

/**
 * Elimina una foto concreta de un animal.
 * El endpoint espera la URL en el body, de ahí el uso de `data` en DELETE.
 */
export async function deleteFotoAnimal(animalId, url) {
  const res = await api.delete(`/api/animales/${animalId}/fotos`, {
    data: { url }
  });
  return res.data;
}
