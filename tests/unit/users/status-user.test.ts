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

vi.mock('../../../src/lib/auth', () => ({
  getSessionFromCookie: (...args: unknown[]) => mockGetSessionFromCookie(...args),
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
async function callStatusUpdate(id: string, body: Record<string, unknown>) {
  const { PATCH } = await import('../../../src/app/api/users/[id]/status/route');
  const request = new Request(`http://localhost:3000/api/users/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const { NextRequest } = await import('next/server');
  const nextReq = new NextRequest(request);
  return PATCH(nextReq, { params: Promise.resolve({ id }) });
}

describe('PATCH /api/users/[id]/status', () => {
  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockGetSessionFromCookie.mockResolvedValue(null);

      const response = await callStatusUpdate('some-uuid', { estado: 'Inactivo' });
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

    it('should return 400 when estado is missing', async () => {
      const response = await callStatusUpdate('some-uuid', {});
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Error de validación');
      expect(data.fields).toBeDefined();
    });

    it('should return 400 when estado is invalid', async () => {
      const response = await callStatusUpdate('some-uuid', { estado: 'Suspendido' });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.fields.estado).toBeDefined();
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

      const response = await callStatusUpdate('non-existent-uuid', { estado: 'Inactivo' });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Usuario no encontrado');
    });
  });

  describe('Deactivate User', () => {
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

    it('should set estado to Inactivo and disabled_at to current time', async () => {
      const now = new Date();
      const updatedUser = {
        ...existingUser,
        estado: 'Inactivo',
        disabled_at: now.toISOString(),
        updated_by: 'auth-user-uuid',
      };
      mockUpdate.mockResolvedValue(updatedUser);

      const response = await callStatusUpdate('target-user-uuid', { estado: 'Inactivo' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.estado).toBe('Inactivo');
      expect(data.disabled_at).toBeDefined();
      expect(data.updated_by).toBe('auth-user-uuid');

      // Verify the update call
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'target-user-uuid' },
        data: expect.objectContaining({
          estado: 'Inactivo',
          disabled_at: expect.any(Date),
          updated_by: 'auth-user-uuid',
        }),
      });
    });

    it('should not include password_hash in response', async () => {
      const updatedUser = {
        ...existingUser,
        estado: 'Inactivo',
        disabled_at: new Date().toISOString(),
        updated_by: 'auth-user-uuid',
      };
      mockUpdate.mockResolvedValue(updatedUser);

      const response = await callStatusUpdate('target-user-uuid', { estado: 'Inactivo' });
      const data = await response.json();

      expect(data.password_hash).toBeUndefined();
    });
  });

  describe('Reactivate User', () => {
    const inactiveUser = {
      id: 'target-user-uuid',
      usuario: '12345678',
      password_hash: '$2a$12$existinghash',
      cargo: 'Profesor',
      estado: 'Inactivo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      disabled_at: new Date().toISOString(),
      last_login_at: null,
      failed_attempts: 0,
      locked_until: null,
      created_by: 'creator-uuid',
      updated_by: 'prev-updater-uuid',
    };

    beforeEach(() => {
      mockGetSessionFromCookie.mockResolvedValue({
        id: 'auth-user-uuid',
        usuario: '1129564302',
        cargo: 'Profesor',
      });
      mockFindUnique.mockResolvedValue(inactiveUser);
    });

    it('should set estado to Activo and disabled_at to null', async () => {
      const updatedUser = {
        ...inactiveUser,
        estado: 'Activo',
        disabled_at: null,
        updated_by: 'auth-user-uuid',
      };
      mockUpdate.mockResolvedValue(updatedUser);

      const response = await callStatusUpdate('target-user-uuid', { estado: 'Activo' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.estado).toBe('Activo');
      expect(data.disabled_at).toBeNull();
      expect(data.updated_by).toBe('auth-user-uuid');

      // Verify the update call
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 'target-user-uuid' },
        data: expect.objectContaining({
          estado: 'Activo',
          disabled_at: null,
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

      const response = await callStatusUpdate('target-user-uuid', { estado: 'Inactivo' });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Ha ocurrido un error interno. Intente nuevamente.');
    });
  });
});
