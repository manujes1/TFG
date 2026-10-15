import { verifyToken } from './jwt.js';
import prisma from './prisma.js';

/**
 * Middleware de autenticación.
 *
 * Requiere un header `Authorization: Bearer <token>`.
 *
 * Tras verificar la firma del token, se consulta el usuario en base de datos
 * para obtener su rol y su estado actuales. Confiar únicamente en el payload
 * del JWT haría imposible revocar permisos antes de la expiración del token
 * (7 días): un usuario degradado o desactivado conservaría sus privilegios.
 *
 * El coste es una consulta indexada por clave primaria en cada petición
 * autenticada, asumible para la escala de esta aplicación. La alternativa
 * (tokens de vida corta con refresh tokens) se descartó por complejidad
 * frente al beneficio en este contexto.
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.slice(7); // Quita "Bearer "

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, rol: true, activo: true }
    });

    // El usuario pudo ser eliminado o desactivado después de emitir el token
    if (!user || !user.activo) {
      return res.status(401).json({ error: 'Sesión no válida' });
    }

    req.user = { id: user.id, email: user.email, rol: user.rol };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Autenticación opcional: si hay un token válido rellena `req.user`;
 * si no hay token o no es válido, continúa como visitante anónimo.
 */
export async function authenticateOptional(req, res, next) {
  if (!req.headers.authorization) return next();
  return authenticate(req, {
    status: () => ({ json: () => next() })
  }, next);
}

/**
 * Middleware de autorización por rol.
 * Debe usarse SIEMPRE después de `authenticate`.
 *
 * @param  {...string} rolesPermitidos - Roles que pueden acceder.
 */
export function authorize(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ error: 'Permisos insuficientes' });
    }
    next();
  };
}
