import { z } from 'zod';

// Esquema para registro de usuario
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

// Esquema para login
export const loginSchema = z.object({
  email: z.string().email('Email no válido').toLowerCase(),
  password: z.string().min(1, 'La contraseña es obligatoria')
});
