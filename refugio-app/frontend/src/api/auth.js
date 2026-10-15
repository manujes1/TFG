import api from './client.js';

/**
 * Funciones de acceso a los endpoints de autenticación.
 * El AuthContext las consume; los componentes no llaman aquí directamente.
 */

export async function loginRequest(email, password) {
  const res = await api.post('http://localhost:3001/api/auth/login', { email, password });
  return res.data;
}

export async function registerRequest(data) {
  const res = await api.post('http://localhost:3001/api/auth/register', data);
  return res.data;
}

export async function getMeRequest() {
  const res = await api.get('http://localhost:3001/api/auth/me');
  return res.data.user;
}
