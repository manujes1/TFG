import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from '../../shared/errorHandler.js';
import routes from './animal.routes.js';

// Servicio de animales: fichas de los animales.
const app = express();
const PORT = process.env.ANIMALES_PORT || 3002;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'animales' });
});

app.use('/api/animales', routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[animales] escuchando en http://localhost:${PORT}`);
});
