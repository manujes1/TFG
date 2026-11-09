import prisma from '../../shared/prisma.js';

async function ensureAnimalExists(animalId) {
  const animal = await prisma.animal.findUnique({ where: { id: animalId } });
  if (!animal) {
    const error = new Error('Animal no encontrado');
    error.statusCode = 404;
    throw error;
  }
  return animal;
}

export async function listExpedientes(animalId) {
  await ensureAnimalExists(animalId);

  return prisma.expedienteMedico.findMany({
    where: { animalId },
    orderBy: { fecha: 'desc' }
  });
}

// Comprueba además que el expediente pertenece a ese animal.
export async function getExpedienteById(animalId, expedienteId) {
  const expediente = await prisma.expedienteMedico.findUnique({
    where: { id: expedienteId }
  });

  if (!expediente || expediente.animalId !== animalId) {
    const error = new Error('Expediente no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return expediente;
}

export async function createExpediente(animalId, data) {
  await ensureAnimalExists(animalId);

  return prisma.expedienteMedico.create({
    data: {
      ...data,
      animalId,
      documentos: data.documentos ?? []
    }
  });
}

export async function updateExpediente(animalId, expedienteId, data) {
  await getExpedienteById(animalId, expedienteId); // valida existencia y pertenencia

  return prisma.expedienteMedico.update({
    where: { id: expedienteId },
    data
  });
}

export async function deleteExpediente(animalId, expedienteId) {
  await getExpedienteById(animalId, expedienteId);

  await prisma.expedienteMedico.delete({ where: { id: expedienteId } });
}
