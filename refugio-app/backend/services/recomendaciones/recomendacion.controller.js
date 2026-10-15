import {
  recomendarAnimales,
  recomendarDesdeTexto,
  compatibilidadConAnimal
} from './recomendacion.service.js';
import { recomendacionesQuerySchema, preferenciasTextoSchema } from '../../shared/validation.js';

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
 * Interpreta una descripción libre de las preferencias del usuario,
 * la guarda como su perfil y devuelve las recomendaciones resultantes.
 */
export async function recomendacionesDesdeTexto(req, res, next) {
  try {
    const { texto } = preferenciasTextoSchema.parse(req.body);
    const opciones = recomendacionesQuerySchema.parse(req.query);
    const resultado = await recomendarDesdeTexto(req.user.id, texto, opciones);
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
