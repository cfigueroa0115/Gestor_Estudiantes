import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';

// Mock next/headers cookies()
const mockCookiesGet = vi.fn();
vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve({ get: mockCookiesGet }),
}));

// Mock Prisma
const mockFindUnique = vi.fn();
const mockCreate = vi.fn();

vi.mock('../../../src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
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

// Helper to call the POST handler
async function callCreateUser(body: Record<string, unknown>) {
  const { POST } = await import('../../../src/app/api/users/route');
  const request = new Request('http://localhost:3000/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const { NextRequest } = await import('next/server');
  const nextReq = new NextRequest(request);
  return POST(nextReq);
}

describe('POST /api/users', () => {
  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockGetSessionFromCookie.mockResolvedValue(null);

      const response = await callCreateUser({
        usuario: '12345',
        password: 'password123',
        cargo: 'Docente',
      });
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
        cargo: 'Docente',
      });
    });

    it('should return 400 when body is empty', async () => {
      const response = await callCreateUser({});
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Error de validación');
      expect(data.fields).toBeDefined();
    });

    it('should return 400 when usuario is too short', async () => {
      const response = await callCreateUser({
        usuario: '1234',
        password: 'password123',
        cargo: 'Docente',
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.fields.usuario).toBeDefined();
    });

    it('should return 400 when usuario is too long', async () => {
      const response = await callCreateUser({
        usuario: '123456789012345678901',
        password: 'password123',
        cargo: 'Docente',
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.fields.usuario).toBeDefined();
    });

    it('should return 400 when usuario contains non-numeric characters', async () => {
      const response = await callCreateUser({
        usuario: 'abc12345',
        password: 'password123',
        cargo: 'Docente',
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.fields.usuario).toBeDefined();
    });

    it('should return 400 when password is too short', async () => {
      const response = await callCreateUser({
        usuario: '12345678',
        password: 'short',
        cargo: 'Docente',
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.fields.password).toBeDefined();
    });

    it('should return 400 when cargo is invalid', async () => {
      const response = await callCreateUser({
        usuario: '12345678',
        password: 'password123',
        cargo: 'InvalidCargo',
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.fields.cargo).toBeDefined();
    });
  });

  describe('Uniqueness Check', () => {
    beforeEach(() => {
      mockGetSessionFromCookie.mockResolvedValue({
        id: 'auth-user-uuid',
        usuario: '1129564302',
        cargo: 'Docente',
      });
    });

    it('should return 409 when usuario already exists', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'existing-uuid',
        usuario: '12345678',
      });

      const response = await callCreateUser({
        usuario: '12345678',
        password: 'password123',
        cargo: 'Docente',
      });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('El usuario ya existe');
    });
  });

  describe('Successful Creation', () => {
    beforeEach(() => {
      mockGetSessionFromCookie.mockResolvedValue({
        id: 'auth-user-uuid',
        usuario: '1129564302',
        cargo: 'Docente',
      });
      mockFindUnique.mockResolvedValue(null);
      mockHashPassword.mockResolvedValue('$2a$12$hashedpassword');
    });

    it('should return 201 with created user on success', async () => {
      const createdUser = {
        id: 'new-user-uuid',
        usuario: '12345678',
        password_hash: '$2a$12$hashedpassword',
        cargo: 'Docente',
        estado: 'Activo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        disabled_at: null,
        last_login_at: null,
        failed_attempts: 0,
        locked_until: null,
        created_by: 'auth-user-uuid',
        updated_by: null,
      };
      mockCreate.mockResolvedValue(createdUser);

      const response = await callCreateUser({
        usuario: '12345678',
        password: 'password123',
        cargo: 'Docente',
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('new-user-uuid');
      expect(data.usuario).toBe('12345678');
      expect(data.cargo).toBe('Docente');
      expect(data.estado).toBe('Activo');
      expect(data.created_by).toBe('auth-user-uuid');
    });

    it('should not include password_hash in response', async () => {
      const createdUser = {
        id: 'new-user-uuid',
        usuario: '12345678',
        password_hash: '$2a$12$hashedpassword',
        cargo: 'Docente',
        estado: 'Activo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        disabled_at: null,
        last_login_at: null,
        failed_attempts: 0,
        locked_until: null,
        created_by: 'auth-user-uuid',
        updated_by: null,
      };
      mockCreate.mockResolvedValue(createdUser);

      const response = await callCreateUser({
        usuario: '12345678',
        password: 'password123',
        cargo: 'Docente',
      });
      const data = await response.json();

      expect(data.password_hash).toBeUndefined();
    });

    it('should hash password before storing', async () => {
      const createdUser = {
        id: 'new-user-uuid',
        usuario: '12345678',
        password_hash: '$2a$12$hashedpassword',
        cargo: 'Jefe',
        estado: 'Activo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        disabled_at: null,
        last_login_at: null,
        failed_attempts: 0,
        locked_until: null,
        created_by: 'auth-user-uuid',
        updated_by: null,
      };
      mockCreate.mockResolvedValue(createdUser);

      await callCreateUser({
        usuario: '12345678',
        password: 'mySecurePass',
        cargo: 'Jefe',
      });

      expect(mockHashPassword).toHaveBeenCalledWith('mySecurePass');
      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          password_hash: '$2a$12$hashedpassword',
        }),
      });
    });

    it('should set created_by to authenticated user id', async () => {
      const createdUser = {
        id: 'new-user-uuid',
        usuario: '12345678',
        password_hash: '$2a$12$hashedpassword',
        cargo: 'Administrativo',
        estado: 'Activo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        disabled_at: null,
        last_login_at: null,
        failed_attempts: 0,
        locked_until: null,
        created_by: 'auth-user-uuid',
        updated_by: null,
      };
      mockCreate.mockResolvedValue(createdUser);

      await callCreateUser({
        usuario: '12345678',
        password: 'password123',
        cargo: 'Administrativo',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          created_by: 'auth-user-uuid',
        }),
      });
    });

    it('should default estado to Activo when not provided', async () => {
      const createdUser = {
        id: 'new-user-uuid',
        usuario: '12345678',
        password_hash: '$2a$12$hashedpassword',
        cargo: 'Docente',
        estado: 'Activo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        disabled_at: null,
        last_login_at: null,
        failed_attempts: 0,
        locked_until: null,
        created_by: 'auth-user-uuid',
        updated_by: null,
      };
      mockCreate.mockResolvedValue(createdUser);

      await callCreateUser({
        usuario: '12345678',
        password: 'password123',
        cargo: 'Docente',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          estado: 'Activo',
        }),
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockGetSessionFromCookie.mockResolvedValue({
        id: 'auth-user-uuid',
        usuario: '1129564302',
        cargo: 'Docente',
      });
    });

    it('should return 500 with generic error on unexpected exceptions', async () => {
      mockFindUnique.mockRejectedValue(new Error('DB connection failed'));

      const response = await callCreateUser({
        usuario: '12345678',
        password: 'password123',
        cargo: 'Docente',
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Ha ocurrido un error interno. Intente nuevamente.');
    });
  });
});
