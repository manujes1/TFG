import prisma from '../../shared/prisma.js';

export async function listDonaciones(filters) {
  const { usuarioId, desde, hasta, page, pageSize } = filters;

  const where = {};
  if (usuarioId) where.usuarioId = usuarioId;
  if (desde || hasta) {
    where.fecha = {};
    if (desde) where.fecha.gte = desde;
    if (hasta) where.fecha.lte = hasta;
  }

  const skip = (page - 1) * pageSize;

  const [data, total, sumaResult] = await Promise.all([
    prisma.donacion.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { fecha: 'desc' },
      include: {
        usuario: { select: { id: true, nombre: true, apellidos: true, email: true } }
      }
    }),
    prisma.donacion.count({ where }),
    prisma.donacion.aggregate({
      where,
      _sum: { cantidad: true }
    })
  ]);

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    },
    totalCantidad: sumaResult._sum.cantidad ?? 0
  };
}

export async function createDonacion({ callerId, callerRol }, data) {
  // Un adoptante dona siempre a su nombre
  const donanteId =
    callerRol === 'ADMIN' ? data.usuarioId ?? null : callerId;

  if (donanteId) {
    const user = await prisma.user.findUnique({ where: { id: donanteId } });
    if (!user) {
      const error = new Error('Usuario donante no encontrado');
      error.statusCode = 404;
      throw error;
    }
  }

  return prisma.donacion.create({
    data: {
      usuarioId: donanteId,
      cantidad: data.cantidad,
      concepto: data.concepto,
      metodoPago: data.metodoPago
    }
  });
}

export async function listDonacionesUsuario(usuarioId) {
  return prisma.donacion.findMany({
    where: { usuarioId },
    orderBy: { fecha: 'desc' }
  });
}
