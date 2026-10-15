import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from '../../shared/errorHandler.js';
import routes from './auth.routes.js';

/**
 * Servicio de usuarios: registro, login, sesión y perfil de adopción.
 */
const app = express();
const PORT = process.env.AUTH_PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', servicio: 'auth' });
});

app.use('/api/auth', routes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[auth] escuchando en http://localhost:${PORT}`);
});
