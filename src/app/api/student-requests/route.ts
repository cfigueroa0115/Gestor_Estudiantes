import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie } from '@/lib/auth';
import { studentRequestSchema } from '@/lib/validations/student-request.schema';
import { TipoSolicitud, Prisma } from '@prisma/client';
import { sendEscalationEmail } from '@/lib/email';
import { generateNumeroRadicado } from '@/lib/radicado';
import { autoRegisterStudent } from '@/lib/student-auto-register';

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

    // 1.1 Get user's programa for filtering
    const currentUser = await prisma.user.findUnique({
      where: { id: session.id },
      select: { programa: { select: { codigo: true, nombre: true } } },
    });
    // For transversal users, get programa from JWT session
    let userProgramaNombre = currentUser?.programa?.nombre;
    if (!userProgramaNombre && session.programa_id) {
      const sessionProg = await prisma.programa.findUnique({
        where: { id: session.programa_id },
        select: { nombre: true },
      });
      userProgramaNombre = sessionProg?.nombre;
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

    // Filter by user's programa (micrositio isolation)
    if (userProgramaNombre) {
      andConditions.push({ programa: { equals: userProgramaNombre, mode: 'insensitive' } });
    }

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

    // 5. Generate unique radicado number
    const numeroRadicado = generateNumeroRadicado();

    // 6. Insert record in DB with created_by_user_id = authenticated user id
    const created = await prisma.studentRequest.create({
      data: {
        numero_radicado: numeroRadicado,
        fecha_solicitud: new Date(data.fecha_solicitud),
        id_estudiante: data.id_estudiante,
        nro_documento: data.nro_documento ?? null,
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
        estado_solicitud: 'Radicada',
        estado_solicitud_fecha: new Date(),
      },
    });

    // 6.1 Auto-register student if not in DB (insert only, never update/delete)
    await autoRegisterStudent({
      id_estudiante: data.id_estudiante,
      nro_documento: data.nro_documento,
      nombres: data.nombres,
      apellidos: data.apellidos,
      correo: data.correo,
      celular: data.celular,
      programa: data.programa,
      modalidad: data.modalidad,
    });

    // 7. If escalation is required, update state and send email
    if (data.requiere_escalar && data.area_escalar) {
      try {
        await prisma.studentRequest.update({
          where: { id: created.id },
          data: {
            estado_solicitud: 'Escalada',
            estado_solicitud_fecha: new Date(),
          },
        });

        // Send escalation email (don't fail the request if email fails)
        try {
          await sendEscalationEmail({
            area: data.area_escalar,
            studentName: `${data.nombres} ${data.apellidos}`,
            studentId: data.id_estudiante,
            requestDescription: data.descripcion_solicitud,
            requestId: created.id,
            numeroRadicado: numeroRadicado,
          });
        } catch (emailError) {
          console.error('[POST /api/student-requests] Error al enviar correo de escalamiento:', emailError);
        }
      } catch (escalationError) {
        console.error('[POST /api/student-requests] Error al escalar solicitud:', escalationError);
      }
    }

    // 8. Return 201 with id and numero_radicado
    return NextResponse.json({ id: created.id, numero_radicado: numeroRadicado }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Ha ocurrido un error interno. Intente nuevamente.' },
      { status: 500 }
    );
  }
}
