import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie } from '@/lib/auth';
import { EstadoSolicitud } from '@prisma/client';

const VALID_ESTADOS: Record<string, EstadoSolicitud> = {
  EnProgreso: EstadoSolicitud.EnProgreso,
  Cerrada: EstadoSolicitud.Cerrada,
};

/**
 * PATCH /api/student-requests/[id]/manage
 * Updates the estado_solicitud and observaciones of a student request.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate
    const cookieStore = await cookies();
    const session = await getSessionFromCookie(cookieStore);

    if (!session) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 2. Parse and validate body
    const body = await request.json();
    const { estado_solicitud, observaciones } = body;

    if (!estado_solicitud || !VALID_ESTADOS[estado_solicitud]) {
      return NextResponse.json(
        { error: 'Estado de solicitud inválido. Valores permitidos: EnProgreso, Cerrada' },
        { status: 400 }
      );
    }

    if (!observaciones || typeof observaciones !== 'string' || observaciones.trim().length === 0) {
      return NextResponse.json(
        { error: 'Las observaciones son obligatorias' },
        { status: 400 }
      );
    }

    if (observaciones.length > 1200) {
      return NextResponse.json(
        { error: 'Las observaciones no pueden exceder 1200 caracteres' },
        { status: 400 }
      );
    }

    // 3. Verify the request exists
    const existing = await prisma.studentRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      );
    }

    // 4. Update the record
    const updated = await prisma.studentRequest.update({
      where: { id },
      data: {
        estado_solicitud: VALID_ESTADOS[estado_solicitud],
        estado_solicitud_fecha: new Date(),
        observaciones: observaciones.trim(),
        updated_by: session.id,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Ha ocurrido un error interno. Intente nuevamente.' },
      { status: 500 }
    );
  }
}
