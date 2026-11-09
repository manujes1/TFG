// Transiciones permitidas entre estados de una solicitud
const TRANSICIONES_VALIDAS = {
  SOLICITADA: ['EN_REVISION', 'RECHAZADA', 'CANCELADA'],
  EN_REVISION: ['APROBADA', 'RECHAZADA', 'CANCELADA'],
  APROBADA: ['COMPLETADA', 'CANCELADA'],
  RECHAZADA: [],
  COMPLETADA: [],
  CANCELADA: []
};

export function transicionValida(desde, hacia) {
  const permitidos = TRANSICIONES_VALIDAS[desde] ?? [];
  return permitidos.includes(hacia);
}

export function siguientesEstados(estado) {
  return TRANSICIONES_VALIDAS[estado] ?? [];
}

export function esEstadoFinal(estado) {
  return (TRANSICIONES_VALIDAS[estado] ?? []).length === 0;
}
