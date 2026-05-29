import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie } from '@/lib/auth';
import { z } from 'zod';

/**
 * Schema for status update validation.
 */
const updateStatusSchema = z.object({
  estado: z.enum(['Activo', 'Inactivo'], {
    message: 'El estado debe ser Activo o Inactivo',
  }),
});

/**
 * PATCH /api/users/[id]/status - Activar/Desactivar usuario
 * Validates: Requirements 6.5, 6.6, 6.7, 6.9, 6.10
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

    // 2. Validate body: { estado: 'Activo' | 'Inactivo' }
    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);

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

    // 4. Update based on estado value
    const { estado } = parsed.data;

    const updateData: Record<string, unknown> = {
      estado,
      updated_by: session.id,
    };

    if (estado === 'Inactivo') {
      // Deactivate: set disabled_at to now
      updateData.disabled_at = new Date();
    } else {
      // Reactivate: clear disabled_at
      updateData.disabled_at = null;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // 5. Return 200 with updated user (without password_hash)
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
