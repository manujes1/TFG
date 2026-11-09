import { Router } from 'express';
import { generarDescripcion, explicarMatch } from './ia.controller.js';
import { authenticate, authorize } from '../../shared/auth.js';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  '/descripcion',
  authorize('ADMIN', 'VOLUNTARIO'),
  generarDescripcion
);

router.post('/explicar-match', explicarMatch);

export default router;
