import { addFotoAnimal, removeFotoAnimal } from '../services/foto.service.js';

/**
 * Sube una foto al animal indicado.
 * Multer coloca el archivo en req.file.
 */
export async function subir(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha enviado ningún archivo' });
    }

    const animal = await addFotoAnimal(req.params.animalId, req.file);
    res.status(201).json(animal);
  } catch (err) {
    next(err);
  }
}

/**
 * Elimina una foto concreta.
 * La URL viene en el body porque no queremos codificarla en la ruta
 * (contiene barras que se escaparían mal).
 */
export async function eliminar(req, res, next) {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Falta el campo "url" en el body' });
    }

    const animal = await removeFotoAnimal(req.params.animalId, url);
    res.json(animal);
  } catch (err) {
    next(err);
  }
}
