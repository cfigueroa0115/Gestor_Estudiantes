import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie } from '@/lib/auth';

const ADMIN_USERS = ['1129564302', '52317897', '455651', '330032'];

/**
 * GET /api/admin/stats-all - Estadísticas consolidadas de todos los programas
 * Solo accesible por super admins
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = await getSessionFromCookie(cookieStore);
    if (!session || !ADMIN_USERS.includes(session.usuario)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const programas = await prisma.programa.findMany({
      where: { activo: true },
      select: { codigo: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });

    const stats = [];
    for (const prog of programas) {
      const total = await prisma.studentRequest.count({ where: { programa: { equals: prog.nombre, mode: 'insensitive' } } });
      const radicadas = await prisma.studentRequest.count({ where: { programa: { equals: prog.nombre, mode: 'insensitive' }, estado_solicitud: 'Radicada' } });
      const escaladas = await prisma.studentRequest.count({ where: { programa: { equals: prog.nombre, mode: 'insensitive' }, estado_solicitud: 'Escalada' } });
      const enProgreso = await prisma.studentRequest.count({ where: { programa: { equals: prog.nombre, mode: 'insensitive' }, estado_solicitud: 'EnProgreso' } });
      const cerradas = await prisma.studentRequest.count({ where: { programa: { equals: prog.nombre, mode: 'insensitive' }, estado_solicitud: 'Cerrada' } });

      stats.push({
        codigo: prog.codigo,
        nombre: prog.nombre,
        total,
        radicadas,
        escaladas,
        enProgreso,
        cerradas,
      });
    }

    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
