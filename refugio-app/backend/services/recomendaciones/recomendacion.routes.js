import { Router } from 'express';
import {
  recomendaciones,
  recomendacionesDesdeTexto,
  compatibilidad,
  compatibilidadSolicitante
} from './recomendacion.controller.js';
import { authenticate, authorize } from '../../shared/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', recomendaciones);
router.post('/desde-texto', recomendacionesDesdeTexto);
router.get('/animal/:animalId', compatibilidad);

router.get(
  '/usuario/:usuarioId/animal/:animalId',
  authorize('ADMIN', 'VOLUNTARIO'),
  compatibilidadSolicitante
);

export default router;
