import { Router } from 'express';
import { list, getById, create, update, remove } from './animal.controller.js';
import { authenticate, authenticateOptional, authorize } from '../../shared/auth.js';

const router = Router();

router.get('/', list);
router.get('/:id', authenticateOptional, getById);
router.post('/', authenticate, authorize('ADMIN', 'VOLUNTARIO'), create);
router.patch('/:id', authenticate, authorize('ADMIN', 'VOLUNTARIO'), update);
router.delete('/:id', authenticate, authorize('ADMIN', 'VOLUNTARIO'), remove);

// Expedientes, fotos e IA cuelgan de /:animalId pero son servicios aparte

export default router;
