import { Router } from 'express';
import {
  list,
  getById,
  create,
  cancel,
  misApadrinamientos
} from './apadrinamiento.controller.js';
import { authenticate, authorize } from '../../shared/auth.js';

const router = Router();

router.use(authenticate);

router.get('/mis-apadrinamientos', misApadrinamientos);

router.get('/', authorize('ADMIN', 'VOLUNTARIO'), list);

router.get('/:id', getById);

// El personal del refugio no adopta, apadrina ni dona
router.post('/', authorize('ADOPTANTE'), create);

router.patch('/:id/cancelar', cancel);

export default router;
