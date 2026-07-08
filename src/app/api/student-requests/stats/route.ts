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

    // Profesores cannot access analytics dashboard (unless they are program admins)
    const userForRoleCheck = await prisma.user.findUnique({
      where: { id: session.id },
      select: { usuario: true, programa: { select: { admin_ids: true } } },
    });
    const isProfesorAdmin = userForRoleCheck?.programa?.admin_ids?.includes(userForRoleCheck.usuario) || false;
    if (session.cargo === 'Profesor' && !isProfesorAdmin) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 });
    }

    // Get user's programa for filtering
    const currentUser = await prisma.user.findUnique({
      where: { id: session.id },
      select: { programa: { select: { nombre: true } } },
    });
    // For transversal users, get programa from JWT session
    let userProgramaNombre = currentUser?.programa?.nombre;
    if (!userProgramaNombre && (session.programa_id || session.programa_codigo)) {
      const whereClause = session.programa_id ? { id: session.programa_id } : { codigo: session.programa_codigo! };
      const sessionProg = await prisma.programa.findFirst({ where: whereClause, select: { nombre: true } });
      userProgramaNombre = sessionProg?.nombre;
    }

    // Get all requests for stats (filtered by programa)
    const whereFilter = userProgramaNombre
      ? { programa: { equals: userProgramaNombre, mode: 'insensitive' as const } }
      : {};

    const allRequests = await prisma.studentRequest.findMany({
      where: whereFilter,
      select: {
        estado_solicitud: true,
        tipo_solicitud: true,
        modalidad: true,
        requiere_escalar: true,
        area_escalar: true,
        created_at: true,
        estado_solicitud_fecha: true,
        numero_radicado: true,
        fecha_solicitud: true,
        id_estudiante: true,
        nombres: true,
        apellidos: true,
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

    // Semaphore counts
    const now = new Date();
    let aTiempo = 0, enRiesgo = 0, vencida = 0;
    interface SemaforoItem { numero_radicado: string; fecha_solicitud: Date; id_estudiante: string; nombres: string; apellidos: string; semaforo: string; }
    const semaforoItems: { aTiempo: SemaforoItem[]; enRiesgo: SemaforoItem[]; vencida: SemaforoItem[] } = { aTiempo: [], enRiesgo: [], vencida: [] };

    allRequests.forEach((r) => {
      const estadoDate = new Date(r.estado_solicitud_fecha || r.created_at);
      const diffDays = (now.getTime() - estadoDate.getTime()) / (1000 * 60 * 60 * 24);
      const estado = r.estado_solicitud || 'Radicada';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const item = r as any;
      const sItem: SemaforoItem = { numero_radicado: item.numero_radicado || '', fecha_solicitud: item.fecha_solicitud || r.created_at, id_estudiante: item.id_estudiante || '', nombres: item.nombres || '', apellidos: item.apellidos || '', semaforo: '' };

      if (estado === 'Cerrada') { aTiempo++; sItem.semaforo = 'aTiempo'; semaforoItems.aTiempo.push(sItem); return; }
      if (estado === 'Radicada' && diffDays > 1) { vencida++; sItem.semaforo = 'vencida'; semaforoItems.vencida.push(sItem); return; }
      if (estado === 'EnProgreso' && diffDays > 2) { vencida++; sItem.semaforo = 'vencida'; semaforoItems.vencida.push(sItem); return; }
      if (estado === 'EnProgreso' && diffDays > 1) { enRiesgo++; sItem.semaforo = 'enRiesgo'; semaforoItems.enRiesgo.push(sItem); return; }
      if (estado === 'Escalada' && diffDays > 5) { vencida++; sItem.semaforo = 'vencida'; semaforoItems.vencida.push(sItem); return; }
      if (estado === 'Escalada' && diffDays > 3) { enRiesgo++; sItem.semaforo = 'enRiesgo'; semaforoItems.enRiesgo.push(sItem); return; }
      aTiempo++; sItem.semaforo = 'aTiempo'; semaforoItems.aTiempo.push(sItem);
    });

    return NextResponse.json({
      total: allRequests.length,
      estadoCounts,
      tipoCounts,
      modalidadCounts,
      areaCounts,
      perDay,
      escaladas: allRequests.filter((r) => r.requiere_escalar).length,
      semaforo: { aTiempo, enRiesgo, vencida },
      semaforoItems,
    });
  } catch {
    return NextResponse.json(
      { error: 'Ha ocurrido un error interno.' },
      { status: 500 }
    );
  }
}
