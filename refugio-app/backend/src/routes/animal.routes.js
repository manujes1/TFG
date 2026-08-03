import { Router } from 'express';
import { list, getById, create, update, remove } from '../controllers/animal.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import expedienteRoutes from './expediente.routes.js';

const router = Router();

// Rutas de animales
router.get('/', list);
router.get('/:id', getById);
router.post('/', authenticate, authorize('ADMIN', 'VOLUNTARIO'), create);
router.patch('/:id', authenticate, authorize('ADMIN', 'VOLUNTARIO'), update);
router.delete('/:id', authenticate, authorize('ADMIN'), remove);

// Rutas anidadas de expedientes: /api/animales/:animalId/expedientes
router.use('/:animalId/expedientes', expedienteRoutes);

export default router;
