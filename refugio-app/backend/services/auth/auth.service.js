import prisma from '../../shared/prisma.js';
import { hashPassword, verifyPassword } from './password.js';
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

// Datos de un usuario que puede ver el administrador (nunca la contraseña)
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

/**
 * Lista los usuarios, con filtro por rol, búsqueda por nombre o email y
 * paginación. Solo para administradores.
 */
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

/**
 * Cambia el rol de un usuario o activa/desactiva su cuenta.
 *
 * Un administrador no puede quitarse a sí mismo el rol ni desactivar su
 * propia cuenta: así el sistema nunca se queda sin nadie que lo administre.
 * Una cuenta desactivada deja de poder usar la aplicación en su siguiente
 * petición, porque cada servicio comprueba que la cuenta sigue activa.
 */
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
