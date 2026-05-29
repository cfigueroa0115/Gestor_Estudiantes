import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import { hashPassword } from '../../../src/lib/auth';

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

// Helper to create a mock user
async function createMockUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'uuid-123',
    usuario: '1129564302',
    password_hash: await hashPassword('Lifl172023Cf'),
    cargo: 'Profesor',
    estado: 'Activo',
    failed_attempts: 0,
    locked_until: null,
    last_login_at: null,
    ...overrides,
  };
}

// Helper to call the POST handler
async function callLogin(body: Record<string, unknown>) {
  // Dynamic import to ensure mocks are applied
  const { POST } = await import('../../../src/app/api/auth/login/route');
  const request = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  // NextRequest wraps Request
  const { NextRequest } = await import('next/server');
  const nextReq = new NextRequest(request);
  return POST(nextReq);
}

describe('POST /api/auth/login', () => {
  describe('Validation', () => {
    it('should return 400 when body is missing required fields', async () => {
      const response = await callLogin({});
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('should return 400 when usuario is empty', async () => {
      const response = await callLogin({
        usuario: '',
        contrasena: 'password123',
        cargo: 'Profesor',
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 400 when usuario contains non-numeric characters', async () => {
      const response = await callLogin({
        usuario: 'abc123',
        contrasena: 'password123',
        cargo: 'Profesor',
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should return 400 when cargo is invalid', async () => {
      const response = await callLogin({
        usuario: '1129564302',
        contrasena: 'password123',
        cargo: 'InvalidCargo',
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('Authentication - Success', () => {
    it('should return 200 with success true on valid credentials', async () => {
      const user = await createMockUser();
      mockFindUnique.mockResolvedValue(user);
      mockUpdate.mockResolvedValue(user);

      const response = await callLogin({
        usuario: '1129564302',
        contrasena: 'Lifl172023Cf',
        cargo: 'Profesor',
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should set session cookie on successful login', async () => {
      const user = await createMockUser();
      mockFindUnique.mockResolvedValue(user);
      mockUpdate.mockResolvedValue(user);

      const response = await callLogin({
        usuario: '1129564302',
        contrasena: 'Lifl172023Cf',
        cargo: 'Profesor',
      });

      const setCookie = response.headers.get('set-cookie');
      expect(setCookie).toBeDefined();
      expect(setCookie).toContain('session=');
    });

    it('should reset failed_attempts and update last_login_at on success', async () => {
      const user = await createMockUser({ failed_attempts: 3 });
      mockFindUnique.mockResolvedValue(user);
      mockUpdate.mockResolvedValue(user);

      await callLogin({
        usuario: '1129564302',
        contrasena: 'Lifl172023Cf',
        cargo: 'Profesor',
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'uuid-123' },
          data: expect.objectContaining({
            failed_attempts: 0,
            locked_until: null,
          }),
        })
      );
    });
  });

  describe('Authentication - Failure (User Enumeration Prevention)', () => {
    it('should return generic error when user does not exist', async () => {
      mockFindUnique.mockResolvedValue(null);

      const response = await callLogin({
        usuario: '9999999999',
        contrasena: 'password123',
        cargo: 'Profesor',
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Credenciales inválidas');
    });

    it('should return generic error when password is wrong', async () => {
      const user = await createMockUser();
      mockFindUnique.mockResolvedValue(user);
      mockUpdate.mockResolvedValue(user);

      const response = await callLogin({
        usuario: '1129564302',
        contrasena: 'WrongPassword',
        cargo: 'Profesor',
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Credenciales inválidas');
    });

    it('should return generic error when cargo does not match', async () => {
      const user = await createMockUser({ cargo: 'Profesor' });
      mockFindUnique.mockResolvedValue(user);
      mockUpdate.mockResolvedValue(user);

      const response = await callLogin({
        usuario: '1129564302',
        contrasena: 'Lifl172023Cf',
        cargo: 'Jefe',
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Credenciales inválidas');
    });

    it('should return generic error when user is inactive', async () => {
      const user = await createMockUser({ estado: 'Inactivo' });
      mockFindUnique.mockResolvedValue(user);
      mockUpdate.mockResolvedValue(user);

      const response = await callLogin({
        usuario: '1129564302',
        contrasena: 'Lifl172023Cf',
        cargo: 'Profesor',
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Credenciales inválidas');
    });

    it('should return identical error messages for all failure types', async () => {
      // Non-existent user
      mockFindUnique.mockResolvedValue(null);
      const res1 = await callLogin({
        usuario: '0000000000',
        contrasena: 'pass',
        cargo: 'Profesor',
      });
      const data1 = await res1.json();

      // Wrong password
      const user = await createMockUser();
      mockFindUnique.mockResolvedValue(user);
      mockUpdate.mockResolvedValue(user);
      const res2 = await callLogin({
        usuario: '1129564302',
        contrasena: 'WrongPass',
        cargo: 'Profesor',
      });
      const data2 = await res2.json();

      // Wrong cargo
      mockFindUnique.mockResolvedValue(user);
      const res3 = await callLogin({
        usuario: '1129564302',
        contrasena: 'Lifl172023Cf',
        cargo: 'Administrativo',
      });
      const data3 = await res3.json();

      // All should have the same error message
      expect(data1.error).toBe(data2.error);
      expect(data2.error).toBe(data3.error);
      expect(data1.error).toBe('Credenciales inválidas');
    });
  });

  describe('Account Lockout', () => {
    it('should return locked error when account is locked', async () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000); // 10 min from now
      const user = await createMockUser({
        locked_until: futureDate,
        failed_attempts: 5,
      });
      mockFindUnique.mockResolvedValue(user);

      const response = await callLogin({
        usuario: '1129564302',
        contrasena: 'Lifl172023Cf',
        cargo: 'Profesor',
      });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Cuenta bloqueada temporalmente. Intente en 15 minutos.');
    });

    it('should allow login when lock has expired', async () => {
      const pastDate = new Date(Date.now() - 1000); // 1 second ago
      const user = await createMockUser({
        locked_until: pastDate,
        failed_attempts: 5,
      });
      mockFindUnique.mockResolvedValue(user);
      mockUpdate.mockResolvedValue(user);

      const response = await callLogin({
        usuario: '1129564302',
        contrasena: 'Lifl172023Cf',
        cargo: 'Profesor',
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should increment failed_attempts on failed login', async () => {
      const user = await createMockUser({ failed_attempts: 2 });
      mockFindUnique.mockResolvedValue(user);
      mockUpdate.mockResolvedValue(user);

      await callLogin({
        usuario: '1129564302',
        contrasena: 'WrongPassword',
        cargo: 'Profesor',
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failed_attempts: 3,
          }),
        })
      );
    });

    it('should lock account after 5 failed attempts', async () => {
      const user = await createMockUser({ failed_attempts: 4 });
      mockFindUnique.mockResolvedValue(user);
      mockUpdate.mockResolvedValue(user);

      await callLogin({
        usuario: '1129564302',
        contrasena: 'WrongPassword',
        cargo: 'Profesor',
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            failed_attempts: 5,
            locked_until: expect.any(Date),
          }),
        })
      );
    });

    it('should not set locked_until when failed_attempts < 5', async () => {
      const user = await createMockUser({ failed_attempts: 2 });
      mockFindUnique.mockResolvedValue(user);
      mockUpdate.mockResolvedValue(user);

      await callLogin({
        usuario: '1129564302',
        contrasena: 'WrongPassword',
        cargo: 'Profesor',
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            failed_attempts: 3,
          },
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should return 500 with generic error on unexpected exceptions', async () => {
      mockFindUnique.mockRejectedValue(new Error('DB connection failed'));

      const response = await callLogin({
        usuario: '1129564302',
        contrasena: 'password123',
        cargo: 'Profesor',
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Ha ocurrido un error interno. Intente nuevamente.');
    });
  });
});
