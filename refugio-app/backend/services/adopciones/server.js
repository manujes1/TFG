import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from '../../shared/errorHandler.js';
import routes from './adopcion.routes.js';

const app = express();
const PORT = process.env.ADOPCIONES_PORT || 3005;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'adopciones' });
});

app.use('/api/adopciones', routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[adopciones] escuchando en http://localhost:${PORT}`);
});
