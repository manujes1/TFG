import {
  listAdopciones,
  getAdopcionById,
  createAdopcion,
  updateEstadoAdopcion,
  listAdopcionesUsuario
} from '../services/adopcion.service.js';
import {
  createAdopcionSchema,
  updateEstadoAdopcionSchema,
  listAdopcionesQuerySchema
} from '../../shared/validation.js';

/**
 * Lista todas las adopciones. Solo admin/voluntario.
 */
export async function list(req, res, next) {
  try {
    const filters = listAdopcionesQuerySchema.parse(req.query);
    const result = await listAdopciones(filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Devuelve el detalle de una adopción.
 * Regla: admin/voluntario pueden verla siempre; un adoptante solo la suya.
 */
export async function getById(req, res, next) {
  try {
    const adopcion = await getAdopcionById(req.params.id);

    const esPropia = adopcion.usuarioId === req.user.id;
    const esStaff = req.user.rol === 'ADMIN' || req.user.rol === 'VOLUNTARIO';
    if (!esPropia && !esStaff) {
      return res.status(403).json({ error: 'No tienes acceso a esta adopción' });
    }

    res.json(adopcion);
  } catch (err) {
    next(err);
  }
}

/**
 * El adoptante solicita adoptar un animal.
 * El usuario se obtiene del token, no del body (más seguro).
 */
export async function create(req, res, next) {
  try {
    const data = createAdopcionSchema.parse(req.body);
    const adopcion = await createAdopcion(req.user.id, data);
    res.status(201).json(adopcion);
  } catch (err) {
    next(err);
  }
}

/**
 * Cambia el estado de una adopción. Solo admin/voluntario.
 */
export async function updateEstado(req, res, next) {
  try {
    const data = updateEstadoAdopcionSchema.parse(req.body);
    const adopcion = await updateEstadoAdopcion(req.params.id, data);
    res.json(adopcion);
  } catch (err) {
    next(err);
  }
}

/**
 * Devuelve las adopciones del usuario logueado.
 * Endpoint independiente para que el adoptante vea "mis solicitudes".
 */
export async function misAdopciones(req, res, next) {
  try {
    const adopciones = await listAdopcionesUsuario(req.user.id);
    res.json(adopciones);
  } catch (err) {
    next(err);
  }
}
