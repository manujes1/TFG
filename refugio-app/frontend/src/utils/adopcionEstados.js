// Copia de la tabla del backend; aquí solo decide qué botones se muestran
const TRANSICIONES_VALIDAS = {
  SOLICITADA: ['EN_REVISION', 'RECHAZADA', 'CANCELADA'],
  EN_REVISION: ['APROBADA', 'RECHAZADA', 'CANCELADA'],
  APROBADA: ['COMPLETADA', 'CANCELADA'],
  RECHAZADA: [],
  COMPLETADA: [],
  CANCELADA: []
};

export function siguientesEstados(estado) {
  return TRANSICIONES_VALIDAS[estado] ?? [];
}

export function esEstadoFinal(estado) {
  return siguientesEstados(estado).length === 0;
}

export const ACCIONES = {
  EN_REVISION: { label: 'Pasar a revisión', estilo: 'neutro' },
  APROBADA: { label: 'Aprobar', estilo: 'primario' },
  COMPLETADA: { label: 'Completar adopción', estilo: 'primario' },
  RECHAZADA: { label: 'Rechazar', estilo: 'peligro', requiereMotivo: true },
  CANCELADA: { label: 'Cancelar', estilo: 'neutro' }
};
