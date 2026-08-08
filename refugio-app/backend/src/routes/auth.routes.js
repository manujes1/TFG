import { Router } from 'express';
import { register, login, me, updatePerfil } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, me);
router.put('/perfil', authenticate, updatePerfil);

export default router;
