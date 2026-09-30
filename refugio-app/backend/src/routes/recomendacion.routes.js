import { Router } from 'express';
import {
  recomendaciones,
  recomendacionesDesdeTexto,
  compatibilidad
} from '../controllers/recomendacion.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Las recomendaciones son personales: requieren sesión
router.use(authenticate);

router.get('/', recomendaciones);
router.post('/desde-texto', recomendacionesDesdeTexto);
router.get('/animal/:animalId', compatibilidad);

export default router;
