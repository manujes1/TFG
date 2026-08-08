import { generarDescripcionAnimal } from '../services/ia.service.js';
import { generarDescripcionSchema } from '../utils/validation.js';

/**
 * Genera una descripción para un animal mediante el modelo local.
 * Si `guardar` es true, la persiste en el campo `descripcion`.
 */
export async function generarDescripcion(req, res, next) {
  try {
    const { guardar } = generarDescripcionSchema.parse(req.body ?? {});
    const resultado = await generarDescripcionAnimal(req.params.animalId, { guardar });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}
