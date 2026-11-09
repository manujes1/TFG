import {
  generarDescripcionAnimal,
  explicarCompatibilidad
} from './ia.service.js';
import { generarDescripcionSchema } from '../../shared/validation.js';

export async function generarDescripcion(req, res, next) {
  try {
    const { guardar } = generarDescripcionSchema.parse(req.body ?? {});
    const resultado = await generarDescripcionAnimal(req.params.animalId, { guardar });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

export async function explicarMatch(req, res, next) {
  try {
    const resultado = await explicarCompatibilidad(req.user.id, req.params.animalId);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}
