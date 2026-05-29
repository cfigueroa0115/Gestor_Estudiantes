import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';

// Mock next/headers cookies()
const mockCookiesGet = vi.fn();
vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve({ get: mockCookiesGet }),
}));

// Mock Prisma
const mockFindUnique = vi.fn();
const mockUpdate = vi.fn();

vi.mock('../../../src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

// Mock auth functions
const mockGetSessionFromCookie = vi.fn();
const mockHashPassword = vi.fn();

vi.mock('../../../src/lib/auth', () => ({
  getSessionFromCookie: (...args: unknown[]) => mockGetSessionFromCookie(...args),
  hashPassword: (...args: unknown[]) => mockHashPassword(...args),
}));

// Set JWT_SECRET for tests
beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-key-for-unit-tests-minimum-length';
});

afterAll(() => {
  delete process.env.JWT_SECRET;
});

beforeEach(() => {
  vi.clearAllMocks();
});

// Helper to call the PATCH handler
async function callEditUser(id: string, body: Record<string, unknown>) {
  const { PATCH } = await import('../../../src/app/api/users/[id]/route');
  const request = new Request(`http://localhost:3000/api/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const { NextRequest } = await import('next/server');
  const nextReq = new NextRequest(request);
  return PATCH(nextReq, { params: Promise.resolve({ id }) });
}

describe('PATCH /api/users/[id]', () => {
  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockGetSessionFromCookie.mockResolvedValue(null);

      const response = await callEditUser('some-uuid', { cargo: 'Jefe' });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('No autenticado');
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      mockGetSessionFromCookie.mockResolvedValue({
        id: 'auth-user-uuid',
        usuario: '1129564302',
        cargo: 'Profesor',
      });
    });

    it('should return 400 when cargo is invalid', async () => {
      const response = await callEditUser('some-uuid', { cargo: 'InvalidCargo' });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Error de validación');
      expect(data.fields).toBeDefined();
    });

    it('should return 400 when password is too short (non-empty)', async () => {
      const response = await callEditUser('some-uuid', { password: 'short' });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.fields.password).toBeDefined();
    });
  });

  describe('User Not Found', () => {
    beforeEach(() => {
      mockGetSessionFromCookie.mockResolvedValue({
        id: 'auth-user-uuid',
        usuario: '1129564302',
        cargo: 'Profesor',
      });
    });

    it('should return 404 when user does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);

      const response = await callEditUser('non-existent-uuid', { cargo: 'Jefe' });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Usuario no encontrado');
    });
  });

  describe('Successful Edit', () => {
    const existingUser = {
      id: 'target-user-uuid',
      usuario: '12345678',
      password_hash: '$2a$12$existinghash',
      cargo: 'Profesor',
      estado: 'Activo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      disabled_at: null,
      last_login_at: null,
      failed_attempts: 0,
      locked_until: null,
      created_by: 'creator-uuid',
      updated_by: null,
    };

    beforeEach(() => {
      mockGetSessionFromCookie.mockResolvedValue({
        id: 'auth-user-uuid',
        usuario: '1129564302',
        cargo: 'Profesor',
      });
      mockFindUnique.mockResolvedValue(existingUser);
    });

    it('should update cargo successfully', async () => {
      const updatedUser = { ...existingUser, cargo: 'Jefe', updated_by: 'auth-user-uuid' };
      mockUpdate.mockResolvedValue(updatedUser);

      const response = await callEditUser('target-user-uuid', { cargo: 'Jefe' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.cargo).toBe('Jefe');
      expect(data.updated_by).toBe('auth-user-uuid');
    });

    it('should update password when non-empty', async () => {
      mockHashPassword.mockResolvedValue('$2a$12$newhash');
      const updatedUser = { ...existingUser, password_hash: '$2a$12$newhash', updated_by: 'auth-user-uuid' };
      mockUpdate.mockResolvedValue(updatedUser);

      const response = await callEditUser('target-user-uuid', { password: 'newPassword123' });

      expect(response.status).toBe(200);
      expect(mockHashPassword).toHaveBeenCalledWith('newPassword123');
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'target-user-uuid' },
        data: expect.objectContaining({
          password_hash: '$2a$12$newhash',
          updated_by: 'auth-user-uuid',
        }),
      });
    });

    it('should preserve password_hash when password is empty string', async () => {
      const updatedUser = { ...existingUser, updated_by: 'auth-user-uuid' };
      mockUpdate.mockResolvedValue(updatedUser);

      await callEditUser('target-user-uuid', { password: '' });

      expect(mockHashPassword).not.toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'target-user-uuid' },
        data: expect.not.objectContaining({
          password_hash: expect.anything(),
        }),
      });
    });

    it('should preserve password_hash when password is not provided', async () => {
      const updatedUser = { ...existingUser, cargo: 'Administrativo', updated_by: 'auth-user-uuid' };
      mockUpdate.mockResolvedValue(updatedUser);

      await callEditUser('target-user-uuid', { cargo: 'Administrativo' });

      expect(mockHashPassword).not.toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'target-user-uuid' },
        data: expect.not.objectContaining({
          password_hash: expect.anything(),
        }),
      });
    });

    it('should not include password_hash in response', async () => {
      const updatedUser = { ...existingUser, cargo: 'Jefe', updated_by: 'auth-user-uuid' };
      mockUpdate.mockResolvedValue(updatedUser);

      const response = await callEditUser('target-user-uuid', { cargo: 'Jefe' });
      const data = await response.json();

      expect(data.password_hash).toBeUndefined();
    });

    it('should always set updated_by to authenticated user id', async () => {
      const updatedUser = { ...existingUser, cargo: 'Jefe', updated_by: 'auth-user-uuid' };
      mockUpdate.mockResolvedValue(updatedUser);

      await callEditUser('target-user-uuid', { cargo: 'Jefe' });

      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'target-user-uuid' },
        data: expect.objectContaining({
          updated_by: 'auth-user-uuid',
        }),
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockGetSessionFromCookie.mockResolvedValue({
        id: 'auth-user-uuid',
        usuario: '1129564302',
        cargo: 'Profesor',
      });
      mockFindUnique.mockResolvedValue({ id: 'target-user-uuid' });
    });

    it('should return 500 with generic error on unexpected exceptions', async () => {
      mockUpdate.mockRejectedValue(new Error('DB connection failed'));

      const response = await callEditUser('target-user-uuid', { cargo: 'Jefe' });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Ha ocurrido un error interno. Intente nuevamente.');
    });
  });
});
