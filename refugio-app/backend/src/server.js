import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';

import authRoutes from './routes/auth.routes.js';
import animalRoutes from './routes/animal.routes.js';
import adopcionRoutes from './routes/adopcion.routes.js';
import apadrinamientoRoutes from './routes/apadrinamiento.routes.js';
import donacionRoutes from './routes/donacion.routes.js';
import estadisticasRoutes from './routes/estadisticas.routes.js';
import recomendacionRoutes from './routes/recomendacion.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { comprobarOllama } from './config/ollama.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Servir archivos subidos (fotos de animales)
app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)));

// Para comprobar que el servidor está vivo
app.get('/health', async (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    ia: await comprobarOllama()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/animales', animalRoutes);
app.use('/api/adopciones', adopcionRoutes);
app.use('/api/apadrinamientos', apadrinamientoRoutes);
app.use('/api/donaciones', donacionRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/recomendaciones', recomendacionRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🐾 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`   Health check:        http://localhost:${PORT}/health`);
  console.log(`   Uploads públicos:    http://localhost:${PORT}/uploads/`);
  console.log(`   Auth API:            http://localhost:${PORT}/api/auth`);
  console.log(`   Animales API:        http://localhost:${PORT}/api/animales`);
  console.log(`   Adopciones API:      http://localhost:${PORT}/api/adopciones`);
  console.log(`   Apadrinamientos API: http://localhost:${PORT}/api/apadrinamientos`);
  console.log(`   Donaciones API:      http://localhost:${PORT}/api/donaciones`);
  console.log(`   Estadísticas API:    http://localhost:${PORT}/api/estadisticas`);
});
