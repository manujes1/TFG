import prisma from '../../shared/prisma.js';

export async function listApadrinamientos(filters) {
  const { estado, animalId, usuarioId, page, pageSize } = filters;

  const where = {};
  if (estado) where.estado = estado;
  if (animalId) where.animalId = animalId;
  if (usuarioId) where.usuarioId = usuarioId;

  const skip = (page - 1) * pageSize;

  const [data, total] = await Promise.all([
    prisma.apadrinamiento.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { fechaInicio: 'desc' },
      include: {
        animal: { select: { id: true, nombre: true, especie: true } },
        usuario: { select: { id: true, nombre: true, apellidos: true, email: true } }
      }
    }),
    prisma.apadrinamiento.count({ where })
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

export async function getApadrinamientoById(id) {
  const apadrinamiento = await prisma.apadrinamiento.findUnique({
    where: { id },
    include: {
      animal: true,
      usuario: {
        select: { id: true, nombre: true, apellidos: true, email: true }
      }
    }
  });

  if (!apadrinamiento) {
    const error = new Error('Apadrinamiento no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return apadrinamiento;
}

export async function createApadrinamiento(usuarioId, data) {
  const { animalId, tipo, cantidad } = data;

  const animal = await prisma.animal.findUnique({ where: { id: animalId } });
  if (!animal) {
    const error = new Error('Animal no encontrado');
    error.statusCode = 404;
    throw error;
  }

  // No puede tener dos apadrinamientos mensuales activos del mismo animal
  if (tipo === 'MENSUAL') {
    const activo = await prisma.apadrinamiento.findFirst({
      where: { animalId, usuarioId, estado: 'ACTIVO', tipo: 'MENSUAL' }
    });
    if (activo) {
      const error = new Error('Ya tienes un apadrinamiento mensual activo para este animal');
      error.statusCode = 409;
      throw error;
    }
  }

  // Un apadrinamiento puntual es un pago único, así que se crea ya finalizado.
  const estado = tipo === 'PUNTUAL' ? 'FINALIZADO' : 'ACTIVO';
  const fechaFin = tipo === 'PUNTUAL' ? new Date() : null;

  return prisma.apadrinamiento.create({
    data: { animalId, usuarioId, tipo, cantidad, estado, fechaFin }
  });
}

export async function cancelarApadrinamiento(id) {
  const apadrinamiento = await prisma.apadrinamiento.findUnique({ where: { id } });
  if (!apadrinamiento) {
    const error = new Error('Apadrinamiento no encontrado');
    error.statusCode = 404;
    throw error;
  }
  if (apadrinamiento.estado !== 'ACTIVO') {
    const error = new Error(`No se puede cancelar (estado actual: ${apadrinamiento.estado})`);
    error.statusCode = 400;
    throw error;
  }

  return prisma.apadrinamiento.update({
    where: { id },
    data: { estado: 'CANCELADO', fechaFin: new Date() }
  });
}

export async function listApadrinamientosUsuario(usuarioId) {
  return prisma.apadrinamiento.findMany({
    where: { usuarioId },
    orderBy: { fechaInicio: 'desc' },
    include: {
      animal: { select: { id: true, nombre: true, especie: true, fotos: true } }
    }
  });
}
