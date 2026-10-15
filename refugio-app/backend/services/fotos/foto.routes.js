import { Router } from 'express';
import { subir, eliminar } from './foto.controller.js';
import { authenticate, authorize } from '../../shared/auth.js';
import { uploadImage } from './multer.js';

// mergeParams para acceder al :animalId de la ruta padre
const router = Router({ mergeParams: true });

// Todas las operaciones requieren staff
router.use(authenticate, authorize('ADMIN', 'VOLUNTARIO'));

// POST con multer: multer procesa primero el multipart, luego el controller
router.post('/', uploadImage.single('foto'), subir);

// Borrar una foto concreta
router.delete('/', eliminar);

export default router;
