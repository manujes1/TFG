import { Router } from 'express';
import { list, getById, create, update, remove } from '../controllers/animal.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Públicas: cualquiera puede ver los animales del refugio
router.get('/', list);
router.get('/:id', getById);

// Protegidas: solo admin/voluntario pueden gestionar el catálogo
router.post('/', authenticate, authorize('ADMIN', 'VOLUNTARIO'), create);
router.patch('/:id', authenticate, authorize('ADMIN', 'VOLUNTARIO'), update);
router.delete('/:id', authenticate, authorize('ADMIN'), remove);

export default router;
