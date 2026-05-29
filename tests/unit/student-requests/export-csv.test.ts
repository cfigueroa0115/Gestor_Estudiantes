import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    studentRequest: {
      findMany: vi.fn(),
    },
  },
}));

// Mock auth
vi.mock('@/lib/auth', () => ({
  getSessionFromCookie: vi.fn(),
}));

import { prisma } from '@/lib/prisma';
import { getSessionFromCookie } from '@/lib/auth';
import { GET } from '@/app/api/student-requests/export/route';

const mockSession = {
  id: 'user-uuid-123',
  usuario: '1129564302',
  cargo: 'Docente' as const,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 28800,
};

const mockRecord = {
  id: 'record-uuid-1',
  fecha_solicitud: new Date('2024-06-15'),
  id_estudiante: '1234567890',
  nombres: 'Juan Carlos',
  apellidos: 'Pérez López',
  correo: 'juan@correo.com',
  celular: '3001234567',
  programa: 'Ingeniería industrial',
  modalidad: 'Presencial',
  tipo_solicitud: 'Academico',
  solicitud_academica: 'Validación',
  solicitud_financiera: null,
  descripcion_solicitud: 'Solicitud de validación de materia',
  requiere_escalar: true,
  area_escalar: 'Financiera',
  created_by_user_id: 'user-uuid-123',
  created_at: new Date('2024-06-15T10:30:00'),
  updated_at: new Date('2024-06-15T11:00:00'),
  updated_by: null,
  creator: {
    usuario: '1129564302',
    cargo: 'Docente',
  },
};

function createRequest(params: Record<string, string> = {}): NextRequest {
  const url = new URL('http://localhost:3000/api/student-requests/export');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url.toString());
}

describe('GET /api/student-requests/export', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    vi.mocked(getSessionFromCookie).mockResolvedValue(null);

    const response = await GET(createRequest());

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('No autenticado');
  });

  it('should return CSV with correct Content-Type and Content-Disposition headers', async () => {
    vi.mocked(getSessionFromCookie).mockResolvedValue(mockSession);
    vi.mocked(prisma.studentRequest.findMany).mockResolvedValue([mockRecord] as never);

    const response = await GET(createRequest());

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');

    const disposition = response.headers.get('Content-Disposition');
    expect(disposition).toMatch(/^attachment; filename=gestion_estudiantes_salas_virtuales_\d{4}-\d{2}-\d{2}_\d{2}-\d{2}\.csv$/);
  });

  it('should start CSV content with UTF-8 BOM', async () => {
    vi.mocked(getSessionFromCookie).mockResolvedValue(mockSession);
    vi.mocked(prisma.studentRequest.findMany).mockResolvedValue([mockRecord] as never);

    const response = await GET(createRequest());
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // UTF-8 BOM is EF BB BF (3 bytes)
    expect(bytes[0]).toBe(0xEF);
    expect(bytes[1]).toBe(0xBB);
    expect(bytes[2]).toBe(0xBF);
  });

  it('should use semicolon as delimiter', async () => {
    vi.mocked(getSessionFromCookie).mockResolvedValue(mockSession);
    vi.mocked(prisma.studentRequest.findMany).mockResolvedValue([mockRecord] as never);

    const response = await GET(createRequest());
    const text = await response.text();
    const lines = text.split('\n');

    // Header row should have semicolons
    const headerLine = lines[0].replace('\uFEFF', '');
    expect(headerLine.split(';').length).toBe(19); // 19 columns
  });

  it('should include correct Spanish headers', async () => {
    vi.mocked(getSessionFromCookie).mockResolvedValue(mockSession);
    vi.mocked(prisma.studentRequest.findMany).mockResolvedValue([]);

    const response = await GET(createRequest());
    const text = await response.text();
    const headerLine = text.replace('\uFEFF', '').split('\n')[0];

    const expectedHeaders = [
      'ID registro', 'Fecha solicitud', 'ID estudiante', 'Nombres',
      'Apellidos', 'Correo', 'Celular', 'Programa', 'Modalidad',
      'Tipo solicitud', 'Solicitud académica', 'Solicitud financiera',
      'Descripción solicitud', 'Requiere escalar', 'Área a escalar',
      'Usuario creador', 'Cargo creador', 'Fecha creación', 'Fecha actualización',
    ];

    expect(headerLine).toBe(expectedHeaders.join(';'));
  });

  it('should return CSV with only headers when no records match', async () => {
    vi.mocked(getSessionFromCookie).mockResolvedValue(mockSession);
    vi.mocked(prisma.studentRequest.findMany).mockResolvedValue([]);

    const response = await GET(createRequest());
    const text = await response.text();
    const lines = text.split('\n').filter((l) => l.trim() !== '');

    // Only the header row (BOM + headers)
    expect(lines.length).toBe(1);
  });

  it('should map tipo_solicitud Academico to "Académico" in CSV', async () => {
    vi.mocked(getSessionFromCookie).mockResolvedValue(mockSession);
    vi.mocked(prisma.studentRequest.findMany).mockResolvedValue([mockRecord] as never);

    const response = await GET(createRequest());
    const text = await response.text();
    const lines = text.split('\n');
    const dataRow = lines[1];

    expect(dataRow).toContain('Académico');
  });

  it('should map requiere_escalar boolean to "Sí"/"No"', async () => {
    vi.mocked(getSessionFromCookie).mockResolvedValue(mockSession);

    const recordEscalar = { ...mockRecord, requiere_escalar: true };
    const recordNoEscalar = { ...mockRecord, id: 'record-2', requiere_escalar: false, area_escalar: null };

    vi.mocked(prisma.studentRequest.findMany).mockResolvedValue([recordEscalar, recordNoEscalar] as never);

    const response = await GET(createRequest());
    const text = await response.text();
    const lines = text.split('\n');

    expect(lines[1]).toContain('Sí');
    expect(lines[2]).toContain('No');
  });

  it('should include creator usuario and cargo in each row', async () => {
    vi.mocked(getSessionFromCookie).mockResolvedValue(mockSession);
    vi.mocked(prisma.studentRequest.findMany).mockResolvedValue([mockRecord] as never);

    const response = await GET(createRequest());
    const text = await response.text();
    const lines = text.split('\n');
    const dataRow = lines[1];

    expect(dataRow).toContain('1129564302');
    expect(dataRow).toContain('Docente');
  });

  it('should output empty string for null fields', async () => {
    vi.mocked(getSessionFromCookie).mockResolvedValue(mockSession);

    const recordWithNulls = {
      ...mockRecord,
      solicitud_academica: null,
      solicitud_financiera: null,
      area_escalar: null,
      requiere_escalar: false,
    };
    vi.mocked(prisma.studentRequest.findMany).mockResolvedValue([recordWithNulls] as never);

    const response = await GET(createRequest());
    const text = await response.text();
    const lines = text.split('\n');
    const fields = lines[1].split(';');

    // solicitud_academica (index 10), solicitud_financiera (index 11), area_escalar (index 14)
    expect(fields[10]).toBe('');
    expect(fields[11]).toBe('');
    expect(fields[14]).toBe('');
  });

  it('should format fecha_solicitud as YYYY-MM-DD', async () => {
    vi.mocked(getSessionFromCookie).mockResolvedValue(mockSession);
    vi.mocked(prisma.studentRequest.findMany).mockResolvedValue([mockRecord] as never);

    const response = await GET(createRequest());
    const text = await response.text();
    const lines = text.split('\n');
    const fields = lines[1].split(';');

    // fecha_solicitud is index 1
    expect(fields[1]).toBe('2024-06-15');
  });

  it('should format created_at and updated_at as YYYY-MM-DD HH:mm', async () => {
    vi.mocked(getSessionFromCookie).mockResolvedValue(mockSession);
    vi.mocked(prisma.studentRequest.findMany).mockResolvedValue([mockRecord] as never);

    const response = await GET(createRequest());
    const text = await response.text();
    const lines = text.split('\n');
    const fields = lines[1].split(';');

    // created_at is index 17, updated_at is index 18
    expect(fields[17]).toBe('2024-06-15 10:30');
    expect(fields[18]).toBe('2024-06-15 11:00');
  });

  it('should pass filters to prisma query', async () => {
    vi.mocked(getSessionFromCookie).mockResolvedValue(mockSession);
    vi.mocked(prisma.studentRequest.findMany).mockResolvedValue([]);

    await GET(createRequest({
      search: 'Juan',
      fechaDesde: '2024-01-01',
      fechaHasta: '2024-12-31',
      idEstudiante: '1234567890',
      tipoSolicitud: 'Académico',
      modalidad: 'Presencial',
      areaEscalar: 'Financiera',
    }));

    expect(prisma.studentRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ nombres: { contains: 'Juan', mode: 'insensitive' } }),
          ]),
          id_estudiante: '1234567890',
          tipo_solicitud: 'Academico',
          modalidad: 'Presencial',
          area_escalar: 'Financiera',
          fecha_solicitud: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
        include: {
          creator: {
            select: {
              usuario: true,
              cargo: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      })
    );
  });

  it('should return 500 with generic error on server failure', async () => {
    vi.mocked(getSessionFromCookie).mockResolvedValue(mockSession);
    vi.mocked(prisma.studentRequest.findMany).mockRejectedValue(new Error('DB connection failed'));

    const response = await GET(createRequest());

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe('Ha ocurrido un error interno. Intente nuevamente.');
  });

  it('should escape CSV fields containing semicolons or quotes', async () => {
    vi.mocked(getSessionFromCookie).mockResolvedValue(mockSession);

    const recordWithSpecialChars = {
      ...mockRecord,
      descripcion_solicitud: 'Solicitud con "comillas" y punto;coma',
    };
    vi.mocked(prisma.studentRequest.findMany).mockResolvedValue([recordWithSpecialChars] as never);

    const response = await GET(createRequest());
    const text = await response.text();

    // The field should be wrapped in quotes with escaped internal quotes
    expect(text).toContain('"Solicitud con ""comillas"" y punto;coma"');
  });

  it('should fetch all records without pagination', async () => {
    vi.mocked(getSessionFromCookie).mockResolvedValue(mockSession);
    vi.mocked(prisma.studentRequest.findMany).mockResolvedValue([]);

    await GET(createRequest());

    // Verify no skip/take params are passed (no pagination)
    const callArgs = vi.mocked(prisma.studentRequest.findMany).mock.calls[0][0];
    expect(callArgs).not.toHaveProperty('skip');
    expect(callArgs).not.toHaveProperty('take');
  });
});
