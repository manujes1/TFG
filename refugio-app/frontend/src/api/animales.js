import api from './client.js';

function limpiar(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v != null)
  );
}

export async function fetchAnimales(params = {}) {
  const res = await api.get('http://localhost:3002/api/animales', { params: limpiar(params) });
  return res.data;
}

export async function fetchAnimalById(id) {
  const res = await api.get(`http://localhost:3002/api/animales/${id}`);
  return res.data;
}

export async function createAnimal(data) {
  const res = await api.post('http://localhost:3002/api/animales', data);
  return res.data;
}

export async function updateAnimal(id, data) {
  const res = await api.patch(`http://localhost:3002/api/animales/${id}`, data);
  return res.data;
}

export async function deleteAnimal(id) {
  await api.delete(`http://localhost:3002/api/animales/${id}`);
}

export async function uploadFotoAnimal(animalId, file) {
  const formData = new FormData();
  formData.append('foto', file);
  const res = await api.post(`http://localhost:3004/api/animales/${animalId}/fotos`, formData);
  return res.data;
}

export async function deleteFotoAnimal(animalId, url) {
  const res = await api.delete(`http://localhost:3004/api/animales/${animalId}/fotos`, {
    // En un DELETE, axios solo envía cuerpo si va en `data`
    data: { url }
  });
  return res.data;
}
