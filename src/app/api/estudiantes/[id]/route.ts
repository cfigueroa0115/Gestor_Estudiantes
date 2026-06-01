import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/estudiantes/[id] - Buscar estudiante por ID
 * Ruta pública (para autogestión QR) y privada
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const estudiante = await prisma.estudiante.findUnique({
      where: { id_estudiante: id },
      select: {
        nombres: true,
        apellidos: true,
        correo: true,
        telefono: true,
      },
    });

    if (!estudiante) {
      return NextResponse.json({ found: false }, { status: 404 });
    }

    return NextResponse.json({
      found: true,
      nombres: estudiante.nombres || '',
      apellidos: estudiante.apellidos || '',
      correo: estudiante.correo || '',
      celular: estudiante.telefono || '',
    });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
