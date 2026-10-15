import fs from 'node:fs/promises';
import path from 'node:path';
import prisma from '../../shared/prisma.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

/**
 * Añade una foto al array `fotos` del animal.
 * @param {string} animalId
 * @param {object} file - Objeto file de multer.
 * @returns El animal actualizado.
 */
export async function addFotoAnimal(animalId, file) {
  const animal = await prisma.animal.findUnique({ where: { id: animalId } });
  if (!animal) {
    // Si el animal no existe, borramos el archivo que multer ya subió
    await fs.unlink(file.path).catch(() => {}); // silenciamos error si no existe
    const error = new Error('Animal no encontrado');
    error.statusCode = 404;
    throw error;
  }

  // La URL pública es /uploads/<filename>
  const url = `/uploads/${file.filename}`;

  return prisma.animal.update({
    where: { id: animalId },
    data: { fotos: { push: url } }
  });
}

/**
 * Elimina una foto del animal (BD + disco).
 * @param {string} animalId
 * @param {string} url - URL relativa (por ejemplo /uploads/1722...jpg).
 */
export async function removeFotoAnimal(animalId, url) {
  const animal = await prisma.animal.findUnique({ where: { id: animalId } });
  if (!animal) {
    const error = new Error('Animal no encontrado');
    error.statusCode = 404;
    throw error;
  }

  if (!animal.fotos.includes(url)) {
    const error = new Error('Esa foto no pertenece al animal');
    error.statusCode = 404;
    throw error;
  }

  // Actualizar la BD quitando la URL del array
  const nuevasFotos = animal.fotos.filter((f) => f !== url);
  const actualizado = await prisma.animal.update({
    where: { id: animalId },
    data: { fotos: nuevasFotos }
  });

  // Intentar borrar el archivo del disco.
  // Si falla (por ejemplo, ya estaba borrado), lo registramos pero no
  // interrumpimos la operación: la BD ya está en el estado correcto.
  const filename = path.basename(url);
  const filePath = path.join(UPLOAD_DIR, filename);
  try {
    await fs.unlink(filePath);
  } catch (err) {
    console.warn(`[fotos] No se pudo borrar el archivo ${filePath}: ${err.message}`);
  }

  return actualizado;
}
