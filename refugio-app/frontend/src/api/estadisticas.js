import api from './client.js';

export async function fetchEstadisticas() {
  const res = await api.get('http://localhost:3008/api/estadisticas');
  return res.data;
}
