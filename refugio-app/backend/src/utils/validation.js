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
  search: z.string().max(50).optional(), // Búsqueda por nombre o raza
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
