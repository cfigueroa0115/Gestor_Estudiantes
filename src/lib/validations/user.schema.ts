import { z } from 'zod';

/**
 * Schema de validación para crear un usuario.
 * Validates: Requirements 6.3, 11.1
 */
export const createUserSchema = z.object({
  usuario: z
    .string()
    .min(5, 'El usuario debe tener al menos 5 caracteres')
    .max(20, 'El usuario debe tener máximo 20 caracteres')
    .regex(/^\d+$/, 'El usuario debe contener solo números'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  cargo: z.enum(['Docente', 'Jefe', 'Administrativo'], {
    message: 'Seleccione un cargo válido',
  }),
  estado: z
    .enum(['Activo', 'Inactivo'], {
      message: 'El estado debe ser Activo o Inactivo',
    })
    .optional()
    .default('Activo'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Schema de validación para actualizar un usuario.
 * Validates: Requirements 6.4, 11.1
 */
export const updateUserSchema = z.object({
  cargo: z
    .enum(['Docente', 'Jefe', 'Administrativo'], {
      message: 'Seleccione un cargo válido',
    })
    .optional(),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .or(z.literal(''))
    .optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
