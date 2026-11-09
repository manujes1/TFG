import api from './client.js';

export async function createApadrinamiento(data) {
  const res = await api.post('http://localhost:3006/api/apadrinamientos', data);
  return res.data;
}

export async function fetchMisApadrinamientos() {
  const res = await api.get('http://localhost:3006/api/apadrinamientos/mis-apadrinamientos');
  return res.data;
}

export async function cancelarApadrinamiento(id) {
  const res = await api.patch(`http://localhost:3006/api/apadrinamientos/${id}/cancelar`);
  return res.data;
}
