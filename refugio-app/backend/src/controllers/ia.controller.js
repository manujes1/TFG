import {
  generarDescripcionAnimal,
  explicarCompatibilidad
} from '../services/ia.service.js';
import { generarDescripcionSchema } from '../../shared/validation.js';

/**
 * Genera una descripción para un animal mediante el proveedor de IA configurado.
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

/**
 * Explica en lenguaje natural la compatibilidad entre el usuario
 * logueado y un animal concreto.
 */
export async function explicarMatch(req, res, next) {
  try {
    const resultado = await explicarCompatibilidad(req.user.id, req.params.animalId);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}
