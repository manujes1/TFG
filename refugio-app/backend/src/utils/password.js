import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Genera un hash seguro de una contraseña en texto plano.
 * @param {string} password - Contraseña en texto plano.
 * @returns {Promise<string>} Hash de la contraseña.
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifica si una contraseña coincide con un hash.
 * @param {string} password - Contraseña en texto plano.
 * @param {string} hash - Hash almacenado.
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
