import { ZodError } from 'zod';

/**
 * Middleware global de manejo de errores.
 * Debe registrarse al final de todos los demás middlewares y rutas.
 */
export function errorHandler(err, req, res, next) {
  // Errores de validación de Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Datos no válidos',
      details: err.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Errores de Prisma frecuentes
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Ya existe un registro con esos datos' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Recurso no encontrado' });
  }
  if (err.code === 'P2003') {
    return res.status(409).json({ error: 'El recurso tiene datos relacionados' });
  }

  // JSON mal formado o errores de subida de ficheros
  if (err.type === 'entity.parse.failed' || err.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  }

  // Errores de negocio con statusCode personalizado
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Errores no controlados
  console.error('[ERROR NO CONTROLADO]', err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
