import api from './client.js';

export async function guardarPerfil(preferencias) {
  const res = await api.put('http://localhost:3001/api/auth/perfil', preferencias);
  return res.data.user;
}

export async function fetchRecomendaciones(params = {}) {
  const res = await api.get('http://localhost:3010/api/recomendaciones', { params });
  return res.data;
}

export async function recomendarDesdeTexto(texto) {
  const res = await api.post('http://localhost:3010/api/recomendaciones/desde-texto', { texto });
  return res.data;
}

export async function fetchCompatibilidad(animalId) {
  const res = await api.get(`http://localhost:3010/api/recomendaciones/animal/${animalId}`);
  return res.data;
}

export async function fetchCompatibilidadSolicitante(usuarioId, animalId) {
  const res = await api.get(
    `http://localhost:3010/api/recomendaciones/usuario/${usuarioId}/animal/${animalId}`
  );
  return res.data;
}

export async function explicarMatch(animalId) {
  const res = await api.post(`http://localhost:3009/api/animales/${animalId}/ia/explicar-match`);
  return res.data;
}

export async function generarDescripcionIA(animalId, guardar = false) {
  const res = await api.post(`http://localhost:3009/api/animales/${animalId}/ia/descripcion`, { guardar });
  return res.data;
}
