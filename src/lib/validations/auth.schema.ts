import { z } from 'zod';

/**
 * Schema de validación para el formulario de login.
 */
export const loginSchema = z.object({
  usuario: z
    .string()
    .min(1, 'El usuario es requerido')
    .regex(/^\d+$/, 'El usuario debe contener solo números'),
  contrasena: z
    .string()
    .min(1, 'La contraseña es requerida'),
  cargo: z.enum(['Profesor', 'Jefe', 'Administrativo'], {
    message: 'Seleccione un cargo válido',
  }),
  programa: z
    .string()
    .min(1, 'Seleccione un programa')
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
