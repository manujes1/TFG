import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from '../../shared/errorHandler.js';
import routes from './expediente.routes.js';

/**
 * Servicio de expedientes médicos de los animales.
 */
const app = express();
const PORT = process.env.EXPEDIENTES_PORT || 3003;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'expedientes' });
});

app.use('/api/animales/:animalId/expedientes', routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[expedientes] escuchando en http://localhost:${PORT}`);
});
