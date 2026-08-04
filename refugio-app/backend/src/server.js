import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import animalRoutes from './routes/animal.routes.js';
import adopcionRoutes from './routes/adopcion.routes.js';
import apadrinamientoRoutes from './routes/apadrinamiento.routes.js';
import donacionRoutes from './routes/donacion.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/animales', animalRoutes);
app.use('/api/adopciones', adopcionRoutes);
app.use('/api/apadrinamientos', apadrinamientoRoutes);
app.use('/api/donaciones', donacionRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🐾 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`   Health check:        http://localhost:${PORT}/health`);
  console.log(`   Auth API:            http://localhost:${PORT}/api/auth`);
  console.log(`   Animales API:        http://localhost:${PORT}/api/animales`);
  console.log(`   Adopciones API:      http://localhost:${PORT}/api/adopciones`);
  console.log(`   Apadrinamientos API: http://localhost:${PORT}/api/apadrinamientos`);
  console.log(`   Donaciones API:      http://localhost:${PORT}/api/donaciones`);
});
