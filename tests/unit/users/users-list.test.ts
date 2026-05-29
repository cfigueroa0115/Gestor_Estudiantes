import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Prisma
const mockFindMany = vi.fn();
const mockCount = vi.fn();
const mockFindUnique = vi.fn();
const mockCreate = vi.fn();

vi.mock('../../../src/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

// Mock auth
const mockGetSessionFromCookie = vi.fn();
vi.mock('../../../src/lib/auth', () => ({
  getSessionFromCookie: (...args: unknown[]) => mockGetSessionFromCookie(...args),
  hashPassword: vi.fn().mockResolvedValue('hashed_password'),
}));

// Mock validations
vi.mock('../../../src/lib/validations/user.schema', () => ({
  createUserSchema: {
    safeParse: vi.fn().mockReturnValue({ success: false, error: { issues: [] } }),
  },
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(null),
  }),
}));

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-key-for-unit-tests-minimum-length';
});

afterAll(() => {
  delete process.env.JWT_SECRET;
});

beforeEach(() => {
  vi.clearAllMocks();
});

// Helper to create mock users
function createMockUsers(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `uuid-${i}`,
    usuario: `${1000000000 + i}`,
    cargo: i % 3 === 0 ? 'Docente' : i % 3 === 1 ? 'Jefe' : 'Administrativo',
    estado: i % 2 === 0 ? 'Activo' : 'Inactivo',
    created_at: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
    updated_at: new Date(`2024-01-${String(i + 1).padStart(2, '0')}`),
    disabled_at: i % 2 === 1 ? new Date() : null,
    last_login_at: null,
    created_by: null,
    updated_by: null,
  }));
}

// Helper to call the GET handler
async function callGetUsers(queryParams: Record<string, string> = {}) {
  const { GET } = await import('../../../src/app/api/users/route');
  const url = new URL('http://localhost:3000/api/users');
  Object.entries(queryParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  const request = new Request(url.toString(), { method: 'GET' });
  const nextReq = new NextRequest(request);
  return GET(nextReq);
}

describe('GET /api/users', () => {
  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockGetSessionFromCookie.mockResolvedValue(null);

      const response = await callGetUsers();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('No autenticado');
    });
  });

  describe('Pagination', () => {
    it('should return paginated response with default page=1 and pageSize=10', async () => {
      mockGetSessionFromCookie.mockResolvedValue({ id: 'user-1', usuario: '1129564302', cargo: 'Docente' });
      const users = createMockUsers(10);
      mockCount.mockResolvedValue(25);
      mockFindMany.mockResolvedValue(users);

      const response = await callGetUsers();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.pageSize).toBe(10);
      expect(data.pagination.totalRecords).toBe(25);
      expect(data.pagination.totalPages).toBe(3);
      expect(data.data).toHaveLength(10);
    });

    it('should accept valid pageSize values (10, 25, 50)', async () => {
      mockGetSessionFromCookie.mockResolvedValue({ id: 'user-1', usuario: '1129564302', cargo: 'Docente' });
      mockCount.mockResolvedValue(100);
      mockFindMany.mockResolvedValue(createMockUsers(25));

      const response = await callGetUsers({ pageSize: '25' });
      const data = await response.json();

      expect(data.pagination.pageSize).toBe(25);
      expect(data.pagination.totalPages).toBe(4);
    });

    it('should default to pageSize=10 for invalid pageSize values', async () => {
      mockGetSessionFromCookie.mockResolvedValue({ id: 'user-1', usuario: '1129564302', cargo: 'Docente' });
      mockCount.mockResolvedValue(30);
      mockFindMany.mockResolvedValue(createMockUsers(10));

      const response = await callGetUsers({ pageSize: '15' });
      const data = await response.json();

      expect(data.pagination.pageSize).toBe(10);
    });

    it('should default to pageSize=10 for non-numeric pageSize', async () => {
      mockGetSessionFromCookie.mockResolvedValue({ id: 'user-1', usuario: '1129564302', cargo: 'Docente' });
      mockCount.mockResolvedValue(30);
      mockFindMany.mockResolvedValue(createMockUsers(10));

      const response = await callGetUsers({ pageSize: 'abc' });
      const data = await response.json();

      expect(data.pagination.pageSize).toBe(10);
    });

    it('should handle page parameter correctly', async () => {
      mockGetSessionFromCookie.mockResolvedValue({ id: 'user-1', usuario: '1129564302', cargo: 'Docente' });
      mockCount.mockResolvedValue(30);
      mockFindMany.mockResolvedValue(createMockUsers(10));

      const response = await callGetUsers({ page: '2', pageSize: '10' });
      const data = await response.json();

      expect(data.pagination.page).toBe(2);
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });

    it('should default page to 1 for invalid page values', async () => {
      mockGetSessionFromCookie.mockResolvedValue({ id: 'user-1', usuario: '1129564302', cargo: 'Docente' });
      mockCount.mockResolvedValue(10);
      mockFindMany.mockResolvedValue(createMockUsers(10));

      const response = await callGetUsers({ page: '-1' });
      const data = await response.json();

      expect(data.pagination.page).toBe(1);
    });

    it('should calculate totalPages correctly', async () => {
      mockGetSessionFromCookie.mockResolvedValue({ id: 'user-1', usuario: '1129564302', cargo: 'Docente' });
      mockCount.mockResolvedValue(51);
      mockFindMany.mockResolvedValue(createMockUsers(10));

      const response = await callGetUsers({ pageSize: '10' });
      const data = await response.json();

      expect(data.pagination.totalPages).toBe(6); // ceil(51/10) = 6
    });
  });

  describe('Filters', () => {
    it('should filter by usuario with partial match (contains)', async () => {
      mockGetSessionFromCookie.mockResolvedValue({ id: 'user-1', usuario: '1129564302', cargo: 'Docente' });
      mockCount.mockResolvedValue(1);
      mockFindMany.mockResolvedValue([createMockUsers(1)[0]]);

      await callGetUsers({ usuario: '1129' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            usuario: { contains: '1129', mode: 'insensitive' },
          }),
        })
      );
    });

    it('should filter by cargo with exact match', async () => {
      mockGetSessionFromCookie.mockResolvedValue({ id: 'user-1', usuario: '1129564302', cargo: 'Docente' });
      mockCount.mockResolvedValue(5);
      mockFindMany.mockResolvedValue(createMockUsers(5));

      await callGetUsers({ cargo: 'Docente' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            cargo: 'Docente',
          }),
        })
      );
    });

    it('should filter by estado with exact match', async () => {
      mockGetSessionFromCookie.mockResolvedValue({ id: 'user-1', usuario: '1129564302', cargo: 'Docente' });
      mockCount.mockResolvedValue(3);
      mockFindMany.mockResolvedValue(createMockUsers(3));

      await callGetUsers({ estado: 'Activo' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            estado: 'Activo',
          }),
        })
      );
    });

    it('should combine multiple filters with AND logic', async () => {
      mockGetSessionFromCookie.mockResolvedValue({ id: 'user-1', usuario: '1129564302', cargo: 'Docente' });
      mockCount.mockResolvedValue(2);
      mockFindMany.mockResolvedValue(createMockUsers(2));

      await callGetUsers({ usuario: '112', cargo: 'Docente', estado: 'Activo' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            usuario: { contains: '112', mode: 'insensitive' },
            cargo: 'Docente',
            estado: 'Activo',
          },
        })
      );
    });

    it('should ignore invalid cargo values', async () => {
      mockGetSessionFromCookie.mockResolvedValue({ id: 'user-1', usuario: '1129564302', cargo: 'Docente' });
      mockCount.mockResolvedValue(10);
      mockFindMany.mockResolvedValue(createMockUsers(10));

      await callGetUsers({ cargo: 'InvalidCargo' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        })
      );
    });

    it('should ignore invalid estado values', async () => {
      mockGetSessionFromCookie.mockResolvedValue({ id: 'user-1', usuario: '1129564302', cargo: 'Docente' });
      mockCount.mockResolvedValue(10);
      mockFindMany.mockResolvedValue(createMockUsers(10));

      await callGetUsers({ estado: 'InvalidEstado' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        })
      );
    });
  });

  describe('Response format', () => {
    it('should not include password_hash in response', async () => {
      mockGetSessionFromCookie.mockResolvedValue({ id: 'user-1', usuario: '1129564302', cargo: 'Docente' });
      mockCount.mockResolvedValue(1);
      mockFindMany.mockResolvedValue([{
        id: 'uuid-1',
        usuario: '1129564302',
        cargo: 'Docente',
        estado: 'Activo',
        created_at: new Date(),
        updated_at: new Date(),
        disabled_at: null,
        last_login_at: null,
        created_by: null,
        updated_by: null,
      }]);

      const response = await callGetUsers();
      const data = await response.json();

      expect(data.data[0]).not.toHaveProperty('password_hash');
    });

    it('should use Prisma select to exclude password_hash', async () => {
      mockGetSessionFromCookie.mockResolvedValue({ id: 'user-1', usuario: '1129564302', cargo: 'Docente' });
      mockCount.mockResolvedValue(1);
      mockFindMany.mockResolvedValue([createMockUsers(1)[0]]);

      await callGetUsers();

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            id: true,
            usuario: true,
            cargo: true,
            estado: true,
            created_at: true,
            updated_at: true,
            disabled_at: true,
            last_login_at: true,
          }),
        })
      );

      // Verify password_hash is NOT in select
      const callArgs = mockFindMany.mock.calls[0][0];
      expect(callArgs.select.password_hash).toBeUndefined();
    });

    it('should return empty data array when no users match', async () => {
      mockGetSessionFromCookie.mockResolvedValue({ id: 'user-1', usuario: '1129564302', cargo: 'Docente' });
      mockCount.mockResolvedValue(0);
      mockFindMany.mockResolvedValue([]);

      const response = await callGetUsers({ usuario: 'nonexistent' });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual([]);
      expect(data.pagination.totalRecords).toBe(0);
      expect(data.pagination.totalPages).toBe(0);
    });
  });

  describe('Error handling', () => {
    it('should return 500 with generic error on unexpected exceptions', async () => {
      mockGetSessionFromCookie.mockResolvedValue({ id: 'user-1', usuario: '1129564302', cargo: 'Docente' });
      mockCount.mockRejectedValue(new Error('DB connection failed'));

      const response = await callGetUsers();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Ha ocurrido un error interno. Intente nuevamente.');
    });
  });
});
