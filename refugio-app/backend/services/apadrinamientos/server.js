import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from '../../shared/errorHandler.js';
import routes from './apadrinamiento.routes.js';

/**
 * Servicio de apadrinamientos.
 */
const app = express();
const PORT = process.env.APADRINAMIENTOS_PORT || 3006;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'apadrinamientos' });
});

app.use('/api/apadrinamientos', routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[apadrinamientos] escuchando en http://localhost:${PORT}`);
});
