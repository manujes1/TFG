
export function formatFecha(fecha, conHora = false) {
  if (!fecha) return '—';
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return '—';

  const opciones = { day: '2-digit', month: 'short', year: 'numeric' };
  if (conHora) {
    opciones.hour = '2-digit';
    opciones.minute = '2-digit';
  }
  return d.toLocaleDateString('es-ES', opciones);
}

// Prisma devuelve los Decimal como string
export function formatEuros(cantidad) {
  if (cantidad == null) return '—';
  const num = typeof cantidad === 'string' ? parseFloat(cantidad) : cantidad;
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(num);
}

export function formatPeso(peso) {
  if (peso == null) return null;
  const num = typeof peso === 'string' ? parseFloat(peso) : peso;
  if (Number.isNaN(num)) return null;
  return `${num} kg`;
}
