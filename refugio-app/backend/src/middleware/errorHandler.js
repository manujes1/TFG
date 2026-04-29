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
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Errores de negocio con statusCode personalizado
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Errores no controlados
  console.error('[ERROR NO CONTROLADO]', err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
