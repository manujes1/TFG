import fs from 'node:fs/promises';
import path from 'node:path';
import prisma from '../../shared/prisma.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export async function addFotoAnimal(animalId, file) {
  const animal = await prisma.animal.findUnique({ where: { id: animalId } });
  if (!animal) {
    // Multer ya guardó el archivo: se borra si el animal no existe
    await fs.unlink(file.path).catch(() => {}); // silenciamos error si no existe
    const error = new Error('Animal no encontrado');
    error.statusCode = 404;
    throw error;
  }

  const url = `/uploads/${file.filename}`;

  return prisma.animal.update({
    where: { id: animalId },
    data: { fotos: { push: url } }
  });
}

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

  const nuevasFotos = animal.fotos.filter((f) => f !== url);
  const actualizado = await prisma.animal.update({
    where: { id: animalId },
    data: { fotos: nuevasFotos }
  });

  // Si el archivo ya no está en disco, basta con haberlo quitado de la BD
  const filename = path.basename(url);
  const filePath = path.join(UPLOAD_DIR, filename);
  try {
    await fs.unlink(filePath);
  } catch (err) {
    console.warn(`[fotos] No se pudo borrar el archivo ${filePath}: ${err.message}`);
  }

  return actualizado;
}
