import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { SignJWT } from 'jose';
import { middleware } from '../../../src/middleware';

const TEST_SECRET = 'test-secret-key-for-unit-tests-minimum-length';

function getSecret(): Uint8Array {
  return new TextEncoder().encode(TEST_SECRET);
}

async function createValidToken(cargo: string = 'Docente'): Promise<string> {
  return new SignJWT({ id: 'user-123', usuario: '1129564302', cargo })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getSecret());
}

async function createExpiredToken(): Promise<string> {
  return new SignJWT({ id: 'user-123', usuario: '1129564302', cargo: 'Docente' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(Math.floor(Date.now() / 1000) - 60000)
    .setExpirationTime(Math.floor(Date.now() / 1000) - 30000)
    .sign(getSecret());
}

function createRequest(pathname: string, token?: string): NextRequest {
  const url = new URL(pathname, 'http://localhost:3000');
  const headers = new Headers();
  if (token) {
    headers.set('cookie', `session=${token}`);
  }
  return new NextRequest(url, { headers });
}

beforeAll(() => {
  process.env.JWT_SECRET = TEST_SECRET;
  process.env.ROLE_RESTRICTIONS_ENABLED = 'false';
});

afterAll(() => {
  delete process.env.JWT_SECRET;
  delete process.env.ROLE_RESTRICTIONS_ENABLED;
});

describe('Middleware - Public Routes', () => {
  it('should allow access to landing page without token', async () => {
    const request = createRequest('/');
    const response = await middleware(request);

    expect(response.status).toBe(200);
  });

  it('should allow access to /api/auth/login without token', async () => {
    const request = createRequest('/api/auth/login');
    const response = await middleware(request);

    expect(response.status).toBe(200);
  });
});

describe('Middleware - Private Page Routes (no token)', () => {
  it('should redirect to "/" when accessing /dashboard without token', async () => {
    const request = createRequest('/dashboard');
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/');
  });

  it('should redirect to "/" when accessing /dashboard/users without token', async () => {
    const request = createRequest('/dashboard/users');
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/');
  });

  it('should redirect to "/" when accessing /dashboard/requests without token', async () => {
    const request = createRequest('/dashboard/requests');
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/');
  });
});

describe('Middleware - Private API Routes (no token)', () => {
  it('should return 401 JSON when accessing /api/users without token', async () => {
    const request = createRequest('/api/users');
    const response = await middleware(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('No autenticado');
  });

  it('should return 401 JSON when accessing /api/student-requests without token', async () => {
    const request = createRequest('/api/student-requests');
    const response = await middleware(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('No autenticado');
  });
});

describe('Middleware - Invalid/Expired Token', () => {
  it('should redirect page routes with invalid token', async () => {
    const request = createRequest('/dashboard', 'invalid-token');
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/');
  });

  it('should return 401 for API routes with invalid token', async () => {
    const request = createRequest('/api/users', 'invalid-token');
    const response = await middleware(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('No autenticado');
  });

  it('should redirect page routes with expired token', async () => {
    const token = await createExpiredToken();
    const request = createRequest('/dashboard', token);
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/');
  });

  it('should return 401 for API routes with expired token', async () => {
    const token = await createExpiredToken();
    const request = createRequest('/api/users', token);
    const response = await middleware(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('No autenticado');
  });
});

describe('Middleware - Valid Token (ROLE_RESTRICTIONS_ENABLED=false)', () => {
  beforeEach(() => {
    process.env.ROLE_RESTRICTIONS_ENABLED = 'false';
  });

  it('should allow access to /dashboard with valid token', async () => {
    const token = await createValidToken();
    const request = createRequest('/dashboard', token);
    const response = await middleware(request);

    expect(response.status).toBe(200);
  });

  it('should allow access to /api/users with valid token', async () => {
    const token = await createValidToken();
    const request = createRequest('/api/users', token);
    const response = await middleware(request);

    expect(response.status).toBe(200);
  });

  it('should allow all cargos when restrictions are disabled', async () => {
    for (const cargo of ['Docente', 'Jefe', 'Administrativo']) {
      const token = await createValidToken(cargo);
      const request = createRequest('/dashboard/users', token);
      const response = await middleware(request);

      expect(response.status).toBe(200);
    }
  });
});

describe('Middleware - Role Restrictions (ROLE_RESTRICTIONS_ENABLED=true)', () => {
  beforeEach(() => {
    process.env.ROLE_RESTRICTIONS_ENABLED = 'true';
  });

  afterAll(() => {
    process.env.ROLE_RESTRICTIONS_ENABLED = 'false';
  });

  it('should allow access when cargo is in permitted list', async () => {
    // All cargos are currently permitted for all routes
    const token = await createValidToken('Docente');
    const request = createRequest('/dashboard', token);
    const response = await middleware(request);

    expect(response.status).toBe(200);
  });

  it('should allow all current cargos since all are permitted', async () => {
    for (const cargo of ['Docente', 'Jefe', 'Administrativo']) {
      const token = await createValidToken(cargo);
      const request = createRequest('/api/users', token);
      const response = await middleware(request);

      expect(response.status).toBe(200);
    }
  });
});

describe('Middleware - Sub-paths', () => {
  it('should protect sub-paths of /dashboard', async () => {
    const request = createRequest('/dashboard/some/nested/path');
    const response = await middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/');
  });

  it('should protect sub-paths of /api/users', async () => {
    const request = createRequest('/api/users/some-id/status');
    const response = await middleware(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('No autenticado');
  });

  it('should protect sub-paths of /api/student-requests', async () => {
    const request = createRequest('/api/student-requests/export');
    const response = await middleware(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('No autenticado');
  });
});
