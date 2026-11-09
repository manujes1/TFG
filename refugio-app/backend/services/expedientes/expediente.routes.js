import { Router } from 'express';
import { list, getById, create, update, remove } from './expediente.controller.js';
import { authenticate, authorize } from '../../shared/auth.js';

// mergeParams para leer :animalId de la ruta padre
const router = Router({ mergeParams: true });

// Los datos médicos no son públicos
router.use(authenticate);

router.get('/', list);
router.get('/:expedienteId', getById);

router.post('/', authorize('ADMIN', 'VOLUNTARIO'), create);
router.patch('/:expedienteId', authorize('ADMIN', 'VOLUNTARIO'), update);
router.delete('/:expedienteId', authorize('ADMIN', 'VOLUNTARIO'), remove);

export default router;
