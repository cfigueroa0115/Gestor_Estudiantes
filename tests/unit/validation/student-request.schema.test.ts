import { describe, it, expect } from 'vitest';
import { studentRequestSchema } from '../../../src/lib/validations/student-request.schema';

/**
 * Unit tests for student request Zod schema.
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.7, 5.8, 5.9, 5.10
 */

const validBaseData = {
  fecha_solicitud: '2024-06-15',
  id_estudiante: '1234567890',
  nombres: 'Juan Carlos',
  apellidos: 'Pérez López',
  correo: 'juan.perez@correo.com',
  celular: '3001234567',
  programa: 'Ingeniería industrial',
  modalidad: 'Presencial' as const,
  descripcion_solicitud: 'Solicito validación de materia cursada en otra universidad.',
  requiere_escalar: false,
  area_escalar: null,
};

describe('studentRequestSchema', () => {
  describe('Valid submissions', () => {
    it('should accept a valid Académico request', () => {
      const data = {
        ...validBaseData,
        tipo_solicitud: 'Académico',
        solicitud_academica: 'Validación',
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept a valid Financiero request', () => {
      const data = {
        ...validBaseData,
        tipo_solicitud: 'Financiero',
        solicitud_academica: null,
        solicitud_financiera: 'Descuento',
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept a valid Certificados request', () => {
      const data = {
        ...validBaseData,
        tipo_solicitud: 'Certificados',
        solicitud_academica: null,
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept a request with requiere_escalar=true and area_escalar set', () => {
      const data = {
        ...validBaseData,
        tipo_solicitud: 'Académico',
        solicitud_academica: 'Homologación',
        solicitud_financiera: null,
        requiere_escalar: true,
        area_escalar: 'Financiera',
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept all valid modalidad values', () => {
      for (const modalidad of ['Presencial', 'Virtual', 'Funza'] as const) {
        const data = {
          ...validBaseData,
          modalidad,
          tipo_solicitud: 'Certificados' as const,
          solicitud_academica: null,
          solicitud_financiera: null,
        };
        const result = studentRequestSchema.safeParse(data);
        expect(result.success).toBe(true);
      }
    });

    it('should accept all valid solicitud_academica options', () => {
      const options = [
        'Validación', 'Inscripción de cursos', 'Actualización de nota',
        'Campus virtual', 'Calificación', 'Nota', 'Homologación',
      ];
      for (const option of options) {
        const data = {
          ...validBaseData,
          tipo_solicitud: 'Académico',
          solicitud_academica: option,
          solicitud_financiera: null,
        };
        const result = studentRequestSchema.safeParse(data);
        expect(result.success).toBe(true);
      }
    });

    it('should accept all valid solicitud_financiera options', () => {
      const options = ['Descuento', 'Saldo', 'Pago total', 'Pago parcial'];
      for (const option of options) {
        const data = {
          ...validBaseData,
          tipo_solicitud: 'Financiero',
          solicitud_academica: null,
          solicitud_financiera: option,
        };
        const result = studentRequestSchema.safeParse(data);
        expect(result.success).toBe(true);
      }
    });

    it('should accept all valid area_escalar options', () => {
      for (const area of ['Financiera', 'Registro', 'Tesorería'] as const) {
        const data = {
          ...validBaseData,
          tipo_solicitud: 'Certificados',
          solicitud_academica: null,
          solicitud_financiera: null,
          requiere_escalar: true,
          area_escalar: area,
        };
        const result = studentRequestSchema.safeParse(data);
        expect(result.success).toBe(true);
      }
    });
  });

  describe('Required field validation', () => {
    it('should reject when fecha_solicitud is empty', () => {
      const data = {
        ...validBaseData,
        fecha_solicitud: '',
        tipo_solicitud: 'Certificados',
        solicitud_academica: null,
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject when id_estudiante is empty', () => {
      const data = {
        ...validBaseData,
        id_estudiante: '',
        tipo_solicitud: 'Certificados',
        solicitud_academica: null,
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject when nombres is empty', () => {
      const data = {
        ...validBaseData,
        nombres: '',
        tipo_solicitud: 'Certificados',
        solicitud_academica: null,
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject when correo is invalid', () => {
      const data = {
        ...validBaseData,
        correo: 'not-an-email',
        tipo_solicitud: 'Certificados',
        solicitud_academica: null,
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject when descripcion_solicitud is empty', () => {
      const data = {
        ...validBaseData,
        descripcion_solicitud: '',
        tipo_solicitud: 'Certificados',
        solicitud_academica: null,
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Field length and format validation', () => {
    it('should reject id_estudiante with more than 10 digits', () => {
      const data = {
        ...validBaseData,
        id_estudiante: '12345678901',
        tipo_solicitud: 'Certificados',
        solicitud_academica: null,
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject id_estudiante with non-numeric characters', () => {
      const data = {
        ...validBaseData,
        id_estudiante: '123abc',
        tipo_solicitud: 'Certificados',
        solicitud_academica: null,
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject nombres exceeding 100 characters', () => {
      const data = {
        ...validBaseData,
        nombres: 'A'.repeat(101),
        tipo_solicitud: 'Certificados',
        solicitud_academica: null,
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject apellidos exceeding 100 characters', () => {
      const data = {
        ...validBaseData,
        apellidos: 'B'.repeat(101),
        tipo_solicitud: 'Certificados',
        solicitud_academica: null,
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject celular with more than 15 digits', () => {
      const data = {
        ...validBaseData,
        celular: '1234567890123456',
        tipo_solicitud: 'Certificados',
        solicitud_academica: null,
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject celular with non-numeric characters', () => {
      const data = {
        ...validBaseData,
        celular: '300-123-4567',
        tipo_solicitud: 'Certificados',
        solicitud_academica: null,
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject descripcion_solicitud exceeding 1200 characters', () => {
      const data = {
        ...validBaseData,
        descripcion_solicitud: 'X'.repeat(1201),
        tipo_solicitud: 'Certificados',
        solicitud_academica: null,
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid fecha_solicitud format', () => {
      const data = {
        ...validBaseData,
        fecha_solicitud: '15/06/2024',
        tipo_solicitud: 'Certificados',
        solicitud_academica: null,
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Conditional validation - tipo_solicitud', () => {
    it('should reject Académico without solicitud_academica', () => {
      const data = {
        ...validBaseData,
        tipo_solicitud: 'Académico',
        solicitud_academica: null,
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join('.'));
        expect(paths).toContain('solicitud_academica');
      }
    });

    it('should reject Académico with solicitud_financiera set', () => {
      const data = {
        ...validBaseData,
        tipo_solicitud: 'Académico',
        solicitud_academica: 'Validación',
        solicitud_financiera: 'Descuento',
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join('.'));
        expect(paths).toContain('solicitud_financiera');
      }
    });

    it('should reject Financiero without solicitud_financiera', () => {
      const data = {
        ...validBaseData,
        tipo_solicitud: 'Financiero',
        solicitud_academica: null,
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join('.'));
        expect(paths).toContain('solicitud_financiera');
      }
    });

    it('should reject Financiero with solicitud_academica set', () => {
      const data = {
        ...validBaseData,
        tipo_solicitud: 'Financiero',
        solicitud_academica: 'Nota',
        solicitud_financiera: 'Saldo',
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join('.'));
        expect(paths).toContain('solicitud_academica');
      }
    });

    it('should reject Certificados with solicitud_academica set', () => {
      const data = {
        ...validBaseData,
        tipo_solicitud: 'Certificados',
        solicitud_academica: 'Validación',
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject Certificados with solicitud_financiera set', () => {
      const data = {
        ...validBaseData,
        tipo_solicitud: 'Certificados',
        solicitud_academica: null,
        solicitud_financiera: 'Descuento',
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Conditional validation - requiere_escalar', () => {
    it('should reject requiere_escalar=true without area_escalar', () => {
      const data = {
        ...validBaseData,
        tipo_solicitud: 'Certificados',
        solicitud_academica: null,
        solicitud_financiera: null,
        requiere_escalar: true,
        area_escalar: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join('.'));
        expect(paths).toContain('area_escalar');
      }
    });

    it('should reject requiere_escalar=false with area_escalar set', () => {
      const data = {
        ...validBaseData,
        tipo_solicitud: 'Certificados',
        solicitud_academica: null,
        solicitud_financiera: null,
        requiere_escalar: false,
        area_escalar: 'Financiera',
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path.join('.'));
        expect(paths).toContain('area_escalar');
      }
    });

    it('should accept requiere_escalar=false with area_escalar=null', () => {
      const data = {
        ...validBaseData,
        tipo_solicitud: 'Certificados',
        solicitud_academica: null,
        solicitud_financiera: null,
        requiere_escalar: false,
        area_escalar: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid enum values', () => {
    it('should reject invalid modalidad', () => {
      const data = {
        ...validBaseData,
        modalidad: 'Nocturno',
        tipo_solicitud: 'Certificados',
        solicitud_academica: null,
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid tipo_solicitud', () => {
      const data = {
        ...validBaseData,
        tipo_solicitud: 'Otro',
        solicitud_academica: null,
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid solicitud_academica option', () => {
      const data = {
        ...validBaseData,
        tipo_solicitud: 'Académico',
        solicitud_academica: 'Opción inválida',
        solicitud_financiera: null,
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid area_escalar option', () => {
      const data = {
        ...validBaseData,
        tipo_solicitud: 'Certificados',
        solicitud_academica: null,
        solicitud_financiera: null,
        requiere_escalar: true,
        area_escalar: 'Recursos Humanos',
      };
      const result = studentRequestSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
