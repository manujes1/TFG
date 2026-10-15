import {
  listExpedientes,
  getExpedienteById,
  createExpediente,
  updateExpediente,
  deleteExpediente
} from './expediente.service.js';
import {
  createExpedienteSchema,
  updateExpedienteSchema
} from '../../shared/validation.js';

export async function list(req, res, next) {
  try {
    const expedientes = await listExpedientes(req.params.animalId);
    res.json(expedientes);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const expediente = await getExpedienteById(
      req.params.animalId,
      req.params.expedienteId
    );
    res.json(expediente);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const data = createExpedienteSchema.parse(req.body);
    const expediente = await createExpediente(req.params.animalId, data);
    res.status(201).json(expediente);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const data = updateExpedienteSchema.parse(req.body);
    const expediente = await updateExpediente(
      req.params.animalId,
      req.params.expedienteId,
      data
    );
    res.json(expediente);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await deleteExpediente(req.params.animalId, req.params.expedienteId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
