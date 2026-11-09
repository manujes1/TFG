import { Router } from 'express';
import { generales } from './estadisticas.controller.js';
import { authenticate, authorize } from '../../shared/auth.js';

const router = Router();

router.get('/', authenticate, authorize('ADMIN', 'VOLUNTARIO'), generales);

export default router;
