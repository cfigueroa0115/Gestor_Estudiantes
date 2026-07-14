import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getSessionFromCookie } from '@/lib/auth';

const ADMIN_USERS = ['1129564302', '52317897', '455651', '330032'];

/**
 * GET /api/admin/export-all - Exportar reporte consolidado de TODOS los programas
 * Solo accesible por super admins
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = await getSessionFromCookie(cookieStore);
    if (!session || !ADMIN_USERS.includes(session.usuario)) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Get ALL requests from ALL programs
    const requests = await prisma.studentRequest.findMany({
      include: { creator: { select: { usuario: true, cargo: true } } },
      orderBy: { created_at: 'desc' },
    });

    // CSV headers
    const headers = [
      'Programa', 'N° Radicado', 'Fecha solicitud', 'ID estudiante', 'Nro Documento',
      'Nombres', 'Apellidos', 'Correo', 'Celular', 'Modalidad',
      'Tipo solicitud', 'Descripción', 'Requiere escalar', 'Área escalar',
      'Estado', 'Fecha estado', 'Observaciones', 'Gestiones',
      'Usuario creador', 'Cargo creador', 'Fecha creación',
    ];

    const BOM = '\uFEFF';
    const delimiter = ';';

    const rows = requests.map(r => {
      const estadoFecha = r.estado_solicitud_fecha ? new Date(r.estado_solicitud_fecha).toISOString().split('T')[0] : '';
      const createdAt = r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '';
      const fechaSol = r.fecha_solicitud ? new Date(r.fecha_solicitud).toISOString().split('T')[0] : '';

      return [
        r.programa || '',
        r.numero_radicado,
        fechaSol,
        r.id_estudiante,
        r.nro_documento || '',
        r.nombres,
        r.apellidos,
        r.correo,
        r.celular,
        r.modalidad,
        r.tipo_solicitud,
        (r.descripcion_solicitud || '').replace(/[\n\r;]/g, ' '),
        r.requiere_escalar ? 'Sí' : 'No',
        r.area_escalar || '',
        r.estado_solicitud,
        estadoFecha,
        (r.observaciones || '').replace(/[\n\r;]/g, ' '),
        String(r.gestion_count),
        r.creator?.usuario || '',
        r.creator?.cargo || '',
        createdAt,
      ].map(v => `"${v}"`).join(delimiter);
    });

    const csv = BOM + headers.join(delimiter) + '\n' + rows.join('\n');

    const now = new Date();
    const filename = `reporte_consolidado_${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
