import {
  recomendarAnimales,
  compatibilidadConAnimal
} from '../services/recomendacion.service.js';
import { recomendacionesQuerySchema } from '../utils/validation.js';

/**
 * Recomendaciones personalizadas para el usuario logueado.
 */
export async function recomendaciones(req, res, next) {
  try {
    const opciones = recomendacionesQuerySchema.parse(req.query);
    const resultado = await recomendarAnimales(req.user.id, opciones);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

/**
 * Compatibilidad del usuario logueado con un animal concreto.
 */
export async function compatibilidad(req, res, next) {
  try {
    const resultado = await compatibilidadConAnimal(req.user.id, req.params.animalId);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}
