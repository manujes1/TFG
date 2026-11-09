import api from './client.js';

export async function fetchExpedientes(animalId) {
  const res = await api.get(`http://localhost:3003/api/animales/${animalId}/expedientes`);
  return res.data;
}

export async function createExpediente(animalId, data) {
  const res = await api.post(`http://localhost:3003/api/animales/${animalId}/expedientes`, data);
  return res.data;
}

export async function updateExpediente(animalId, expedienteId, data) {
  const res = await api.patch(
    `http://localhost:3003/api/animales/${animalId}/expedientes/${expedienteId}`,
    data
  );
  return res.data;
}

export async function deleteExpediente(animalId, expedienteId) {
  await api.delete(`http://localhost:3003/api/animales/${animalId}/expedientes/${expedienteId}`);
}
