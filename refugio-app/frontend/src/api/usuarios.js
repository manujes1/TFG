import api from './client.js';

/**
 * Gestión de usuarios (solo administradores).
 */
export async function fetchUsuarios(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v != null)
  );
  const res = await api.get('http://localhost:3001/api/auth/usuarios', { params: clean });
  return res.data;
}

/**
 * Cambia el rol o el estado de la cuenta de un usuario.
 * @param {string} id
 * @param {{ rol?: string, activo?: boolean }} data
 */
export async function updateUsuario(id, data) {
  const res = await api.patch(`http://localhost:3001/api/auth/usuarios/${id}`, data);
  return res.data;
}
