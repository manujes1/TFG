import { Router } from 'express';
import { list, create, misDonaciones } from './donacion.controller.js';
import { authenticate, authorize } from '../../shared/auth.js';

const router = Router();

router.use(authenticate);

router.get('/mis-donaciones', misDonaciones);
router.get('/', authorize('ADMIN', 'VOLUNTARIO'), list);
// El personal del refugio no adopta, apadrina ni dona
router.post('/', authorize('ADOPTANTE'), create);

export default router;
