import { Router } from 'express';
import { recomendaciones, compatibilidad } from '../controllers/recomendacion.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Las recomendaciones son personales: requieren sesión
router.use(authenticate);

router.get('/', recomendaciones);
router.get('/animal/:animalId', compatibilidad);

export default router;
