import prisma from '../../shared/prisma.js';

/**
 * Lista animales con filtros y paginación.
 * @param {object} filters - Filtros validados.
 * @returns {Promise<{ data: Animal[], pagination: object }>}
 */
export async function listAnimales(filters) {
  const { especie, sexo, estado, search, page, pageSize } = filters;

  // Construimos el where dinámicamente tomando los datos pasados por parametros
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

  // Hacemos las dos queries en paralelo (datos + total)
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

/**
 * Obtiene un animal por ID. Los expedientes médicos solo se incluyen para el personal.
 * @param {string} id
 */
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

/**
 * Crea un nuevo animal.
 * @param {object} data - Datos validados.
 */
export async function createAnimal(data) {
  // Si nos pasan chip, comprobar que no esté ya en uso
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

/**
 * Actualiza un animal existente.
 * @param {string} id
 * @param {object} data - Datos validados (parciales).
 */
export async function updateAnimal(id, data) {
  // Verificar que existe
  const existing = await prisma.animal.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Animal no encontrado');
    error.statusCode = 404;
    throw error;
  }

  // Si se cambia el chip, comprobar unicidad
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

/**
 * Elimina un animal.
 * @param {string} id
 */
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
