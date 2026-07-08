import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/validations/auth.schema';
import { signToken, setSessionCookie, comparePassword } from '@/lib/auth';

const GENERIC_ERROR = 'Credenciales inválidas';
const LOCKED_ERROR = 'Cuenta bloqueada temporalmente. Intente en 15 minutos.';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body with Zod schema
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos';
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      );
    }

    const { usuario, contrasena, cargo } = parsed.data;

    // Find user by "usuario" field (include programa relation)
    const user = await prisma.user.findUnique({
      where: { usuario },
      include: { programa: { select: { id: true, codigo: true } } },
    });

    // Check if account is locked (must check before other validations)
    if (user?.locked_until && user.locked_until > new Date()) {
      return NextResponse.json(
        { success: false, error: LOCKED_ERROR },
        { status: 401 }
      );
    }

    // Perform all authentication checks
    // Use a flag to track failure without early-returning (prevents timing attacks)
    let authFailed = false;

    if (!user) {
      authFailed = true;
    } else if (user.estado !== 'Activo') {
      authFailed = true;
    } else if (user.cargo !== cargo) {
      authFailed = true;
    }

    // Always perform password comparison to maintain consistent response time
    // If user doesn't exist, compare against a dummy hash
    const dummyHash = '$2a$12$000000000000000000000uGHEfMTNHNHHHHHHHHHHHHHHHHHHHHH';
    const passwordMatch = await comparePassword(
      contrasena,
      user?.password_hash ?? dummyHash
    );

    if (!passwordMatch) {
      authFailed = true;
    }

    // Handle authentication failure
    if (authFailed) {
      // Increment failed_attempts if user exists
      if (user) {
        const newFailedAttempts = user.failed_attempts + 1;
        const updateData: { failed_attempts: number; locked_until?: Date } = {
          failed_attempts: newFailedAttempts,
        };

        // Lock account if max attempts reached
        if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
          updateData.locked_until = new Date(Date.now() + LOCKOUT_DURATION_MS);
        }

        await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }

      return NextResponse.json(
        { success: false, error: GENERIC_ERROR },
        { status: 401 }
      );
    }

    // Authentication successful - check programa restriction for dual-program users
    // Users with organizacion like "01TIC,01TAC" can ONLY access those programs
    if (user!.organizacion && user!.organizacion.includes(',') && parsed.data.programa) {
      const allowedPrograms = user!.organizacion.split(',').map(p => p.trim());
      if (!allowedPrograms.includes(parsed.data.programa)) {
        return NextResponse.json(
          { success: false, error: 'No tiene acceso a este programa' },
          { status: 401 }
        );
      }
    }

    // For users with a fixed programa (not null, not dual), they can only access their own programa
    if (user!.programa && parsed.data.programa && user!.programa.codigo !== parsed.data.programa) {
      // User has fixed program but selected a different one
      return NextResponse.json(
        { success: false, error: 'No tiene acceso a este programa' },
        { status: 401 }
      );
    }

    // Reset failed_attempts and update last_login_at
    await prisma.user.update({
      where: { id: user!.id },
      data: {
        failed_attempts: 0,
        locked_until: null,
        last_login_at: new Date(),
      },
    });

    // Generate JWT token (include programa info)
    // For transversal users (no programa_id), use the programa selected at login
    let tokenProgramaId = user!.programa?.id;
    let tokenProgramaCodigo = user!.programa?.codigo;

    if (!tokenProgramaId && parsed.data.programa) {
      // Transversal user - lookup the selected programa
      const selectedProg = await prisma.programa.findUnique({
        where: { codigo: parsed.data.programa },
        select: { id: true, codigo: true },
      });
      if (selectedProg) {
        tokenProgramaId = selectedProg.id;
        tokenProgramaCodigo = selectedProg.codigo;
      }
    }

    const token = await signToken({
      id: user!.id,
      usuario: user!.usuario,
      cargo: user!.cargo,
      programa_id: tokenProgramaId || undefined,
      programa_codigo: tokenProgramaCodigo || undefined,
    });

    // Create response and set session cookie
    const response = NextResponse.json({ success: true }, { status: 200 });
    setSessionCookie(response, token);

    return response;
  } catch {
    // Generic internal error - never expose details
    return NextResponse.json(
      { success: false, error: 'Ha ocurrido un error interno. Intente nuevamente.' },
      { status: 500 }
    );
  }
}
