import prisma from '../../shared/prisma.js';
import { hashPassword, verifyPassword } from './password.js';
import { signToken } from '../../shared/jwt.js';

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

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Mismo mensaje en ambos casos para no revelar qué emails existen
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

const CAMPOS_USUARIO = {
  id: true,
  email: true,
  nombre: true,
  apellidos: true,
  telefono: true,
  rol: true,
  activo: true,
  createdAt: true
};

// Búsqueda por nombre, apellidos o email
export async function listUsuarios({ rol, search, page, pageSize }) {
  const where = {};
  if (rol) where.rol = rol;
  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: 'insensitive' } },
      { apellidos: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: CAMPOS_USUARIO,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.user.count({ where })
  ]);

  return {
    data,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }
  };
}

// Un administrador no puede quitarse el rol ni desactivarse, para que siempre quede alguno.
export async function updateUsuario(adminId, usuarioId, { rol, activo }) {
  if (adminId === usuarioId && ((rol && rol !== 'ADMIN') || activo === false)) {
    const error = new Error('No puedes quitarte tu propio rol de administrador ni desactivar tu cuenta');
    error.statusCode = 400;
    throw error;
  }

  const existe = await prisma.user.findUnique({ where: { id: usuarioId } });
  if (!existe) {
    const error = new Error('Usuario no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return prisma.user.update({
    where: { id: usuarioId },
    data: { ...(rol && { rol }), ...(activo !== undefined && { activo }) },
    select: CAMPOS_USUARIO
  });
}

export async function updatePreferencias(id, preferencias) {
  const user = await prisma.user.update({
    where: { id },
    data: { preferencias }
  });

  const { passwordHash: _, ...userSafe } = user;
  return userSafe;
}
