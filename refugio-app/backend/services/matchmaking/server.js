import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from '../../shared/errorHandler.js';
import routes from './matchmaking.routes.js';

/**
 * Servicio de matchmaking: cálculo de compatibilidad entre un perfil y unos animales.
 */
const app = express();
const PORT = process.env.MATCHMAKING_PORT || 3011;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'matchmaking' });
});

app.use('/api/matchmaking', routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[matchmaking] escuchando en http://localhost:${PORT}`);
});
