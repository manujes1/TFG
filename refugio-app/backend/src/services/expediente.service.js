import prisma from '../config/prisma.js';

/**
 * Lanza un error 404 si el animal no existe.
 */
async function ensureAnimalExists(animalId) {
  const animal = await prisma.animal.findUnique({ where: { id: animalId } });
  if (!animal) {
    const error = new Error('Animal no encontrado');
    error.statusCode = 404;
    throw error;
  }
  return animal;
}

/**
 * Lista los expedientes de un animal, del más reciente al más antiguo.
 * @param {string} animalId
 */
export async function listExpedientes(animalId) {
  await ensureAnimalExists(animalId);

  return prisma.expedienteMedico.findMany({
    where: { animalId },
    orderBy: { fecha: 'desc' }
  });
}

/**
 * Devuelve un expediente concreto, verificando que pertenece al animal indicado.
 * @param {string} animalId
 * @param {string} expedienteId
 */
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

/**
 * Crea un nuevo expediente asociado a un animal.
 * @param {string} animalId
 * @param {object} data - Datos validados.
 */
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

/**
 * Actualiza un expediente existente.
 */
export async function updateExpediente(animalId, expedienteId, data) {
  await getExpedienteById(animalId, expedienteId); // valida existencia y pertenencia

  return prisma.expedienteMedico.update({
    where: { id: expedienteId },
    data
  });
}

/**
 * Elimina un expediente.
 */
export async function deleteExpediente(animalId, expedienteId) {
  await getExpedienteById(animalId, expedienteId);

  await prisma.expedienteMedico.delete({ where: { id: expedienteId } });
}
