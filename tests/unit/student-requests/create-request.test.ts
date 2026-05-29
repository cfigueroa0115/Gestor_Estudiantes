import { describe, it, expect, beforeAll, afterAll, vi, beforeEach } from 'vitest';

// Mock next/headers cookies()
const mockCookiesGet = vi.fn();
vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve({ get: mockCookiesGet }),
}));

// Mock Prisma
const mockCreate = vi.fn();

vi.mock('../../../src/lib/prisma', () => ({
  prisma: {
    studentRequest: {
      create: (...args: unknown[]) => mockCreate(...args),
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

// Valid request body for reuse
const validBody = {
  fecha_solicitud: '2024-06-15',
  id_estudiante: '1234567890',
  nombres: 'Juan Carlos',
  apellidos: 'Pérez López',
  correo: 'juan.perez@ucc.edu.co',
  celular: '3001234567',
  programa: 'Ingeniería industrial',
  modalidad: 'Presencial',
  tipo_solicitud: 'Académico',
  solicitud_academica: 'Validación',
  solicitud_financiera: null,
  descripcion_solicitud: 'Solicito validación de materia cursada en otra universidad.',
  requiere_escalar: false,
  area_escalar: null,
};

// Helper to call the POST handler
async function callCreateStudentRequest(body: Record<string, unknown>) {
  const { POST } = await import('../../../src/app/api/student-requests/route');
  const request = new Request('http://localhost:3000/api/student-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const { NextRequest } = await import('next/server');
  const nextReq = new NextRequest(request);
  return POST(nextReq);
}

describe('POST /api/student-requests', () => {
  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      mockGetSessionFromCookie.mockResolvedValue(null);

      const response = await callCreateStudentRequest(validBody);
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
      const response = await callCreateStudentRequest({});
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Error de validación');
      expect(data.fields).toBeDefined();
    });

    it('should return 400 with field-level errors for invalid fecha_solicitud', async () => {
      const response = await callCreateStudentRequest({
        ...validBody,
        fecha_solicitud: 'invalid-date',
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.fields.fecha_solicitud).toBeDefined();
    });

    it('should return 400 when id_estudiante exceeds 10 digits', async () => {
      const response = await callCreateStudentRequest({
        ...validBody,
        id_estudiante: '12345678901',
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.fields.id_estudiante).toBeDefined();
    });

    it('should return 400 when correo is invalid', async () => {
      const response = await callCreateStudentRequest({
        ...validBody,
        correo: 'not-an-email',
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.fields.correo).toBeDefined();
    });

    it('should return 400 when tipo_solicitud is invalid', async () => {
      const response = await callCreateStudentRequest({
        ...validBody,
        tipo_solicitud: 'InvalidType',
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.fields.tipo_solicitud).toBeDefined();
    });

    it('should return 400 when solicitud_academica is missing for tipo Académico', async () => {
      const response = await callCreateStudentRequest({
        ...validBody,
        tipo_solicitud: 'Académico',
        solicitud_academica: null,
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.fields.solicitud_academica).toBeDefined();
    });

    it('should return 400 when solicitud_financiera is missing for tipo Financiero', async () => {
      const response = await callCreateStudentRequest({
        ...validBody,
        tipo_solicitud: 'Financiero',
        solicitud_academica: null,
        solicitud_financiera: null,
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.fields.solicitud_financiera).toBeDefined();
    });

    it('should return 400 when area_escalar is missing but requiere_escalar is true', async () => {
      const response = await callCreateStudentRequest({
        ...validBody,
        requiere_escalar: true,
        area_escalar: null,
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.fields.area_escalar).toBeDefined();
    });
  });

  describe('Successful Creation', () => {
    beforeEach(() => {
      mockGetSessionFromCookie.mockResolvedValue({
        id: 'auth-user-uuid',
        usuario: '1129564302',
        cargo: 'Docente',
      });
    });

    it('should return 201 with id on successful creation', async () => {
      mockCreate.mockResolvedValue({ id: 'new-request-uuid' });

      const response = await callCreateStudentRequest(validBody);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('new-request-uuid');
    });

    it('should set created_by_user_id to authenticated user id', async () => {
      mockCreate.mockResolvedValue({ id: 'new-request-uuid' });

      await callCreateStudentRequest(validBody);

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          created_by_user_id: 'auth-user-uuid',
        }),
      });
    });

    it('should store fecha_solicitud as a Date object', async () => {
      mockCreate.mockResolvedValue({ id: 'new-request-uuid' });

      await callCreateStudentRequest(validBody);

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.data.fecha_solicitud).toBeInstanceOf(Date);
    });

    it('should map tipo_solicitud Académico to Prisma enum Academico', async () => {
      mockCreate.mockResolvedValue({ id: 'new-request-uuid' });

      await callCreateStudentRequest(validBody);

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tipo_solicitud: 'Academico',
        }),
      });
    });

    it('should handle Financiero tipo_solicitud correctly', async () => {
      mockCreate.mockResolvedValue({ id: 'new-request-uuid' });

      await callCreateStudentRequest({
        ...validBody,
        tipo_solicitud: 'Financiero',
        solicitud_academica: null,
        solicitud_financiera: 'Descuento',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tipo_solicitud: 'Financiero',
          solicitud_financiera: 'Descuento',
          solicitud_academica: null,
        }),
      });
    });

    it('should handle requiere_escalar true with area_escalar', async () => {
      mockCreate.mockResolvedValue({ id: 'new-request-uuid' });

      await callCreateStudentRequest({
        ...validBody,
        requiere_escalar: true,
        area_escalar: 'Financiera',
      });

      expect(mockCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          requiere_escalar: true,
          area_escalar: 'Financiera',
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
      mockCreate.mockRejectedValue(new Error('DB connection failed'));

      const response = await callCreateStudentRequest(validBody);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Ha ocurrido un error interno. Intente nuevamente.');
    });
  });
});
