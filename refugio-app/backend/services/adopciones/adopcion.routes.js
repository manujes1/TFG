import { Router } from 'express';
import {
  list,
  getById,
  create,
  updateEstado,
  misAdopciones
} from './adopcion.controller.js';
import { authenticate, authorize } from '../../shared/auth.js';

const router = Router();

router.use(authenticate);

router.get('/mis-adopciones', misAdopciones);

router.get('/', authorize('ADMIN', 'VOLUNTARIO'), list);

router.get('/:id', getById);

// El personal del refugio no adopta, apadrina ni dona
router.post('/', authorize('ADOPTANTE'), create);

router.patch('/:id/estado', authorize('ADMIN', 'VOLUNTARIO'), updateEstado);

export default router;
