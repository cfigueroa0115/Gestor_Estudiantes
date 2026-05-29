import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import { signToken } from '../../../src/lib/auth';

// Mock Prisma
const mockFindUnique = vi.fn();

vi.mock('../../../src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
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

describe('POST /api/auth/logout', () => {
  async function callLogout() {
    const { POST } = await import('../../../src/app/api/auth/logout/route');
    return POST();
  }

  it('should return 200 with success true', async () => {
    const response = await callLogout();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should clear the session cookie', async () => {
    const response = await callLogout();
    const setCookie = response.headers.get('set-cookie');

    expect(setCookie).toBeDefined();
    expect(setCookie).toContain('session=');
    expect(setCookie).toContain('Max-Age=0');
  });
});

describe('GET /api/auth/me', () => {
  async function callMe(cookieValue?: string) {
    const { GET } = await import('../../../src/app/api/auth/me/route');
    const headers: Record<string, string> = {};
    if (cookieValue) {
      headers['cookie'] = `session=${cookieValue}`;
    }
    const request = new Request('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers,
    });
    const { NextRequest } = await import('next/server');
    const nextReq = new NextRequest(request);
    return GET(nextReq);
  }

  it('should return 401 when no session cookie is present', async () => {
    const response = await callMe();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('No autenticado');
  });

  it('should return 401 when session cookie is invalid', async () => {
    const response = await callMe('invalid-token-value');
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('No autenticado');
  });

  it('should return 401 when user no longer exists in DB', async () => {
    const token = await signToken({
      id: 'uuid-deleted-user',
      usuario: '1234567890',
      cargo: 'Profesor',
    });
    mockFindUnique.mockResolvedValue(null);

    const response = await callMe(token);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('No autenticado');
  });

  it('should return user data when session is valid', async () => {
    const token = await signToken({
      id: 'uuid-123',
      usuario: '1129564302',
      cargo: 'Profesor',
    });
    mockFindUnique.mockResolvedValue({
      id: 'uuid-123',
      usuario: '1129564302',
      cargo: 'Profesor',
      estado: 'Activo',
    });

    const response = await callMe(token);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe('uuid-123');
    expect(data.usuario).toBe('1129564302');
    expect(data.cargo).toBe('Profesor');
    expect(data.estado).toBe('Activo');
  });

  it('should return current estado from DB (not from JWT)', async () => {
    // JWT was issued when user was active, but user is now inactive
    const token = await signToken({
      id: 'uuid-123',
      usuario: '1129564302',
      cargo: 'Profesor',
    });
    mockFindUnique.mockResolvedValue({
      id: 'uuid-123',
      usuario: '1129564302',
      cargo: 'Profesor',
      estado: 'Inactivo',
    });

    const response = await callMe(token);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.estado).toBe('Inactivo');
  });

  it('should return 500 with generic error on unexpected exceptions', async () => {
    const token = await signToken({
      id: 'uuid-123',
      usuario: '1129564302',
      cargo: 'Profesor',
    });
    mockFindUnique.mockRejectedValue(new Error('DB connection failed'));

    const response = await callMe(token);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Ha ocurrido un error interno. Intente nuevamente.');
  });
});
