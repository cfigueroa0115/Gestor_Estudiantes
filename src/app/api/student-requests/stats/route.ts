import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie } from '@/lib/auth';

/**
 * GET /api/student-requests/stats
 * Returns aggregated statistics for the analytics dashboard.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = await getSessionFromCookie(cookieStore);

    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Get all requests for stats
    const allRequests = await prisma.studentRequest.findMany({
      select: {
        estado_solicitud: true,
        tipo_solicitud: true,
        modalidad: true,
        requiere_escalar: true,
        area_escalar: true,
        created_at: true,
        estado_solicitud_fecha: true,
      },
    });

    // Count by estado
    const estadoCounts: Record<string, number> = {};
    allRequests.forEach((r) => {
      const estado = r.estado_solicitud || 'Radicada';
      estadoCounts[estado] = (estadoCounts[estado] || 0) + 1;
    });

    // Count by tipo_solicitud
    const tipoCounts: Record<string, number> = {};
    allRequests.forEach((r) => {
      tipoCounts[r.tipo_solicitud] = (tipoCounts[r.tipo_solicitud] || 0) + 1;
    });

    // Count by modalidad
    const modalidadCounts: Record<string, number> = {};
    allRequests.forEach((r) => {
      modalidadCounts[r.modalidad] = (modalidadCounts[r.modalidad] || 0) + 1;
    });

    // Count escaladas by area
    const areaCounts: Record<string, number> = {};
    allRequests.filter((r) => r.requiere_escalar && r.area_escalar).forEach((r) => {
      areaCounts[r.area_escalar!] = (areaCounts[r.area_escalar!] || 0) + 1;
    });

    // Requests per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRequests = allRequests.filter((r) => r.created_at >= thirtyDaysAgo);
    const perDay: Record<string, number> = {};
    recentRequests.forEach((r) => {
      const day = r.created_at.toISOString().split('T')[0];
      perDay[day] = (perDay[day] || 0) + 1;
    });

    return NextResponse.json({
      total: allRequests.length,
      estadoCounts,
      tipoCounts,
      modalidadCounts,
      areaCounts,
      perDay,
      escaladas: allRequests.filter((r) => r.requiere_escalar).length,
    });
  } catch {
    return NextResponse.json(
      { error: 'Ha ocurrido un error interno.' },
      { status: 500 }
    );
  }
}
