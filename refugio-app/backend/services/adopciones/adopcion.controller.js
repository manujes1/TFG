import {
  listAdopciones,
  getAdopcionById,
  createAdopcion,
  updateEstadoAdopcion,
  listAdopcionesUsuario
} from './adopcion.service.js';
import {
  createAdopcionSchema,
  updateEstadoAdopcionSchema,
  listAdopcionesQuerySchema
} from '../../shared/validation.js';

export async function list(req, res, next) {
  try {
    const filters = listAdopcionesQuerySchema.parse(req.query);
    const result = await listAdopciones(filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const adopcion = await getAdopcionById(req.params.id);

    // Un adoptante solo puede ver sus propias solicitudes
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

export async function create(req, res, next) {
  try {
    const data = createAdopcionSchema.parse(req.body);
    const adopcion = await createAdopcion(req.user.id, data);
    res.status(201).json(adopcion);
  } catch (err) {
    next(err);
  }
}

export async function updateEstado(req, res, next) {
  try {
    const data = updateEstadoAdopcionSchema.parse(req.body);
    const adopcion = await updateEstadoAdopcion(req.params.id, data);
    res.json(adopcion);
  } catch (err) {
    next(err);
  }
}

export async function misAdopciones(req, res, next) {
  try {
    const adopciones = await listAdopcionesUsuario(req.user.id);
    res.json(adopciones);
  } catch (err) {
    next(err);
  }
}
