import api from './client.js';

export async function fetchUsuarios(params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v != null)
  );
  const res = await api.get('http://localhost:3001/api/auth/usuarios', { params: clean });
  return res.data;
}

export async function updateUsuario(id, data) {
  const res = await api.patch(`http://localhost:3001/api/auth/usuarios/${id}`, data);
  return res.data;
}
