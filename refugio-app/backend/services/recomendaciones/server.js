import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from '../../shared/errorHandler.js';
import routes from './recomendacion.routes.js';

const app = express();
const PORT = process.env.RECOMENDACIONES_PORT || 3010;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'recomendaciones' });
});

app.use('/api/recomendaciones', routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[recomendaciones] escuchando en http://localhost:${PORT}`);
});
