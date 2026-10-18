import { Router } from 'express';
import {
  register,
  login,
  me,
  updatePerfil,
  usuarios,
  actualizarUsuario
} from './auth.controller.js';
import { authenticate, authorize } from '../../shared/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);
router.put('/perfil', authenticate, updatePerfil);

// Gestión de usuarios: solo administradores
router.get('/usuarios', authenticate, authorize('ADMIN'), usuarios);
router.patch('/usuarios/:id', authenticate, authorize('ADMIN'), actualizarUsuario);

export default router;
