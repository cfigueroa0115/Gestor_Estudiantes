import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie } from '@/lib/auth';
import { studentRequestSchema } from '@/lib/validations/student-request.schema';
import { TipoSolicitud, Prisma } from '@prisma/client';

/**
 * Mapping from Zod schema tipo_solicitud values (with accents) to Prisma enum keys (without accents).
 */
const TIPO_SOLICITUD_MAP: Record<string, TipoSolicitud> = {
  'Académico': TipoSolicitud.Academico,
  'Financiero': TipoSolicitud.Financiero,
  'Certificados': TipoSolicitud.Certificados,
};

/** Valid page sizes for pagination */
const VALID_PAGE_SIZES = [10, 25, 50];

/** Valid sortable fields */
const VALID_SORT_FIELDS = [
  'created_at',
  'fecha_solicitud',
  'id_estudiante',
  'nombres',
  'apellidos',
  'correo',
  'modalidad',
  'tipo_solicitud',
  'updated_at',
];

/**
 * GET /api/student-requests - Listar solicitudes con filtros y paginación
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Extract authenticated user from session cookie
    const cookieStore = await cookies();
    const session = await getSessionFromCookie(cookieStore);

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // 2. Parse query parameters
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const rawPageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const pageSize = VALID_PAGE_SIZES.includes(rawPageSize) ? rawPageSize : 10;

    const search = searchParams.get('search') || undefined;
    const fechaDesde = searchParams.get('fechaDesde') || undefined;
    const fechaHasta = searchParams.get('fechaHasta') || undefined;
    const idEstudiante = searchParams.get('idEstudiante') || undefined;
    const tipoSolicitud = searchParams.get('tipoSolicitud') || undefined;
    const modalidad = searchParams.get('modalidad') || undefined;
    const areaEscalar = searchParams.get('areaEscalar') || undefined;

    const sortBy = VALID_SORT_FIELDS.includes(searchParams.get('sortBy') || '')
      ? searchParams.get('sortBy')!
      : 'created_at';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

    // 3. Build where clause with filters
    const where: Prisma.StudentRequestWhereInput = {};
    const andConditions: Prisma.StudentRequestWhereInput[] = [];

    // Search filter: partial match (OR) across multiple fields
    if (search) {
      andConditions.push({
        OR: [
          { nombres: { contains: search, mode: 'insensitive' } },
          { apellidos: { contains: search, mode: 'insensitive' } },
          { correo: { contains: search, mode: 'insensitive' } },
          { id_estudiante: { contains: search, mode: 'insensitive' } },
          { descripcion_solicitud: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Date range filters
    if (fechaDesde) {
      andConditions.push({
        fecha_solicitud: { gte: new Date(fechaDesde) },
      });
    }
    if (fechaHasta) {
      andConditions.push({
        fecha_solicitud: { lte: new Date(fechaHasta) },
      });
    }

    // Exact match filters
    if (idEstudiante) {
      andConditions.push({ id_estudiante: idEstudiante });
    }

    if (tipoSolicitud) {
      // Map "Académico" → Prisma enum "Academico"
      const mappedTipo = TIPO_SOLICITUD_MAP[tipoSolicitud];
      if (mappedTipo) {
        andConditions.push({ tipo_solicitud: mappedTipo });
      }
    }

    if (modalidad) {
      andConditions.push({ modalidad: modalidad as Prisma.EnumModalidadFilter['equals'] });
    }

    if (areaEscalar) {
      andConditions.push({ area_escalar: areaEscalar });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // 4. Execute count and findMany in parallel
    const [totalRecords, data] = await Promise.all([
      prisma.studentRequest.count({ where }),
      prisma.studentRequest.findMany({
        where,
        include: {
          creator: {
            select: {
              usuario: true,
              cargo: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const totalPages = Math.ceil(totalRecords / pageSize);

    // 5. Return paginated response
    return NextResponse.json({
      data,
      pagination: {
        page,
        pageSize,
        totalPages,
        totalRecords,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Ha ocurrido un error interno. Intente nuevamente.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/student-requests - Crear una solicitud estudiantil
 * Validates: Requirements 10.3, 10.4
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Extract authenticated user from session cookie
    const cookieStore = await cookies();
    const session = await getSessionFromCookie(cookieStore);

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body with studentRequestSchema
    const body = await request.json();
    const parsed = studentRequestSchema.safeParse(body);

    if (!parsed.success) {
      // 3. If validation fails: return 400 with field-level errors
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.');
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      return NextResponse.json(
        { error: 'Error de validación', fields: fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 4. Map tipo_solicitud from schema value to Prisma enum key
    const tipoSolicitudPrisma = TIPO_SOLICITUD_MAP[data.tipo_solicitud];

    // 5. Insert record in DB with created_by_user_id = authenticated user id
    const created = await prisma.studentRequest.create({
      data: {
        fecha_solicitud: new Date(data.fecha_solicitud),
        id_estudiante: data.id_estudiante,
        nombres: data.nombres,
        apellidos: data.apellidos,
        correo: data.correo,
        celular: data.celular,
        programa: data.programa,
        modalidad: data.modalidad,
        tipo_solicitud: tipoSolicitudPrisma,
        solicitud_academica: data.solicitud_academica ?? null,
        solicitud_financiera: data.solicitud_financiera ?? null,
        descripcion_solicitud: data.descripcion_solicitud,
        requiere_escalar: data.requiere_escalar,
        area_escalar: data.area_escalar ?? null,
        created_by_user_id: session.id,
      },
    });

    // 6. Return 201 with id of created record
    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Ha ocurrido un error interno. Intente nuevamente.' },
      { status: 500 }
    );
  }
}
