import { Router } from 'express';
import { generarDescripcion, explicarMatch } from '../controllers/ia.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

// mergeParams para acceder al :animalId de la ruta padre
const router = Router({ mergeParams: true });

router.use(authenticate);

// Generar descripciones publicables: solo staff
router.post(
  '/descripcion',
  authorize('ADMIN', 'VOLUNTARIO'),
  generarDescripcion
);

// Explicación de compatibilidad: cualquier usuario autenticado,
// sobre su propio perfil (el id sale del token)
router.post('/explicar-match', explicarMatch);

export default router;
