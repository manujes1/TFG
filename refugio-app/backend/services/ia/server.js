import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { comprobarIA } from '../../shared/ia/index.js';
import { errorHandler } from '../../shared/errorHandler.js';
import routes from './ia.routes.js';

const app = express();
const PORT = process.env.IA_PORT || 3009;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', async (req, res) => {
  res.json({ status: 'ok', servicio: 'ia', ia: await comprobarIA() });
});

app.use('/api/animales/:animalId/ia', routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[ia] escuchando en http://localhost:${PORT}`);
});
