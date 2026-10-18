import {
  registerUser,
  loginUser,
  getUserById,
  updatePreferencias,
  listUsuarios,
  updateUsuario
} from './auth.service.js';
import { z } from 'zod';
import {
  registerSchema,
  loginSchema,
  perfilAdoptanteSchema,
  listUsuariosQuerySchema,
  updateUsuarioSchema
} from '../../shared/validation.js';

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

/**
 * Listado de usuarios para el panel de administración.
 */
export async function usuarios(req, res, next) {
  try {
    const filtros = listUsuariosQuerySchema.parse(req.query);
    res.json(await listUsuarios(filtros));
  } catch (err) {
    next(err);
  }
}

/**
 * Cambia el rol o el estado de la cuenta de un usuario.
 */
export async function actualizarUsuario(req, res, next) {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const datos = updateUsuarioSchema.parse(req.body);
    res.json(await updateUsuario(req.user.id, id, datos));
  } catch (err) {
    next(err);
  }
}
