import prisma from '../config/prisma.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';

/**
 * Registra un nuevo usuario en el sistema.
 * @param {object} data - Datos validados del usuario.
 * @returns {Promise<{ user: object, token: string }>}
 * @throws Si el email ya está registrado.
 */
export async function registerUser(data) {
  const { email, password, nombre, apellidos, telefono } = data;

  // Comprobar si ya existe
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const error = new Error('El email ya está registrado');
    error.statusCode = 409;
    throw error;
  }

  // Crear usuario con password hasheada
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, nombre, apellidos, telefono }
  });

  // Generar token
  const token = signToken({ id: user.id, email: user.email, rol: user.rol });

  // Devolvemos el usuario sin el hash (importante)
  const { passwordHash: _, ...userSafe } = user;
  return { user: userSafe, token };
}

/**
 * Autentica a un usuario por email y contraseña.
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ user: object, token: string }>}
 * @throws Si las credenciales son inválidas.
 */
export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Mensaje genérico (no revelamos si el email existe o no, por seguridad)
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
