import {
  listApadrinamientos,
  getApadrinamientoById,
  createApadrinamiento,
  cancelarApadrinamiento,
  listApadrinamientosUsuario
} from '../services/apadrinamiento.service.js';
import {
  createApadrinamientoSchema,
  listApadrinamientosQuerySchema
} from '../../shared/validation.js';

/**
 * Lista todos los apadrinamientos. Solo admin/voluntario.
 */
export async function list(req, res, next) {
  try {
    const filters = listApadrinamientosQuerySchema.parse(req.query);
    const result = await listApadrinamientos(filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Detalle: el propio padrino o staff.
 */
export async function getById(req, res, next) {
  try {
    const apadrinamiento = await getApadrinamientoById(req.params.id);

    const esPropio = apadrinamiento.usuarioId === req.user.id;
    const esStaff = req.user.rol === 'ADMIN' || req.user.rol === 'VOLUNTARIO';
    if (!esPropio && !esStaff) {
      return res.status(403).json({ error: 'No tienes acceso a este apadrinamiento' });
    }

    res.json(apadrinamiento);
  } catch (err) {
    next(err);
  }
}

/**
 * Crear apadrinamiento. Cualquier usuario autenticado.
 * El usuario se obtiene del token, no del body.
 */
export async function create(req, res, next) {
  try {
    const data = createApadrinamientoSchema.parse(req.body);
    const apadrinamiento = await createApadrinamiento(req.user.id, data);
    res.status(201).json(apadrinamiento);
  } catch (err) {
    next(err);
  }
}

/**
 * Cancelar: el propio padrino o un admin.
 */
export async function cancel(req, res, next) {
  try {
    const existente = await getApadrinamientoById(req.params.id);

    const esPropio = existente.usuarioId === req.user.id;
    const esAdmin = req.user.rol === 'ADMIN';
    if (!esPropio && !esAdmin) {
      return res.status(403).json({ error: 'No puedes cancelar este apadrinamiento' });
    }

    const apadrinamiento = await cancelarApadrinamiento(req.params.id);
    res.json(apadrinamiento);
  } catch (err) {
    next(err);
  }
}

/**
 * Apadrinamientos del usuario logueado.
 */
export async function misApadrinamientos(req, res, next) {
  try {
    const apadrinamientos = await listApadrinamientosUsuario(req.user.id);
    res.json(apadrinamientos);
  } catch (err) {
    next(err);
  }
}
