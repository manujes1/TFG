import api from './client.js';

/**
 * Funciones de acceso a los endpoints de animales.
 * Los componentes las consumen a través de React Query.
 */

/**
 * Lista animales con filtros y paginación.
 * @param {object} params - { especie, sexo, estado, search, page, pageSize }
 */
export async function fetchAnimales(params = {}) {
  // Eliminamos claves vacías para no enviar ?especie=&sexo=
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v != null)
  );
  const res = await api.get('/api/animales', { params: clean });
  return res.data;
}

/**
 * Obtiene el detalle de un animal, con sus expedientes.
 */
export async function fetchAnimalById(id) {
  const res = await api.get(`/api/animales/${id}`);
  return res.data;
}
