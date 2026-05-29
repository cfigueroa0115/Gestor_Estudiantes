import { describe, it, expect } from 'vitest';
import { createUserSchema, updateUserSchema } from '../../../src/lib/validations/user.schema';

describe('createUserSchema', () => {
  it('accepts valid user creation data', () => {
    const result = createUserSchema.safeParse({
      usuario: '12345678',
      password: 'securepass',
      cargo: 'Profesor',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estado).toBe('Activo');
    }
  });

  it('accepts explicit estado value', () => {
    const result = createUserSchema.safeParse({
      usuario: '12345678',
      password: 'securepass',
      cargo: 'Jefe',
      estado: 'Inactivo',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estado).toBe('Inactivo');
    }
  });

  it('rejects usuario shorter than 5 characters', () => {
    const result = createUserSchema.safeParse({
      usuario: '1234',
      password: 'securepass',
      cargo: 'Profesor',
    });
    expect(result.success).toBe(false);
  });

  it('rejects usuario longer than 20 characters', () => {
    const result = createUserSchema.safeParse({
      usuario: '123456789012345678901',
      password: 'securepass',
      cargo: 'Profesor',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric usuario', () => {
    const result = createUserSchema.safeParse({
      usuario: 'abcde',
      password: 'securepass',
      cargo: 'Profesor',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = createUserSchema.safeParse({
      usuario: '12345678',
      password: 'short',
      cargo: 'Profesor',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid cargo', () => {
    const result = createUserSchema.safeParse({
      usuario: '12345678',
      password: 'securepass',
      cargo: 'Admin',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid estado', () => {
    const result = createUserSchema.safeParse({
      usuario: '12345678',
      password: 'securepass',
      cargo: 'Profesor',
      estado: 'Suspendido',
    });
    expect(result.success).toBe(false);
  });

  it('accepts usuario with exactly 5 characters', () => {
    const result = createUserSchema.safeParse({
      usuario: '12345',
      password: 'securepass',
      cargo: 'Administrativo',
    });
    expect(result.success).toBe(true);
  });

  it('accepts usuario with exactly 20 characters', () => {
    const result = createUserSchema.safeParse({
      usuario: '12345678901234567890',
      password: 'securepass',
      cargo: 'Administrativo',
    });
    expect(result.success).toBe(true);
  });
});

describe('updateUserSchema', () => {
  it('accepts empty object (no changes)', () => {
    const result = updateUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts cargo update only', () => {
    const result = updateUserSchema.safeParse({
      cargo: 'Jefe',
    });
    expect(result.success).toBe(true);
  });

  it('accepts password update only', () => {
    const result = updateUserSchema.safeParse({
      password: 'newpassword123',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty string password (means no change)', () => {
    const result = updateUserSchema.safeParse({
      password: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects password shorter than 8 characters (non-empty)', () => {
    const result = updateUserSchema.safeParse({
      password: 'short',
    });
    expect(result.success).toBe(false);
  });

  it('accepts both cargo and password', () => {
    const result = updateUserSchema.safeParse({
      cargo: 'Administrativo',
      password: 'newpassword123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid cargo', () => {
    const result = updateUserSchema.safeParse({
      cargo: 'SuperAdmin',
    });
    expect(result.success).toBe(false);
  });
});
