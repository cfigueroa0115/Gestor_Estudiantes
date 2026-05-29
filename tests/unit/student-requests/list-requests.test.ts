import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';

// Mock next/headers cookies()
const mockCookiesGet = vi.fn();
vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve({ get: mockCookiesGet }),
}));

// Mock Prisma
const mockFindMany = vi.fn();
const mockCount = vi.fn();

vi.mock('../../../src/lib/prisma', () => ({
  prisma: {
    studentRequest: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
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

// Sample data for tests
const sampleRequests = [
  {
    id: 'req-1',
    fecha_solicitud: new Date('2024-06-15'),
    id_estudiante: '1234567890',
    nombres: 'Juan Carlos',
    apellidos: 'Pérez López',
    correo: 'juan.perez@ucc.edu.co',
    celular: '3001234567',
    programa: 'Ingeniería industrial',
    modalidad: 'Presencial',
    tipo_solicitud: 'Academico',
    solicitud_academica: 'Validación',
    solicitud_financiera: null,
    descripcion_solicitud: 'Solicito validación de materia.',
    requiere_escalar: false,
    area_escalar: null,
    created_by_user_id: 'user-1',
    created_at: new Date('2024-06-15T10:00:00Z'),
    updated_at: new Date('2024-06-15T10:00:00Z'),
    updated_by: null,
    creator: { usuario: '1129564302', cargo: 'Docente' },
  },
];

// Helper to call the GET handler
async function callGetStudentRequests(queryParams: Record<string, string> = {}) {
  const { GET } = await import('../../../src/app/api/student-requests/route');
  const url = new URL('http://localhost:3000/api/student-requests');
  for (const [key, value] of Object.entries(queryParams)) {
    url.searchParams.set(key, value);
  }
  const { NextRequest } = await import('next/server');
  const nextReq = new NextRequest(url.toString());
  return GET(nextReq);
}

describe('GET /api/student-requests', () => {
  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockGetSessionFromCookie.mockResolvedValue(null);

      const response = await callGetStudentRequests();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('No autenticado');
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      mockGetSessionFromCookie.mockResolvedValue({
        id: 'auth-user-uuid',
        usuario: '1129564302',
        cargo: 'Docente',
      });
    });

    it('should return default pagination (page 1, pageSize 10)', async () => {
      mockCount.mockResolvedValue(25);
      mockFindMany.mockResolvedValue(sampleRequests);

      const response = await callGetStudentRequests();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pagination).toEqual({
        page: 1,
        pageSize: 10,
        totalPages: 3,
        totalRecords: 25,
      });
    });

    it('should accept valid pageSize values (10, 25, 50)', async () => {
      mockCount.mockResolvedValue(100);
      mockFindMany.mockResolvedValue([]);

      const response = await callGetStudentRequests({ pageSize: '25' });
      const data = await response.json();

      expect(data.pagination.pageSize).toBe(25);
    });

    it('should default to pageSize 10 for invalid values', async () => {
      mockCount.mockResolvedValue(100);
      mockFindMany.mockResolvedValue([]);

      const response = await callGetStudentRequests({ pageSize: '15' });
      const data = await response.json();

      expect(data.pagination.pageSize).toBe(10);
    });

    it('should calculate totalPages correctly', async () => {
      mockCount.mockResolvedValue(51);
      mockFindMany.mockResolvedValue([]);

      const response = await callGetStudentRequests({ pageSize: '25' });
      const data = await response.json();

      expect(data.pagination.totalPages).toBe(3); // ceil(51/25) = 3
    });

    it('should use skip and take for pagination', async () => {
      mockCount.mockResolvedValue(50);
      mockFindMany.mockResolvedValue([]);

      await callGetStudentRequests({ page: '3', pageSize: '10' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20, // (3-1) * 10
          take: 10,
        })
      );
    });

    it('should default page to 1 for invalid values', async () => {
      mockCount.mockResolvedValue(10);
      mockFindMany.mockResolvedValue([]);

      await callGetStudentRequests({ page: '-1' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        })
      );
    });
  });

  describe('Filters', () => {
    beforeEach(() => {
      mockGetSessionFromCookie.mockResolvedValue({
        id: 'auth-user-uuid',
        usuario: '1129564302',
        cargo: 'Docente',
      });
      mockCount.mockResolvedValue(0);
      mockFindMany.mockResolvedValue([]);
    });

    it('should apply search filter with OR across multiple fields', async () => {
      await callGetStudentRequests({ search: 'juan' });

      const callArgs = mockFindMany.mock.calls[0][0];
      const whereClause = callArgs.where;

      expect(whereClause.AND).toBeDefined();
      expect(whereClause.AND[0].OR).toHaveLength(5);
      expect(whereClause.AND[0].OR).toEqual(
        expect.arrayContaining([
          { nombres: { contains: 'juan', mode: 'insensitive' } },
          { apellidos: { contains: 'juan', mode: 'insensitive' } },
          { correo: { contains: 'juan', mode: 'insensitive' } },
          { id_estudiante: { contains: 'juan', mode: 'insensitive' } },
          { descripcion_solicitud: { contains: 'juan', mode: 'insensitive' } },
        ])
      );
    });

    it('should apply fechaDesde filter', async () => {
      await callGetStudentRequests({ fechaDesde: '2024-01-01' });

      const callArgs = mockFindMany.mock.calls[0][0];
      const whereClause = callArgs.where;

      expect(whereClause.AND).toEqual(
        expect.arrayContaining([
          { fecha_solicitud: { gte: new Date('2024-01-01') } },
        ])
      );
    });

    it('should apply fechaHasta filter', async () => {
      await callGetStudentRequests({ fechaHasta: '2024-12-31' });

      const callArgs = mockFindMany.mock.calls[0][0];
      const whereClause = callArgs.where;

      expect(whereClause.AND).toEqual(
        expect.arrayContaining([
          { fecha_solicitud: { lte: new Date('2024-12-31') } },
        ])
      );
    });

    it('should apply idEstudiante exact match filter', async () => {
      await callGetStudentRequests({ idEstudiante: '1234567890' });

      const callArgs = mockFindMany.mock.calls[0][0];
      const whereClause = callArgs.where;

      expect(whereClause.AND).toEqual(
        expect.arrayContaining([
          { id_estudiante: '1234567890' },
        ])
      );
    });

    it('should apply tipoSolicitud filter with enum mapping', async () => {
      await callGetStudentRequests({ tipoSolicitud: 'Académico' });

      const callArgs = mockFindMany.mock.calls[0][0];
      const whereClause = callArgs.where;

      expect(whereClause.AND).toEqual(
        expect.arrayContaining([
          { tipo_solicitud: 'Academico' },
        ])
      );
    });

    it('should apply modalidad filter', async () => {
      await callGetStudentRequests({ modalidad: 'Virtual' });

      const callArgs = mockFindMany.mock.calls[0][0];
      const whereClause = callArgs.where;

      expect(whereClause.AND).toEqual(
        expect.arrayContaining([
          { modalidad: 'Virtual' },
        ])
      );
    });

    it('should apply areaEscalar filter', async () => {
      await callGetStudentRequests({ areaEscalar: 'Financiera' });

      const callArgs = mockFindMany.mock.calls[0][0];
      const whereClause = callArgs.where;

      expect(whereClause.AND).toEqual(
        expect.arrayContaining([
          { area_escalar: 'Financiera' },
        ])
      );
    });

    it('should combine multiple filters with AND', async () => {
      await callGetStudentRequests({
        search: 'test',
        modalidad: 'Presencial',
        tipoSolicitud: 'Financiero',
      });

      const callArgs = mockFindMany.mock.calls[0][0];
      const whereClause = callArgs.where;

      expect(whereClause.AND).toHaveLength(3);
    });

    it('should not add where.AND when no filters are provided', async () => {
      await callGetStudentRequests();

      const callArgs = mockFindMany.mock.calls[0][0];
      const whereClause = callArgs.where;

      expect(whereClause.AND).toBeUndefined();
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      mockGetSessionFromCookie.mockResolvedValue({
        id: 'auth-user-uuid',
        usuario: '1129564302',
        cargo: 'Docente',
      });
      mockCount.mockResolvedValue(0);
      mockFindMany.mockResolvedValue([]);
    });

    it('should default to created_at desc', async () => {
      await callGetStudentRequests();

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { created_at: 'desc' },
        })
      );
    });

    it('should accept valid sortBy fields', async () => {
      await callGetStudentRequests({ sortBy: 'fecha_solicitud', sortOrder: 'asc' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { fecha_solicitud: 'asc' },
        })
      );
    });

    it('should fallback to created_at for invalid sortBy', async () => {
      await callGetStudentRequests({ sortBy: 'invalid_field' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { created_at: 'desc' },
        })
      );
    });

    it('should default sortOrder to desc for invalid values', async () => {
      await callGetStudentRequests({ sortBy: 'nombres', sortOrder: 'invalid' });

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { nombres: 'desc' },
        })
      );
    });
  });

  describe('Creator Join', () => {
    beforeEach(() => {
      mockGetSessionFromCookie.mockResolvedValue({
        id: 'auth-user-uuid',
        usuario: '1129564302',
        cargo: 'Docente',
      });
      mockCount.mockResolvedValue(1);
      mockFindMany.mockResolvedValue(sampleRequests);
    });

    it('should include creator data (usuario, cargo) in response', async () => {
      const response = await callGetStudentRequests();
      const data = await response.json();

      expect(data.data[0].creator).toEqual({
        usuario: '1129564302',
        cargo: 'Docente',
      });
    });

    it('should use Prisma include with select for creator', async () => {
      await callGetStudentRequests();

      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            creator: {
              select: {
                usuario: true,
                cargo: true,
              },
            },
          },
        })
      );
    });
  });

  describe('Response Format', () => {
    beforeEach(() => {
      mockGetSessionFromCookie.mockResolvedValue({
        id: 'auth-user-uuid',
        usuario: '1129564302',
        cargo: 'Docente',
      });
    });

    it('should return data array and pagination object', async () => {
      mockCount.mockResolvedValue(1);
      mockFindMany.mockResolvedValue(sampleRequests);

      const response = await callGetStudentRequests();
      const data = await response.json();

      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.pagination).toHaveProperty('page');
      expect(data.pagination).toHaveProperty('pageSize');
      expect(data.pagination).toHaveProperty('totalPages');
      expect(data.pagination).toHaveProperty('totalRecords');
    });

    it('should return empty data array when no records match', async () => {
      mockCount.mockResolvedValue(0);
      mockFindMany.mockResolvedValue([]);

      const response = await callGetStudentRequests();
      const data = await response.json();

      expect(data.data).toEqual([]);
      expect(data.pagination.totalRecords).toBe(0);
      expect(data.pagination.totalPages).toBe(0);
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
      mockCount.mockRejectedValue(new Error('DB connection failed'));

      const response = await callGetStudentRequests();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Ha ocurrido un error interno. Intente nuevamente.');
    });
  });
});
