import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from '../../shared/errorHandler.js';
import routes from './foto.routes.js';

// Servicio de fotos de los animales: subida, borrado y descarga (/uploads).
const app = express();
const PORT = process.env.FOTOS_PORT || 3004;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'fotos' });
});

app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'));

app.use('/api/animales/:animalId/fotos', routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[fotos] escuchando en http://localhost:${PORT}`);
});
