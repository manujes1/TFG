import {
  registerUser,
  loginUser,
  getUserById,
  updatePreferencias
} from '../services/auth.service.js';
import {
  registerSchema,
  loginSchema,
  perfilAdoptanteSchema
} from '../utils/validation.js';

export async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body);
    const result = await registerUser(data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await getUserById(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

/**
 * Actualiza el perfil de preferencias del usuario logueado.
 * El id se toma del token: nadie puede modificar el perfil de otro.
 */
export async function updatePerfil(req, res, next) {
  try {
    const preferencias = perfilAdoptanteSchema.parse(req.body);
    const user = await updatePreferencias(req.user.id, preferencias);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
