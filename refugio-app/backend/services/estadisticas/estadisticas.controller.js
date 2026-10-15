import { getEstadisticasGenerales } from './estadisticas.service.js';

export async function generales(req, res, next) {
  try {
    const stats = await getEstadisticasGenerales();
    res.json(stats);
  } catch (err) {
    next(err);
  }
}
