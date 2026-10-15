import { Router } from 'express';
import { list, getById, create, update, remove } from '../controllers/expediente.controller.js';
import { authenticate, authorize } from '../../shared/auth.js';

// mergeParams: true permite acceder a :animalId de la ruta padre
const router = Router({ mergeParams: true });

// Todas las operaciones de expedientes requieren autenticación
// (no hacemos públicos los datos médicos)
router.use(authenticate);

router.get('/', list);
router.get('/:expedienteId', getById);

// Crear/editar/borrar: solo admin o voluntario
router.post('/', authorize('ADMIN', 'VOLUNTARIO'), create);
router.patch('/:expedienteId', authorize('ADMIN', 'VOLUNTARIO'), update);
router.delete('/:expedienteId', authorize('ADMIN'), remove);

export default router;
