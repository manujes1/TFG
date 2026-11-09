import { addFotoAnimal, removeFotoAnimal } from './foto.service.js';

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

// La URL va en el cuerpo porque contiene barras y no cabe bien en la ruta.
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
