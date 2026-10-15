import {
  listAnimales,
  getAnimalById,
  createAnimal,
  updateAnimal,
  deleteAnimal
} from './animal.service.js';
import {
  createAnimalSchema,
  updateAnimalSchema,
  listAnimalesQuerySchema
} from '../../shared/validation.js';

export async function list(req, res, next) {
  try {
    const filters = listAnimalesQuerySchema.parse(req.query);
    const result = await listAnimales(filters);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const animal = await getAnimalById(req.params.id, req.user?.rol);
    res.json(animal);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const data = createAnimalSchema.parse(req.body);
    const animal = await createAnimal(data);
    res.status(201).json(animal);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const data = updateAnimalSchema.parse(req.body);
    const animal = await updateAnimal(req.params.id, data);
    res.json(animal);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    await deleteAnimal(req.params.id);
    res.status(204).send(); // No Content
  } catch (err) {
    next(err);
  }
}
