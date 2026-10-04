import prisma from '../config/prisma.js';
import { evaluarAnimales, evaluarAnimal } from './matchmaking.service.js';
import { interpretarPreferencias } from './ia.service.js';
import { updatePreferencias } from './auth.service.js';

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

  const evaluados = (await evaluarAnimales(perfil, animales))
    .filter((r) => !r.descartado && r.puntuacion >= minimo)
    .sort((a, b) => b.puntuacion - a.puntuacion)
    .slice(0, limite);

  return { recomendaciones: evaluados, perfilCompleto: true };
}

/**
 * Interpreta una descripción en lenguaje natural de las preferencias del
 * usuario, la guarda como su perfil de adopción y devuelve las
 * recomendaciones resultantes.
 *
 * El modelo solo traduce texto libre a los campos estructurados del
 * perfil (ver `interpretarPreferencias`); quién es compatible con quién lo
 * sigue decidiendo el algoritmo determinista, igual que con el formulario.
 *
 * @param {string} usuarioId
 * @param {string} texto - Descripción libre escrita por el usuario.
 * @param {{ limite?: number, minimo?: number }} [opciones]
 */
export async function recomendarDesdeTexto(usuarioId, texto, opciones = {}) {
  const perfilInterpretado = await interpretarPreferencias(texto);
  await updatePreferencias(usuarioId, perfilInterpretado);

  const resultado = await recomendarAnimales(usuarioId, opciones);
  return { perfilInterpretado, ...resultado };
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

  const resultado = await evaluarAnimal(perfil, animal);
  return { perfilCompleto: true, ...resultado };
}
