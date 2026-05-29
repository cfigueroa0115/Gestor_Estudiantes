import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie, hashPassword } from '@/lib/auth';
import { updateUserSchema } from '@/lib/validations/user.schema';

/**
 * PATCH /api/users/[id] - Editar usuario (cargo y/o password)
 * Validates: Requirements 6.4, 6.7, 6.9, 6.10
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // 2. Validate body with updateUserSchema
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

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

    // 3. Find user by id → 404 if not found
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // 4. Build update data
    const updateData: Record<string, unknown> = {
      updated_by: session.id,
    };

    const { cargo, password } = parsed.data;

    // If cargo provided: update cargo
    if (cargo !== undefined) {
      updateData.cargo = cargo;
    }

    // If password provided AND non-empty: hash and update password_hash
    // If password is empty string or not provided: DO NOT change password_hash
    if (password !== undefined && password !== '') {
      updateData.password_hash = await hashPassword(password);
    }

    // 5. Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // 6. Return 200 with updated user (without password_hash)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _hash, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Ha ocurrido un error interno. Intente nuevamente.' },
      { status: 500 }
    );
  }
}
