import { Router } from 'express';
import {
  list,
  getById,
  create,
  cancel,
  misApadrinamientos
} from '../controllers/apadrinamiento.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Mis apadrinamientos: cualquier usuario autenticado
router.get('/mis-apadrinamientos', misApadrinamientos);

// Listar todos: solo admin/voluntario
router.get('/', authorize('ADMIN', 'VOLUNTARIO'), list);

// Detalle: el padrino o staff (control fino en el controller)
router.get('/:id', getById);

// Crear: cualquier autenticado
router.post('/', create);

// Cancelar: el padrino o admin (control fino en el controller)
router.patch('/:id/cancelar', cancel);

export default router;
