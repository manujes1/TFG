import api from './client.js';

/**
 * Métricas globales del refugio para el dashboard.
 */
export async function fetchEstadisticas() {
  const res = await api.get('/api/estadisticas');
  return res.data;
}
