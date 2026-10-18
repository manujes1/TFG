import { Router } from 'express';
import { list, create, misDonaciones } from './donacion.controller.js';
import { authenticate, authorize } from '../../shared/auth.js';

const router = Router();

router.use(authenticate);

router.get('/mis-donaciones', misDonaciones);
router.get('/', authorize('ADMIN'), list);
// Solo los adoptantes donan: el personal del refugio no
router.post('/', authorize('ADOPTANTE'), create);

export default router;
