import { Router } from 'express';
import {
  list,
  getById,
  create,
  updateEstado,
  misAdopciones
} from '../controllers/adopcion.controller.js';
import { authenticate, authorize } from '../../shared/auth.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// "Mis adopciones": cualquier usuario autenticado ve las suyas
router.get('/mis-adopciones', misAdopciones);

// Listar todas: solo admin/voluntario
router.get('/', authorize('ADMIN', 'VOLUNTARIO'), list);

// Detalle: el propio adoptante o staff (el control fino está en el controller)
router.get('/:id', getById);

// Crear solicitud: cualquier usuario autenticado (típicamente adoptante)
router.post('/', create);

// Cambiar estado: solo admin/voluntario
router.patch('/:id/estado', authorize('ADMIN', 'VOLUNTARIO'), updateEstado);

export default router;
