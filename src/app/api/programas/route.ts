import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/programas - Listar programas activos (público, para el login)
 */
export async function GET() {
  try {
    const programas = await prisma.programa.findMany({
      where: { activo: true },
      select: { id: true, codigo: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json(programas);
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
