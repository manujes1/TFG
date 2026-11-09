
// Deben coincidir con los enums del esquema de Prisma
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

export const ESTADO_ANIMAL_COLORES = {
  DISPONIBLE: 'bg-green-100 text-green-800',
  EN_ACOGIDA: 'bg-blue-100 text-blue-800',
  ADOPTADO: 'bg-stone-100 text-stone-700',
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
  CANCELADA: 'bg-stone-100 text-stone-700'
};

// En la base de datos el rol del personal se llama VOLUNTARIO
export const ROLES = {
  ADMIN: 'Administrador',
  VOLUNTARIO: 'Trabajador',
  ADOPTANTE: 'Adoptante'
};

export const FOTOS_URL = 'http://localhost:3004';

export function fotoUrl(rutaRelativa) {
  if (!rutaRelativa) return null;
  return `${FOTOS_URL}${rutaRelativa}`;
}

export const TIPOS_EXPEDIENTE = {
  VACUNA: { etiqueta: 'Vacuna', icono: '💉', color: 'bg-blue-100 text-blue-800' },
  DESPARASITACION: { etiqueta: 'Desparasitación', icono: '🧴', color: 'bg-teal-100 text-teal-800' },
  CIRUGIA: { etiqueta: 'Cirugía', icono: '🩹', color: 'bg-red-100 text-red-800' },
  REVISION: { etiqueta: 'Revisión', icono: '🔍', color: 'bg-stone-100 text-stone-700' },
  TRATAMIENTO: { etiqueta: 'Tratamiento', icono: '💊', color: 'bg-amber-100 text-amber-800' }
};
