import { Router } from 'express';
import { generarDescripcion } from '../controllers/ia.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

// mergeParams para acceder al :animalId de la ruta padre
const router = Router({ mergeParams: true });

// Generar contenido consume recursos del servidor: restringido a staff
router.use(authenticate, authorize('ADMIN', 'VOLUNTARIO'));

router.post('/descripcion', generarDescripcion);

export default router;
