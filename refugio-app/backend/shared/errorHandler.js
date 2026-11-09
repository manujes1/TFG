import { ZodError } from 'zod';

// Se registra después de todas las rutas del servicio.
export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Datos no válidos',
      details: err.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Códigos de Prisma: P2002 duplicado, P2025 no existe, P2003 clave ajena
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Ya existe un registro con esos datos' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Recurso no encontrado' });
  }
  if (err.code === 'P2003') {
    return res.status(409).json({ error: 'El recurso tiene datos relacionados' });
  }

  // JSON mal formado o error de multer
  if (err.type === 'entity.parse.failed' || err.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  console.error('[ERROR NO CONTROLADO]', err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
