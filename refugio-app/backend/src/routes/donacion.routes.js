import { Router } from 'express';
import { list, create, misDonaciones } from '../controllers/donacion.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/mis-donaciones', misDonaciones);
router.get('/', authorize('ADMIN'), list);
router.post('/', create);

export default router;
