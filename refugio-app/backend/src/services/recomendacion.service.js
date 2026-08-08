import prisma from '../config/prisma.js';
import { calcularCompatibilidad } from '../utils/compatibilidad.js';

/**
 * Devuelve los animales disponibles ordenados por compatibilidad
 * con el perfil del usuario indicado.
 *
 * @param {string} usuarioId
 * @param {{ limite?: number, minimo?: number }} [opciones]
 * @returns {Promise<{ recomendaciones: object[], perfilCompleto: boolean }>}
 */
export async function recomendarAnimales(usuarioId, { limite = 10, minimo = 0 } = {}) {
  const usuario = await prisma.user.findUnique({ where: { id: usuarioId } });
  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const perfil = usuario.preferencias;

  // Sin perfil no hay recomendación posible: se informa al cliente
  // para que dirija al usuario al formulario.
  if (!perfil || Object.keys(perfil).length === 0) {
    return { recomendaciones: [], perfilCompleto: false };
  }

  const animales = await prisma.animal.findMany({
    where: { estado: 'DISPONIBLE' }
  });

  const evaluados = animales
    .map((animal) => {
      const resultado = calcularCompatibilidad(perfil, animal);
      return { animal, ...resultado };
    })
    .filter((r) => !r.descartado && r.puntuacion >= minimo)
    .sort((a, b) => b.puntuacion - a.puntuacion)
    .slice(0, limite);

  return { recomendaciones: evaluados, perfilCompleto: true };
}

/**
 * Calcula la compatibilidad de un usuario con un animal concreto.
 * Se usa en la ficha del animal para mostrar el ajuste personalizado.
 */
export async function compatibilidadConAnimal(usuarioId, animalId) {
  const [usuario, animal] = await Promise.all([
    prisma.user.findUnique({ where: { id: usuarioId } }),
    prisma.animal.findUnique({ where: { id: animalId } })
  ]);

  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }
  if (!animal) {
    const error = new Error('Animal no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const perfil = usuario.preferencias;
  if (!perfil || Object.keys(perfil).length === 0) {
    return { perfilCompleto: false };
  }

  const resultado = calcularCompatibilidad(perfil, animal);
  return { perfilCompleto: true, ...resultado };
}
