/**
 * Espejo de la máquina de estados definida en el backend
 * (backend/src/utils/adopcionEstados.js).
 *
 * Se usa únicamente para decidir qué acciones mostrar en la interfaz.
 * La validación real y vinculante la hace el backend: si el cliente
 * enviara una transición inválida, la API la rechazaría con un 400.
 *
 * DEUDA CONOCIDA: esta tabla está duplicada. La alternativa sería que
 * el backend devolviese los siguientes estados posibles junto con cada
 * adopción, eliminando la duplicación.
 */
const TRANSICIONES_VALIDAS = {
  SOLICITADA: ['EN_REVISION', 'RECHAZADA', 'CANCELADA'],
  EN_REVISION: ['APROBADA', 'RECHAZADA', 'CANCELADA'],
  APROBADA: ['COMPLETADA', 'CANCELADA'],
  RECHAZADA: [],
  COMPLETADA: [],
  CANCELADA: []
};

/**
 * Estados a los que se puede pasar desde uno dado.
 */
export function siguientesEstados(estado) {
  return TRANSICIONES_VALIDAS[estado] ?? [];
}

/**
 * Indica si un estado es final (no admite más cambios).
 */
export function esEstadoFinal(estado) {
  return siguientesEstados(estado).length === 0;
}

/**
 * Metadatos de presentación para cada acción de transición.
 */
export const ACCIONES = {
  EN_REVISION: { label: 'Pasar a revisión', estilo: 'neutro' },
  APROBADA: { label: 'Aprobar', estilo: 'primario' },
  COMPLETADA: { label: 'Completar adopción', estilo: 'primario' },
  RECHAZADA: { label: 'Rechazar', estilo: 'peligro', requiereMotivo: true },
  CANCELADA: { label: 'Cancelar', estilo: 'neutro' }
};
