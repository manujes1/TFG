/**
 * Máquina de estados de las adopciones.
 *
 * Define qué transiciones son válidas desde cada estado.
 * Centralizar esto aquí facilita razonar sobre el flujo y modificarlo.
 */

// De qué estado se puede pasar a qué otros estados
const TRANSICIONES_VALIDAS = {
  SOLICITADA: ['EN_REVISION', 'RECHAZADA', 'CANCELADA'],
  EN_REVISION: ['APROBADA', 'RECHAZADA', 'CANCELADA'],
  APROBADA: ['COMPLETADA', 'CANCELADA'],
  RECHAZADA: [], // estado final
  COMPLETADA: [], // estado final
  CANCELADA: []  // estado final
};

/**
 * Comprueba si es válido pasar de un estado a otro.
 * @param {string} desde - Estado actual.
 * @param {string} hacia - Estado destino.
 * @returns {boolean}
 */
export function transicionValida(desde, hacia) {
  const permitidos = TRANSICIONES_VALIDAS[desde] ?? [];
  return permitidos.includes(hacia);
}

/**
 * Devuelve los estados a los que se puede pasar desde uno dado.
 * Útil para el frontend (habilitar/deshabilitar botones).
 * @param {string} estado
 * @returns {string[]}
 */
export function siguientesEstados(estado) {
  return TRANSICIONES_VALIDAS[estado] ?? [];
}

/**
 * Indica si un estado es final (no admite más transiciones).
 * @param {string} estado
 * @returns {boolean}
 */
export function esEstadoFinal(estado) {
  return (TRANSICIONES_VALIDAS[estado] ?? []).length === 0;
}
