import { verifyToken } from './jwt.js';
import prisma from './prisma.js';

// El rol y el estado se leen de la base de datos en cada petición, no del
// token, para que un cambio de rol o una baja tengan efecto en el momento.
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.slice('Bearer '.length);

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

    if (!user || !user.activo) {
      return res.status(401).json({ error: 'Sesión no válida' });
    }

    req.user = { id: user.id, email: user.email, rol: user.rol };
    next();
  } catch (err) {
    next(err);
  }
}

// Con token válido rellena req.user; si no, sigue como visitante.
export async function authenticateOptional(req, res, next) {
  if (!req.headers.authorization) return next();
  return authenticate(req, {
    status: () => ({ json: () => next() })
  }, next);
}

// Va siempre después de authenticate.
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
