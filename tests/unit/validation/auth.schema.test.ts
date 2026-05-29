import { describe, it, expect } from 'vitest';
import { loginSchema } from '../../../src/lib/validations/auth.schema';

describe('loginSchema', () => {
  it('accepts valid login data', () => {
    const result = loginSchema.safeParse({
      usuario: '1129564302',
      contrasena: 'password123',
      cargo: 'Profesor',
    });
    expect(result.success).toBe(true);
  });

  it('accepts all valid cargo values', () => {
    for (const cargo of ['Profesor', 'Jefe', 'Administrativo']) {
      const result = loginSchema.safeParse({
        usuario: '12345',
        contrasena: 'pass',
        cargo,
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects non-numeric usuario', () => {
    const result = loginSchema.safeParse({
      usuario: 'abc123',
      contrasena: 'password',
      cargo: 'Profesor',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty usuario', () => {
    const result = loginSchema.safeParse({
      usuario: '',
      contrasena: 'password',
      cargo: 'Profesor',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty contrasena', () => {
    const result = loginSchema.safeParse({
      usuario: '12345',
      contrasena: '',
      cargo: 'Profesor',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid cargo', () => {
    const result = loginSchema.safeParse({
      usuario: '12345',
      contrasena: 'password',
      cargo: 'InvalidCargo',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing fields', () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
