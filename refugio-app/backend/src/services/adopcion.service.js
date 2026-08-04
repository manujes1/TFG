import prisma from '../config/prisma.js';
import { transicionValida } from '../utils/adopcionEstados.js';

/**
 * Lista adopciones con filtros y paginación.
 * Incluye datos básicos del animal y del usuario.
 */
export async function listAdopciones(filters) {
  const { estado, animalId, usuarioId, page, pageSize } = filters;

  const where = {};
  if (estado) where.estado = estado;
  if (animalId) where.animalId = animalId;
  if (usuarioId) where.usuarioId = usuarioId;

  const skip = (page - 1) * pageSize;

  const [data, total] = await Promise.all([
    prisma.adopcion.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { fechaSolicitud: 'desc' },
      include: {
        animal: { select: { id: true, nombre: true, especie: true, estado: true } },
        usuario: { select: { id: true, nombre: true, apellidos: true, email: true } }
      }
    }),
    prisma.adopcion.count({ where })
  ]);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
}

/**
 * Obtiene una adopción por ID con datos del animal y usuario.
 */
export async function getAdopcionById(id) {
  const adopcion = await prisma.adopcion.findUnique({
    where: { id },
    include: {
      animal: true,
      usuario: {
        select: { id: true, nombre: true, apellidos: true, email: true, telefono: true }
      }
    }
  });

  if (!adopcion) {
    const error = new Error('Adopción no encontrada');
    error.statusCode = 404;
    throw error;
  }

  return adopcion;
}

/**
 * Crea una nueva solicitud de adopción.
 * Reglas:
 *  - El animal debe existir y estar DISPONIBLE.
 *  - El usuario no puede tener otra solicitud activa para el mismo animal.
 *
 * @param {string} usuarioId - ID del usuario que solicita (viene del token).
 * @param {object} data - Datos validados.
 */
export async function createAdopcion(usuarioId, data) {
  const { animalId, notas } = data;

  // 1. Animal existe y está disponible
  const animal = await prisma.animal.findUnique({ where: { id: animalId } });
  if (!animal) {
    const error = new Error('Animal no encontrado');
    error.statusCode = 404;
    throw error;
  }
  if (animal.estado !== 'DISPONIBLE') {
    const error = new Error(`El animal no está disponible para adopción (estado actual: ${animal.estado})`);
    error.statusCode = 409;
    throw error;
  }

  // 2. El usuario no tiene otra solicitud activa (no finalizada) para este animal
  const solicitudActiva = await prisma.adopcion.findFirst({
    where: {
      animalId,
      usuarioId,
      estado: { in: ['SOLICITADA', 'EN_REVISION', 'APROBADA'] }
    }
  });
  if (solicitudActiva) {
    const error = new Error('Ya tienes una solicitud activa para este animal');
    error.statusCode = 409;
    throw error;
  }

  return prisma.adopcion.create({
    data: { animalId, usuarioId, notas, estado: 'SOLICITADA' }
  });
}

/**
 * Cambia el estado de una adopción respetando las transiciones válidas.
 * Cuando pasa a COMPLETADA, marca al animal como ADOPTADO (transacción atómica).
 *
 * @param {string} adopcionId
 * @param {object} data - { estado, motivoRechazo?, notas? }
 */
export async function updateEstadoAdopcion(adopcionId, data) {
  const { estado: nuevoEstado, motivoRechazo, notas } = data;

  const adopcion = await prisma.adopcion.findUnique({
    where: { id: adopcionId }
  });
  if (!adopcion) {
    const error = new Error('Adopción no encontrada');
    error.statusCode = 404;
    throw error;
  }

  // Validar transición
  if (adopcion.estado === nuevoEstado) {
    const error = new Error('La adopción ya está en ese estado');
    error.statusCode = 400;
    throw error;
  }
  if (!transicionValida(adopcion.estado, nuevoEstado)) {
    const error = new Error(
      `Transición no permitida: ${adopcion.estado} → ${nuevoEstado}`
    );
    error.statusCode = 400;
    throw error;
  }

  // Datos que se actualizan siempre
  const dataToUpdate = {
    estado: nuevoEstado,
    ...(motivoRechazo !== undefined && { motivoRechazo }),
    ...(notas !== undefined && { notas })
  };

  // Timestamps por estado
  if (nuevoEstado === 'APROBADA') {
    dataToUpdate.fechaAprobacion = new Date();
  }
  if (nuevoEstado === 'COMPLETADA') {
    dataToUpdate.fechaCompletada = new Date();
  }

  // Si la adopción se completa, marcamos al animal como ADOPTADO
  // en la misma transacción, para que sea atómico.
  if (nuevoEstado === 'COMPLETADA') {
    return prisma.$transaction(async (tx) => {
      const updated = await tx.adopcion.update({
        where: { id: adopcionId },
        data: dataToUpdate
      });

      await tx.animal.update({
        where: { id: adopcion.animalId },
        data: { estado: 'ADOPTADO' }
      });

      // También cancelamos las otras solicitudes activas para este animal
      // (ya no tiene sentido mantenerlas abiertas).
      await tx.adopcion.updateMany({
        where: {
          animalId: adopcion.animalId,
          id: { not: adopcionId },
          estado: { in: ['SOLICITADA', 'EN_REVISION', 'APROBADA'] }
        },
        data: { estado: 'CANCELADA' }
      });

      return updated;
    });
  }

  // Cambio de estado sin efectos colaterales
  return prisma.adopcion.update({
    where: { id: adopcionId },
    data: dataToUpdate
  });
}

/**
 * Lista las adopciones de un usuario concreto (para su panel personal).
 * @param {string} usuarioId
 */
export async function listAdopcionesUsuario(usuarioId) {
  return prisma.adopcion.findMany({
    where: { usuarioId },
    orderBy: { fechaSolicitud: 'desc' },
    include: {
      animal: { select: { id: true, nombre: true, especie: true, fotos: true } }
    }
  });
}
