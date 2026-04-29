import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido en las variables de entorno');
}

/**
 * Genera un JWT firmado con la información del usuario.
 * El payload se mantiene mínimo: solo lo imprescindible para identificar al usuario
 * y aplicar autorización por rol.
 * @param {{ id: string, email: string, rol: string }} payload
 * @returns {string} JWT firmado.
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifica y decodifica un JWT.
 * @param {string} token - Token a verificar.
 * @returns {object} Payload decodificado.
 * @throws Si el token es inválido o ha expirado.
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
