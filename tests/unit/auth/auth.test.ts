import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import {
  signToken,
  verifyToken,
  setSessionCookie,
  clearSessionCookie,
  getSessionFromCookie,
  hashPassword,
  comparePassword,
  COOKIE_NAME,
  MAX_AGE,
} from '../../../src/lib/auth';

// Set JWT_SECRET for tests
beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-key-for-unit-tests-minimum-length';
});

afterAll(() => {
  delete process.env.JWT_SECRET;
});

describe('signToken', () => {
  it('should create a valid JWT string', async () => {
    const payload = { id: '123', usuario: '1129564302', cargo: 'Docente' as const };
    const token = await signToken(payload);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  it('should include payload data in the token', async () => {
    const payload = { id: 'abc-uuid', usuario: '9999999', cargo: 'Jefe' as const };
    const token = await signToken(payload);
    const decoded = await verifyToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded!.id).toBe('abc-uuid');
    expect(decoded!.usuario).toBe('9999999');
    expect(decoded!.cargo).toBe('Jefe');
  });

  it('should set iat and exp fields', async () => {
    const payload = { id: '123', usuario: '1129564302', cargo: 'Administrativo' as const };
    const token = await signToken(payload);
    const decoded = await verifyToken(token);

    expect(decoded!.iat).toBeDefined();
    expect(decoded!.exp).toBeDefined();
    // exp should be approximately 8 hours after iat
    const diff = decoded!.exp - decoded!.iat;
    expect(diff).toBe(8 * 60 * 60);
  });
});

describe('verifyToken', () => {
  it('should return payload for a valid token', async () => {
    const payload = { id: '123', usuario: '1129564302', cargo: 'Docente' as const };
    const token = await signToken(payload);
    const result = await verifyToken(token);

    expect(result).not.toBeNull();
    expect(result!.id).toBe('123');
    expect(result!.usuario).toBe('1129564302');
    expect(result!.cargo).toBe('Docente');
  });

  it('should return null for an invalid token', async () => {
    const result = await verifyToken('invalid.token.here');
    expect(result).toBeNull();
  });

  it('should return null for an empty string', async () => {
    const result = await verifyToken('');
    expect(result).toBeNull();
  });

  it('should return null for a tampered token', async () => {
    const payload = { id: '123', usuario: '1129564302', cargo: 'Docente' as const };
    const token = await signToken(payload);
    // Tamper with the token
    const tampered = token.slice(0, -5) + 'XXXXX';
    const result = await verifyToken(tampered);
    expect(result).toBeNull();
  });
});

describe('setSessionCookie', () => {
  it('should set cookie with correct name and options', () => {
    const cookieSetCalls: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
    const mockResponse = {
      cookies: {
        set: (name: string, value: string, options: Record<string, unknown>) => {
          cookieSetCalls.push({ name, value, options });
        },
      },
    } as unknown as import('next/server').NextResponse;

    setSessionCookie(mockResponse, 'my-token-value');

    expect(cookieSetCalls).toHaveLength(1);
    expect(cookieSetCalls[0].name).toBe(COOKIE_NAME);
    expect(cookieSetCalls[0].value).toBe('my-token-value');
    expect(cookieSetCalls[0].options.httpOnly).toBe(true);
    expect(cookieSetCalls[0].options.sameSite).toBe('lax');
    expect(cookieSetCalls[0].options.path).toBe('/');
    expect(cookieSetCalls[0].options.maxAge).toBe(MAX_AGE);
  });

  it('should set secure=true in production', () => {
    const originalEnv = process.env.NODE_ENV;
    // @ts-expect-error - NODE_ENV is readonly in types but writable at runtime for testing
    process.env.NODE_ENV = 'production';

    const cookieSetCalls: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
    const mockResponse = {
      cookies: {
        set: (name: string, value: string, options: Record<string, unknown>) => {
          cookieSetCalls.push({ name, value, options });
        },
      },
    } as unknown as import('next/server').NextResponse;

    setSessionCookie(mockResponse, 'token');

    expect(cookieSetCalls[0].options.secure).toBe(true);

    // @ts-expect-error - restoring original value
    process.env.NODE_ENV = originalEnv;
  });

  it('should set secure=false in development', () => {
    const originalEnv = process.env.NODE_ENV;
    // @ts-expect-error - NODE_ENV is readonly in types but writable at runtime for testing
    process.env.NODE_ENV = 'development';

    const cookieSetCalls: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
    const mockResponse = {
      cookies: {
        set: (name: string, value: string, options: Record<string, unknown>) => {
          cookieSetCalls.push({ name, value, options });
        },
      },
    } as unknown as import('next/server').NextResponse;

    setSessionCookie(mockResponse, 'token');

    expect(cookieSetCalls[0].options.secure).toBe(false);

    // @ts-expect-error - restoring original value
    process.env.NODE_ENV = originalEnv;
  });
});

describe('clearSessionCookie', () => {
  it('should clear cookie by setting empty value and maxAge 0', () => {
    const cookieSetCalls: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];
    const mockResponse = {
      cookies: {
        set: (name: string, value: string, options: Record<string, unknown>) => {
          cookieSetCalls.push({ name, value, options });
        },
      },
    } as unknown as import('next/server').NextResponse;

    clearSessionCookie(mockResponse);

    expect(cookieSetCalls).toHaveLength(1);
    expect(cookieSetCalls[0].name).toBe(COOKIE_NAME);
    expect(cookieSetCalls[0].value).toBe('');
    expect(cookieSetCalls[0].options.maxAge).toBe(0);
  });
});

describe('getSessionFromCookie', () => {
  it('should return payload when valid session cookie exists', async () => {
    const payload = { id: '123', usuario: '1129564302', cargo: 'Docente' as const };
    const token = await signToken(payload);

    const mockCookies = {
      get: (name: string) => {
        if (name === COOKIE_NAME) return { value: token };
        return undefined;
      },
    };

    const result = await getSessionFromCookie(mockCookies);
    expect(result).not.toBeNull();
    expect(result!.id).toBe('123');
    expect(result!.usuario).toBe('1129564302');
    expect(result!.cargo).toBe('Docente');
  });

  it('should return null when no session cookie exists', async () => {
    const mockCookies = {
      get: () => undefined,
    };

    const result = await getSessionFromCookie(mockCookies);
    expect(result).toBeNull();
  });

  it('should return null when cookie has empty value', async () => {
    const mockCookies = {
      get: (name: string) => {
        if (name === COOKIE_NAME) return { value: '' };
        return undefined;
      },
    };

    const result = await getSessionFromCookie(mockCookies);
    expect(result).toBeNull();
  });

  it('should return null when cookie has invalid token', async () => {
    const mockCookies = {
      get: (name: string) => {
        if (name === COOKIE_NAME) return { value: 'invalid-token' };
        return undefined;
      },
    };

    const result = await getSessionFromCookie(mockCookies);
    expect(result).toBeNull();
  });
});

describe('hashPassword', () => {
  it('should return a hash different from the original password', async () => {
    const password = 'MySecurePassword123';
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
  });

  it('should produce a valid bcrypt hash (starts with $2)', async () => {
    const hash = await hashPassword('test123');
    expect(hash).toMatch(/^\$2[aby]?\$/);
  });

  it('should produce different hashes for the same password (due to salt)', async () => {
    const password = 'SamePassword';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2);
  });
});

describe('comparePassword', () => {
  it('should return true for matching password and hash', async () => {
    const password = 'CorrectPassword123';
    const hash = await hashPassword(password);
    const result = await comparePassword(password, hash);

    expect(result).toBe(true);
  });

  it('should return false for non-matching password', async () => {
    const hash = await hashPassword('CorrectPassword');
    const result = await comparePassword('WrongPassword', hash);

    expect(result).toBe(false);
  });

  it('should return false for empty password against a hash', async () => {
    const hash = await hashPassword('SomePassword');
    const result = await comparePassword('', hash);

    expect(result).toBe(false);
  });
});
