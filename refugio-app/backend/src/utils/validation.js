import { z } from 'zod';

// =========================================
// Auth
// =========================================

export const registerSchema = z.object({
  email: z.string().email('Email no válido').toLowerCase(),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña es demasiado larga'),
  nombre: z.string().min(2, 'El nombre es obligatorio').max(50),
  apellidos: z.string().max(100).optional(),
  telefono: z.string().max(20).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Email no válido').toLowerCase(),
  password: z.string().min(1, 'La contraseña es obligatoria')
});

// =========================================
// Animales
// =========================================

const especieEnum = z.enum(['PERRO', 'GATO', 'OTRO']);
const sexoEnum = z.enum(['MACHO', 'HEMBRA']);
const estadoAnimalEnum = z.enum([
  'DISPONIBLE',
  'EN_ACOGIDA',
  'ADOPTADO',
  'EN_TRATAMIENTO',
  'NO_DISPONIBLE'
]);

export const createAnimalSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(50),
  especie: especieEnum,
  raza: z.string().max(50).optional(),
  sexo: sexoEnum,
  fechaNacimiento: z.coerce.date().optional(),
  edadEstimada: z.number().int().min(0).max(40).optional(),
  peso: z.number().positive().max(200).optional(),
  color: z.string().max(50).optional(),
  chip: z.string().max(30).optional(),
  estado: estadoAnimalEnum.optional(),
  descripcionManual: z.string().max(2000).optional(),
  ubicacion: z.string().max(50).optional(),
  caracteristicas: z.record(z.string(), z.any()).optional()
});

export const updateAnimalSchema = createAnimalSchema.partial();

export const listAnimalesQuerySchema = z.object({
  especie: especieEnum.optional(),
  sexo: sexoEnum.optional(),
  estado: estadoAnimalEnum.optional(),
  search: z.string().max(50).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

// =========================================
// Expedientes médicos
// =========================================

const tipoExpedienteEnum = z.enum([
  'VACUNA',
  'DESPARASITACION',
  'CIRUGIA',
  'REVISION',
  'TRATAMIENTO'
]);

export const createExpedienteSchema = z.object({
  tipo: tipoExpedienteEnum,
  descripcion: z.string().min(1, 'La descripción es obligatoria').max(2000),
  veterinario: z.string().max(100).optional(),
  fecha: z.coerce.date(),
  proximaRevision: z.coerce.date().optional(),
  documentos: z.array(z.string().url()).optional()
});

export const updateExpedienteSchema = createExpedienteSchema.partial();

// =========================================
// Adopciones
// =========================================

export const estadoAdopcionEnum = z.enum([
  'SOLICITADA',
  'EN_REVISION',
  'APROBADA',
  'RECHAZADA',
  'COMPLETADA',
  'CANCELADA'
]);

export const createAdopcionSchema = z.object({
  animalId: z.string().uuid('animalId debe ser un UUID válido'),
  notas: z.string().max(1000).optional()
});

export const updateEstadoAdopcionSchema = z.object({
  estado: estadoAdopcionEnum,
  motivoRechazo: z.string().max(1000).optional(),
  notas: z.string().max(1000).optional()
});

export const listAdopcionesQuerySchema = z.object({
  estado: estadoAdopcionEnum.optional(),
  animalId: z.string().uuid().optional(),
  usuarioId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

// =========================================
// Apadrinamientos
// =========================================

const tipoApadrinamientoEnum = z.enum(['MENSUAL', 'PUNTUAL']);
const estadoApadrinamientoEnum = z.enum(['ACTIVO', 'CANCELADO', 'FINALIZADO']);

export const createApadrinamientoSchema = z.object({
  animalId: z.string().uuid('animalId debe ser un UUID válido'),
  tipo: tipoApadrinamientoEnum,
  cantidad: z.number().positive('La cantidad debe ser positiva').max(10000)
});

export const listApadrinamientosQuerySchema = z.object({
  estado: estadoApadrinamientoEnum.optional(),
  animalId: z.string().uuid().optional(),
  usuarioId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

// =========================================
// Donaciones
// =========================================

export const createDonacionSchema = z.object({
  cantidad: z.number().positive('La cantidad debe ser positiva').max(100000),
  concepto: z.string().max(200).optional(),
  metodoPago: z.string().max(50).optional(),
  // Opcional: si viene, marca al usuario donante; si no, es anónima
  usuarioId: z.string().uuid().optional()
});

export const listDonacionesQuerySchema = z.object({
  usuarioId: z.string().uuid().optional(),
  desde: z.coerce.date().optional(),
  hasta: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

// =========================================
// IA
// =========================================

export const generarDescripcionSchema = z.object({
  guardar: z.boolean().optional().default(false)
});

// =========================================
// Perfil del adoptante
// =========================================

export const perfilAdoptanteSchema = z.object({
  tipoVivienda: z.enum(['piso', 'casa']),
  metrosCuadrados: z.number().int().min(10).max(2000).optional(),
  jardin: z.boolean(),
  ninos: z.boolean(),
  otrosPerros: z.boolean(),
  otrosGatos: z.boolean(),
  experiencia: z.enum(['ninguna', 'baja', 'media', 'alta']),
  tiempoDiario: z.enum(['poco', 'medio', 'mucho']),
  preferenciaEspecie: z.enum(['PERRO', 'GATO', 'indiferente'])
});

export const recomendacionesQuerySchema = z.object({
  limite: z.coerce.number().int().min(1).max(50).default(10),
  minimo: z.coerce.number().int().min(0).max(100).default(0)
});

export const preferenciasTextoSchema = z.object({
  texto: z
    .string()
    .min(10, 'Cuéntanos un poco más sobre lo que buscas (mínimo 10 caracteres)')
    .max(1000, 'El texto es demasiado largo (máximo 1000 caracteres)')
});
