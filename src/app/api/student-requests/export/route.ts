import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie } from '@/lib/auth';
import { TipoSolicitud, Modalidad } from '@prisma/client';

/**
 * CSV Configuration
 */
const CSV_CONFIG = {
  delimiter: ';',
  bom: '\uFEFF', // UTF-8 BOM
  headers: [
    'N° Radicado',
    'ID registro',
    'Fecha solicitud',
    'ID estudiante',
    'Nombres',
    'Apellidos',
    'Correo',
    'Celular',
    'Programa',
    'Modalidad',
    'Tipo solicitud',
    'Solicitud académica',
    'Solicitud financiera',
    'Descripción solicitud',
    'Requiere escalar',
    'Área a escalar',
    'Estado actual',
    'Fecha estado',
    'Usuario creador',
    'Cargo creador',
    'Fecha creación',
    'Fecha actualización',
  ],
};

/**
 * Map Prisma TipoSolicitud enum back to display value with accent.
 */
const TIPO_SOLICITUD_DISPLAY: Record<TipoSolicitud, string> = {
  [TipoSolicitud.Academico]: 'Académico',
  [TipoSolicitud.Financiero]: 'Financiero',
  [TipoSolicitud.Certificados]: 'Certificados',
};

/**
 * Mapping from filter string values to Prisma TipoSolicitud enum keys.
 */
const TIPO_SOLICITUD_FILTER_MAP: Record<string, TipoSolicitud> = {
  'Académico': TipoSolicitud.Academico,
  'Academico': TipoSolicitud.Academico,
  'Financiero': TipoSolicitud.Financiero,
  'Certificados': TipoSolicitud.Certificados,
};

/**
 * Valid Modalidad values for filter validation.
 */
const VALID_MODALIDADES: string[] = Object.values(Modalidad);

/**
 * Format a Date to YYYY-MM-DD string.
 * Uses UTC methods since fecha_solicitud is stored as a date-only field (@db.Date).
 */
function formatDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date to YYYY-MM-DD HH:mm string.
 */
function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Generate the CSV filename with the pattern:
 * gestion_estudiantes_salas_virtuales_YYYY-MM-DD_HH-mm.csv
 */
function generateFilename(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `gestion_estudiantes_salas_virtuales_${year}-${month}-${day}_${hours}-${minutes}.csv`;
}

/**
 * Escape a CSV field value. If the value contains the delimiter, quotes, or newlines,
 * wrap it in double quotes and escape internal quotes.
 */
function escapeCSVField(value: string): string {
  if (value.includes(';') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * GET /api/student-requests/export - Exportar solicitudes a CSV
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verify authentication
    const session = await getSessionFromCookie(request.cookies);

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    // 2. Parse filter params (same as GET /api/student-requests, without pagination)
    const search = searchParams.get('search') || undefined;
    const fechaDesde = searchParams.get('fechaDesde') || undefined;
    const fechaHasta = searchParams.get('fechaHasta') || undefined;
    const idEstudiante = searchParams.get('idEstudiante') || undefined;
    const tipoSolicitud = searchParams.get('tipoSolicitud') || undefined;
    const modalidad = searchParams.get('modalidad') || undefined;
    const areaEscalar = searchParams.get('areaEscalar') || undefined;

    // 3. Build where clause with AND logic
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search) {
      where.OR = [
        { nombres: { contains: search, mode: 'insensitive' } },
        { apellidos: { contains: search, mode: 'insensitive' } },
        { correo: { contains: search, mode: 'insensitive' } },
        { id_estudiante: { contains: search, mode: 'insensitive' } },
        { descripcion_solicitud: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (fechaDesde || fechaHasta) {
      where.fecha_solicitud = {};
      if (fechaDesde) {
        where.fecha_solicitud.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        // Include the entire end date by setting to end of day
        const endDate = new Date(fechaHasta);
        endDate.setHours(23, 59, 59, 999);
        where.fecha_solicitud.lte = endDate;
      }
    }

    if (idEstudiante) {
      where.id_estudiante = idEstudiante;
    }

    if (tipoSolicitud && TIPO_SOLICITUD_FILTER_MAP[tipoSolicitud]) {
      where.tipo_solicitud = TIPO_SOLICITUD_FILTER_MAP[tipoSolicitud];
    }

    if (modalidad && VALID_MODALIDADES.includes(modalidad)) {
      where.modalidad = modalidad;
    }

    if (areaEscalar) {
      where.area_escalar = areaEscalar;
    }

    // 4. Fetch ALL matching records (no pagination) with creator relation
    const records = await prisma.studentRequest.findMany({
      where,
      include: {
        creator: {
          select: {
            usuario: true,
            cargo: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // 5. Generate CSV content
    const headerRow = CSV_CONFIG.headers.map(escapeCSVField).join(CSV_CONFIG.delimiter);

    const dataRows = records.map((record) => {
      const fields = [
        record.numero_radicado,
        record.id,
        formatDate(record.fecha_solicitud),
        record.id_estudiante,
        record.nombres,
        record.apellidos,
        record.correo,
        record.celular,
        record.programa,
        record.modalidad,
        TIPO_SOLICITUD_DISPLAY[record.tipo_solicitud],
        record.solicitud_academica ?? '',
        record.solicitud_financiera ?? '',
        record.descripcion_solicitud,
        record.requiere_escalar ? 'Sí' : 'No',
        record.area_escalar ?? '',
        record.estado_solicitud,
        formatDateTime(record.estado_solicitud_fecha),
        record.creator.usuario,
        record.creator.cargo,
        formatDateTime(record.created_at),
        formatDateTime(record.updated_at),
      ];

      return fields.map(escapeCSVField).join(CSV_CONFIG.delimiter);
    });

    const csvContent = CSV_CONFIG.bom + headerRow + '\n' + dataRows.join('\n');

    // 6. Generate filename with current date/time
    const filename = generateFilename(new Date());

    // 7. Return CSV response with proper headers
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename=${filename}`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Ha ocurrido un error interno. Intente nuevamente.' },
      { status: 500 }
    );
  }
}
