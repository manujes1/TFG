import { Router } from 'express';
import { generales } from './estadisticas.controller.js';
import { authenticate, authorize } from '../../shared/auth.js';

const router = Router();

// Solo admin/voluntario ven las estadísticas globales del refugio
router.get('/', authenticate, authorize('ADMIN', 'VOLUNTARIO'), generales);

export default router;
