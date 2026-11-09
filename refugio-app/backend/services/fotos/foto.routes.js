import { Router } from 'express';
import { subir, eliminar } from './foto.controller.js';
import { authenticate, authorize } from '../../shared/auth.js';
import { uploadImage } from './multer.js';

// mergeParams para leer :animalId de la ruta padre
const router = Router({ mergeParams: true });

router.use(authenticate, authorize('ADMIN', 'VOLUNTARIO'));

router.post('/', uploadImage.single('foto'), subir);

router.delete('/', eliminar);

export default router;
