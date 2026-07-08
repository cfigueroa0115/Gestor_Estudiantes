import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie, hashPassword } from '@/lib/auth';
import { createUserSchema } from '@/lib/validations/user.schema';
import type { Cargo, Estado, PaginatedResponse } from '@/types';

const VALID_PAGE_SIZES = [10, 25, 50] as const;

/**
 * GET /api/users - Listar usuarios con paginación y filtros
 * Validates: Requirements 6.1, 6.2, 6.9
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookie(request.cookies);

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Profesores cannot access user administration (unless they are program admins)
    const userForRoleCheck = await prisma.user.findUnique({
      where: { id: session.id },
      select: { usuario: true, programa: { select: { admin_ids: true } } },
    });
    const isProfesorAdmin = userForRoleCheck?.programa?.admin_ids?.includes(userForRoleCheck.usuario) || false;
    if (session.cargo === 'Profesor' && !isProfesorAdmin) {
      return NextResponse.json(
        { error: 'Permisos insuficientes' },
        { status: 403 }
      );
    }

    // Get current user's programa_id for filtering
    const currentUser = await prisma.user.findUnique({
      where: { id: session.id },
      select: { programa_id: true },
    });
    // For transversal users, get programa_id from JWT session
    let filterProgramaId = currentUser?.programa_id;
    if (!filterProgramaId && (session.programa_id || session.programa_codigo)) {
      if (session.programa_id) {
        filterProgramaId = session.programa_id;
      } else if (session.programa_codigo) {
        const sp = await prisma.programa.findFirst({ where: { codigo: session.programa_codigo }, select: { id: true } });
        filterProgramaId = sp?.id;
      }
    }

    const { searchParams } = new URL(request.url);

    // Parse pagination params
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const rawPageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const pageSize = VALID_PAGE_SIZES.includes(rawPageSize as typeof VALID_PAGE_SIZES[number])
      ? rawPageSize
      : 10;

    // Parse filter params
    const usuario = searchParams.get('usuario') || undefined;
    const cargo = searchParams.get('cargo') as Cargo | null;
    const estado = searchParams.get('estado') as Estado | null;

    // Build where clause with AND logic for combinable filters
    const where: Record<string, unknown> = {};

    if (usuario) {
      where.usuario = {
        contains: usuario,
        mode: 'insensitive',
      };
    }

    if (cargo && ['Profesor', 'Jefe', 'Administrativo'].includes(cargo)) {
      where.cargo = cargo;
    }

    if (estado && ['Activo', 'Inactivo'].includes(estado)) {
      where.estado = estado;
    }

    // Filter by user's programa (micrositio isolation)
    // Include users with exact programa_id OR dual-program users (organizacion contains the code)
    if (filterProgramaId) {
      const currentProgCode = session.programa_codigo;
      where.OR = [
        { programa_id: filterProgramaId },
        ...(currentProgCode ? [{ organizacion: { contains: currentProgCode } }] : []),
      ];
    }

    // Get total count for pagination
    const totalRecords = await prisma.user.count({ where });
    const totalPages = Math.ceil(totalRecords / pageSize);

    // Fetch users with pagination, excluding password_hash
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        usuario: true,
        nombre: true,
        cargo: true,
        organizacion: true,
        estado: true,
        created_at: true,
        updated_at: true,
        disabled_at: true,
        last_login_at: true,
        created_by: true,
        updated_by: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { created_at: 'desc' },
    });

    const response: PaginatedResponse<typeof users[number]> = {
      data: users,
      pagination: {
        page,
        pageSize,
        totalPages,
        totalRecords,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Ha ocurrido un error interno. Intente nuevamente.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users - Crear un nuevo usuario
 * Validates: Requirements 6.3, 6.7, 6.8, 6.9
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

    // 2. Parse and validate request body with createUserSchema
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
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

    const { usuario, password, cargo, estado } = parsed.data;

    // 3. Check if usuario already exists in DB → return 409
    const existingUser = await prisma.user.findUnique({
      where: { usuario },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe' },
        { status: 409 }
      );
    }

    // 4. Hash the password using hashPassword (bcryptjs 12 rounds)
    const password_hash = await hashPassword(password);

    // 5. Create user record with created_by = authenticated user's id
    // Assign the same programa as the creator (micrositio isolation)
    const creator = await prisma.user.findUnique({
      where: { id: session.id },
      select: { programa_id: true },
    });
    // For transversal admins, get programa from JWT session
    let newUserProgramaId = creator?.programa_id;
    if (!newUserProgramaId && (session.programa_id || session.programa_codigo)) {
      if (session.programa_id) {
        newUserProgramaId = session.programa_id;
      } else if (session.programa_codigo) {
        const sp = await prisma.programa.findFirst({ where: { codigo: session.programa_codigo }, select: { id: true } });
        newUserProgramaId = sp?.id || null;
      }
    }

    const newUser = await prisma.user.create({
      data: {
        usuario,
        password_hash,
        cargo,
        estado,
        programa_id: newUserProgramaId,
        organizacion: session.programa_codigo || null,
        created_by: session.id,
      },
    });

    // 6. Return 201 with the created user data (exclude password_hash)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _hash, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Ha ocurrido un error interno. Intente nuevamente.' },
      { status: 500 }
    );
  }
}
