import { verifyToken } from '../utils/jwt.js';

/**
 * Middleware de autenticación.
 * Requiere un header `Authorization: Bearer <token>`.
 * Si el token es válido, añade `req.user` con el payload decodificado.
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.slice(7); // Quita "Bearer "

  try {
    const payload = verifyToken(token);
    req.user = payload; // { id, email, rol, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

/**
 * Middleware de autorización por rol.
 * Debe usarse SIEMPRE después de `authenticate`.
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
