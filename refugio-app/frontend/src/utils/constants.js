/**
 * Espejo de los enums definidos en el schema de Prisma.
 * Se mantienen sincronizados manualmente con el backend.
 */

export const ESPECIES = {
  PERRO: 'Perro',
  GATO: 'Gato',
  OTRO: 'Otro'
};

export const SEXOS = {
  MACHO: 'Macho',
  HEMBRA: 'Hembra'
};

export const ESTADOS_ANIMAL = {
  DISPONIBLE: 'Disponible',
  EN_ACOGIDA: 'En acogida',
  ADOPTADO: 'Adoptado',
  EN_TRATAMIENTO: 'En tratamiento',
  NO_DISPONIBLE: 'No disponible'
};

/**
 * Clases de Tailwind para el badge de cada estado.
 */
export const ESTADO_ANIMAL_COLORES = {
  DISPONIBLE: 'bg-green-100 text-green-800',
  EN_ACOGIDA: 'bg-blue-100 text-blue-800',
  ADOPTADO: 'bg-gray-100 text-gray-700',
  EN_TRATAMIENTO: 'bg-amber-100 text-amber-800',
  NO_DISPONIBLE: 'bg-red-100 text-red-800'
};

export const ESTADOS_ADOPCION = {
  SOLICITADA: 'Solicitada',
  EN_REVISION: 'En revisión',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada'
};

export const ESTADO_ADOPCION_COLORES = {
  SOLICITADA: 'bg-blue-100 text-blue-800',
  EN_REVISION: 'bg-amber-100 text-amber-800',
  APROBADA: 'bg-green-100 text-green-800',
  RECHAZADA: 'bg-red-100 text-red-800',
  COMPLETADA: 'bg-refugio-100 text-refugio-700',
  CANCELADA: 'bg-gray-100 text-gray-700'
};

/**
 * URL base del backend, para construir rutas de imágenes.
 */
export const API_URL = import.meta.env.VITE_API_URL;

/**
 * Construye la URL completa de una foto a partir de la ruta relativa
 * que guarda el backend (/uploads/xxx.jpg).
 */
export function fotoUrl(rutaRelativa) {
  if (!rutaRelativa) return null;
  return `${API_URL}${rutaRelativa}`;
}
