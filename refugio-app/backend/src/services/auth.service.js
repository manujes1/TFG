import prisma from '../../shared/prisma.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signToken } from '../../shared/jwt.js';

/**
 * Registra un nuevo usuario en el sistema.
 */
export async function registerUser(data) {
  const { email, password, nombre, apellidos, telefono } = data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('El email ya está registrado');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, nombre, apellidos, telefono }
  });

  const token = signToken({ id: user.id, email: user.email, rol: user.rol });

  const { passwordHash: _, ...userSafe } = user;
  return { user: userSafe, token };
}

/**
 * Autentica a un usuario por email y contraseña.
 */
export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Mensaje genérico: no revelamos si el email existe (evita enumeración)
  if (!user || !user.activo) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    const error = new Error('Credenciales inválidas');
    error.statusCode = 401;
    throw error;
  }

  const token = signToken({ id: user.id, email: user.email, rol: user.rol });

  const { passwordHash: _, ...userSafe } = user;
  return { user: userSafe, token };
}

/**
 * Devuelve los datos del usuario a partir de su id.
 */
export async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user || !user.activo) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const { passwordHash: _, ...userSafe } = user;
  return userSafe;
}

/**
 * Actualiza el perfil de preferencias del adoptante.
 * Estas preferencias alimentan el algoritmo de compatibilidad.
 *
 * @param {string} id - ID del usuario (del token).
 * @param {object} preferencias - Datos validados.
 */
export async function updatePreferencias(id, preferencias) {
  const user = await prisma.user.update({
    where: { id },
    data: { preferencias }
  });

  const { passwordHash: _, ...userSafe } = user;
  return userSafe;
}
