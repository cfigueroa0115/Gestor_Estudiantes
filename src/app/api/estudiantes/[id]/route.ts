import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/estudiantes/[id] - Buscar estudiante por ID o Nro Documento
 * Ruta pública (para autogestión QR) y privada
 * Query param: ?by=documento → busca por nro_documento en lugar de id_estudiante
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParam = request.nextUrl.searchParams.get('by');

    let estudiante;

    if (searchParam === 'documento') {
      // Buscar por nro_documento
      estudiante = await prisma.estudiante.findFirst({
        where: { nro_documento: id },
        select: {
          id_estudiante: true,
          nro_documento: true,
          nombres: true,
          apellidos: true,
          correo: true,
          telefono: true,
        },
      });
    } else {
      // Buscar por id_estudiante (comportamiento original)
      estudiante = await prisma.estudiante.findUnique({
        where: { id_estudiante: id },
        select: {
          id_estudiante: true,
          nro_documento: true,
          nombres: true,
          apellidos: true,
          correo: true,
          telefono: true,
        },
      });
    }

    if (!estudiante) {
      return NextResponse.json({ found: false }, { status: 404 });
    }

    return NextResponse.json({
      found: true,
      id_estudiante: estudiante.id_estudiante || '',
      nro_documento: estudiante.nro_documento || '',
      nombres: estudiante.nombres || '',
      apellidos: estudiante.apellidos || '',
      correo: estudiante.correo || '',
      celular: estudiante.telefono || '',
    });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
