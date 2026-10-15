import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from '../../shared/errorHandler.js';
import routes from './estadisticas.routes.js';

/**
 * Servicio de estadísticas para el panel de gestión (solo lectura).
 */
const app = express();
const PORT = process.env.ESTADISTICAS_PORT || 3008;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'estadisticas' });
});

app.use('/api/estadisticas', routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[estadisticas] escuchando en http://localhost:${PORT}`);
});
