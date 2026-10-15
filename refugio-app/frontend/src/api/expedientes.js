import api from './client.js';

/**
 * Expedientes médicos de un animal, del más reciente al más antiguo.
 */
export async function fetchExpedientes(animalId) {
  const res = await api.get(`http://localhost:3003/api/animales/${animalId}/expedientes`);
  return res.data;
}

/**
 * Crea un expediente médico asociado a un animal.
 */
export async function createExpediente(animalId, data) {
  const res = await api.post(`http://localhost:3003/api/animales/${animalId}/expedientes`, data);
  return res.data;
}

/**
 * Actualiza un expediente existente.
 */
export async function updateExpediente(animalId, expedienteId, data) {
  const res = await api.patch(
    `http://localhost:3003/api/animales/${animalId}/expedientes/${expedienteId}`,
    data
  );
  return res.data;
}

/**
 * Elimina un expediente (solo admin).
 */
export async function deleteExpediente(animalId, expedienteId) {
  await api.delete(`http://localhost:3003/api/animales/${animalId}/expedientes/${expedienteId}`);
}
