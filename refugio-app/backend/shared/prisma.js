import { PrismaClient } from '@prisma/client';

/**
 * Instancia única de PrismaClient.
 * Crear múltiples instancias agotaría las conexiones a la BD.
 */
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

export default prisma;
