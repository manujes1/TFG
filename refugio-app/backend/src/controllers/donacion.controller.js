import {
  listDonaciones,
  createDonacion,
  listDonacionesUsuario
} from '../services/donacion.service.js';
import {
  createDonacionSchema,
  listDonacionesQuerySchema
} from '../../shared/validation.js';

/**
 * Listado global de donaciones. Solo admin.
 */
export async function list(req, res, next) {
  try {
    const filters = listDonacionesQuerySchema.parse(req.query);
    const result = await listDonaciones(filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Registrar una donación. Cualquier usuario autenticado.
 * (El caso "donación anónima sin login" quedará como trabajo futuro con Stripe).
 */
export async function create(req, res, next) {
  try {
    const data = createDonacionSchema.parse(req.body);
    const donacion = await createDonacion(
      { callerId: req.user.id, callerRol: req.user.rol },
      data
    );
    res.status(201).json(donacion);
  } catch (err) {
    next(err);
  }
}

/**
 * Donaciones del usuario logueado.
 */
export async function misDonaciones(req, res, next) {
  try {
    const donaciones = await listDonacionesUsuario(req.user.id);
    res.json(donaciones);
  } catch (err) {
    next(err);
  }
}
