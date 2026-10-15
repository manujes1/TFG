import api from './client.js';

/**
 * Registra una donación.
 * @param {{ cantidad: number, concepto?: string, metodoPago?: string }} data
 */
export async function createDonacion(data) {
  const res = await api.post('http://localhost:3007/api/donaciones', data);
  return res.data;
}

/**
 * Donaciones del usuario logueado.
 */
export async function fetchMisDonaciones() {
  const res = await api.get('http://localhost:3007/api/donaciones/mis-donaciones');
  return res.data;
}

/**
 * Listado global de donaciones con sumatorio (solo admin).
 */
export async function fetchDonaciones(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v != null)
  );
  const res = await api.get('http://localhost:3007/api/donaciones', { params: clean });
  return res.data;
}
