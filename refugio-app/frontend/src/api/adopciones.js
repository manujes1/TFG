import api from './client.js';

export async function createAdopcion(data) {
  const res = await api.post('http://localhost:3005/api/adopciones', data);
  return res.data;
}

export async function fetchMisAdopciones() {
  const res = await api.get('http://localhost:3005/api/adopciones/mis-adopciones');
  return res.data;
}

export async function fetchAdopciones(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v != null)
  );
  const res = await api.get('http://localhost:3005/api/adopciones', { params: clean });
  return res.data;
}

export async function updateEstadoAdopcion(id, data) {
  const res = await api.patch(`http://localhost:3005/api/adopciones/${id}/estado`, data);
  return res.data;
}
