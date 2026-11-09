import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from '../../shared/errorHandler.js';
import routes from './donacion.routes.js';

const app = express();
const PORT = process.env.DONACIONES_PORT || 3007;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'donaciones' });
});

app.use('/api/donaciones', routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[donaciones] escuchando en http://localhost:${PORT}`);
});
