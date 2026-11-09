import prisma from '../../shared/prisma.js';

export async function listAnimales(filters) {
  const { especie, sexo, estado, search, page, pageSize } = filters;

  const where = {};
  if (especie) where.especie = especie;
  if (sexo) where.sexo = sexo;
  if (estado) where.estado = estado;
  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: 'insensitive' } },
      { raza: { contains: search, mode: 'insensitive' } }
    ];
  }

  const skip = (page - 1) * pageSize;

  const [data, total] = await Promise.all([
    prisma.animal.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.animal.count({ where })
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

// Los expedientes médicos solo se incluyen para el personal.
export async function getAnimalById(id, rol) {
  const esStaff = rol === 'ADMIN' || rol === 'VOLUNTARIO';
  const animal = await prisma.animal.findUnique({
    where: { id },
    include: esStaff ? { expedientes: { orderBy: { fecha: 'desc' } } } : undefined
  });

  if (!animal) {
    const error = new Error('Animal no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return animal;
}

export async function createAnimal(data) {
  // El chip es único
  if (data.chip) {
    const existing = await prisma.animal.findUnique({ where: { chip: data.chip } });
    if (existing) {
      const error = new Error('Ya existe un animal con ese chip');
      error.statusCode = 409;
      throw error;
    }
  }

  return prisma.animal.create({ data });
}

export async function updateAnimal(id, data) {
  const existing = await prisma.animal.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Animal no encontrado');
    error.statusCode = 404;
    throw error;
  }

  if (data.chip && data.chip !== existing.chip) {
    const chipUsed = await prisma.animal.findUnique({ where: { chip: data.chip } });
    if (chipUsed) {
      const error = new Error('Ya existe un animal con ese chip');
      error.statusCode = 409;
      throw error;
    }
  }

  return prisma.animal.update({
    where: { id },
    data
  });
}

export async function deleteAnimal(id) {
  const existing = await prisma.animal.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Animal no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const [adopciones, apadrinamientos] = await Promise.all([
    prisma.adopcion.count({ where: { animalId: id } }),
    prisma.apadrinamiento.count({ where: { animalId: id } })
  ]);
  if (adopciones > 0 || apadrinamientos > 0) {
    const error = new Error(
      'No se puede eliminar un animal con adopciones o apadrinamientos asociados'
    );
    error.statusCode = 409;
    throw error;
  }

  await prisma.animal.delete({ where: { id } });
}
