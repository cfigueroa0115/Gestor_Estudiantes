import { z } from 'zod';

/**
 * Opciones válidas para solicitud académica.
 */
const SOLICITUD_ACADEMICA_OPTIONS = [
  'Validación',
  'Inscripción de cursos',
  'Actualización de nota',
  'Campus virtual',
  'Calificación',
  'Nota',
  'Homologación',
] as const;

/**
 * Opciones válidas para solicitud financiera.
 */
const SOLICITUD_FINANCIERA_OPTIONS = [
  'Descuento',
  'Saldo',
  'Pago total',
  'Pago parcial',
] as const;

/**
 * Opciones válidas para área a escalar.
 */
const AREA_ESCALAR_OPTIONS = [
  'Financiera',
  'Registro',
  'Tesorería',
] as const;

/**
 * Schema de validación para solicitudes estudiantiles.
 * Implementa validación condicional basada en tipo_solicitud y requiere_escalar.
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.7, 5.8, 5.9, 5.10
 */
export const studentRequestSchema = z
  .object({
    fecha_solicitud: z
      .string()
      .min(1, 'La fecha de solicitud es requerida')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha debe tener formato YYYY-MM-DD'),
    id_estudiante: z
      .string()
      .min(1, 'El ID del estudiante es requerido')
      .max(10, 'El ID del estudiante debe tener máximo 10 dígitos')
      .regex(/^\d+$/, 'El ID del estudiante debe contener solo números'),
    nro_documento: z
      .string()
      .max(20, 'El Nro. Documento debe tener máximo 20 caracteres')
      .regex(/^\d*$/, 'El Nro. Documento debe contener solo números')
      .optional()
      .nullable(),
    nombres: z
      .string()
      .min(1, 'Los nombres son requeridos')
      .max(100, 'Los nombres deben tener máximo 100 caracteres'),
    apellidos: z
      .string()
      .min(1, 'Los apellidos son requeridos')
      .max(100, 'Los apellidos deben tener máximo 100 caracteres'),
    correo: z
      .string()
      .min(1, 'El correo es requerido')
      .email('El correo debe tener un formato válido'),
    celular: z
      .string()
      .min(1, 'El celular es requerido')
      .max(15, 'El celular debe tener máximo 15 dígitos')
      .regex(/^\d+$/, 'El celular debe contener solo números'),
    programa: z
      .string()
      .min(1, 'El programa es requerido'),
    modalidad: z.enum(['Presencial', 'Virtual', 'Funza'], {
      message: 'Seleccione una modalidad válida',
    }),
    tipo_solicitud: z.enum(['Académico', 'Financiero', 'Certificados'], {
      message: 'Seleccione un tipo de solicitud válido',
    }),
    solicitud_academica: z
      .enum(SOLICITUD_ACADEMICA_OPTIONS, {
        message: 'Seleccione una solicitud académica válida',
      })
      .nullable()
      .optional(),
    solicitud_financiera: z
      .enum(SOLICITUD_FINANCIERA_OPTIONS, {
        message: 'Seleccione una solicitud financiera válida',
      })
      .nullable()
      .optional(),
    descripcion_solicitud: z
      .string()
      .min(1, 'La descripción de la solicitud es requerida')
      .max(1200, 'La descripción debe tener máximo 1200 caracteres'),
    requiere_escalar: z.boolean({
      message: 'Indique si requiere escalar',
    }),
    area_escalar: z
      .enum(AREA_ESCALAR_OPTIONS, {
        message: 'Seleccione un área a escalar válida',
      })
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Validación condicional por tipo_solicitud
    if (data.tipo_solicitud === 'Académico') {
      if (!data.solicitud_academica) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La solicitud académica es requerida cuando el tipo es Académico',
          path: ['solicitud_academica'],
        });
      }
      if (data.solicitud_financiera !== null && data.solicitud_financiera !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La solicitud financiera debe ser null cuando el tipo es Académico',
          path: ['solicitud_financiera'],
        });
      }
    } else if (data.tipo_solicitud === 'Financiero') {
      if (!data.solicitud_financiera) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La solicitud financiera es requerida cuando el tipo es Financiero',
          path: ['solicitud_financiera'],
        });
      }
      if (data.solicitud_academica !== null && data.solicitud_academica !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La solicitud académica debe ser null cuando el tipo es Financiero',
          path: ['solicitud_academica'],
        });
      }
    } else if (data.tipo_solicitud === 'Certificados') {
      if (data.solicitud_academica !== null && data.solicitud_academica !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La solicitud académica debe ser null cuando el tipo es Certificados',
          path: ['solicitud_academica'],
        });
      }
      if (data.solicitud_financiera !== null && data.solicitud_financiera !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La solicitud financiera debe ser null cuando el tipo es Certificados',
          path: ['solicitud_financiera'],
        });
      }
    }

    // Validación condicional por requiere_escalar
    if (data.requiere_escalar === true) {
      if (!data.area_escalar) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El área a escalar es requerida cuando se requiere escalar',
          path: ['area_escalar'],
        });
      }
    } else if (data.requiere_escalar === false) {
      if (data.area_escalar !== null && data.area_escalar !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'El área a escalar debe ser null cuando no se requiere escalar',
          path: ['area_escalar'],
        });
      }
    }
  });

export type StudentRequestInput = z.infer<typeof studentRequestSchema>;

