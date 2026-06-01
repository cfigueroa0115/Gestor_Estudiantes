import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { studentRequestSchema } from '@/lib/validations/student-request.schema';
import { TipoSolicitud } from '@prisma/client';
import { generateNumeroRadicado } from '@/lib/radicado';
import { sendEscalationEmail } from '@/lib/email';

const TIPO_SOLICITUD_MAP: Record<string, TipoSolicitud> = {
  'Académico': TipoSolicitud.Academico,
  'Financiero': TipoSolicitud.Financiero,
  'Certificados': TipoSolicitud.Certificados,
};

/**
 * POST /api/autogestion - Crear solicitud sin autenticación (acceso QR estudiantes)
 * No requiere sesión. El created_by_user_id usa un usuario sistema.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = studentRequestSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.');
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      return NextResponse.json({ error: 'Error de validación', fields: fieldErrors }, { status: 400 });
    }

    const data = parsed.data;
    const tipoSolicitudPrisma = TIPO_SOLICITUD_MAP[data.tipo_solicitud];
    const numeroRadicado = generateNumeroRadicado();

    // Use first user as system user for self-service requests
    const systemUser = await prisma.user.findFirst({ select: { id: true } });
    if (!systemUser) {
      return NextResponse.json({ error: 'Error de configuración del sistema' }, { status: 500 });
    }

    const created = await prisma.studentRequest.create({
      data: {
        numero_radicado: numeroRadicado,
        fecha_solicitud: new Date(data.fecha_solicitud),
        id_estudiante: data.id_estudiante,
        nombres: data.nombres,
        apellidos: data.apellidos,
        correo: data.correo,
        celular: data.celular,
        programa: data.programa,
        modalidad: data.modalidad,
        tipo_solicitud: tipoSolicitudPrisma,
        solicitud_academica: data.solicitud_academica ?? null,
        solicitud_financiera: data.solicitud_financiera ?? null,
        descripcion_solicitud: data.descripcion_solicitud,
        requiere_escalar: data.requiere_escalar,
        area_escalar: data.area_escalar ?? null,
        created_by_user_id: systemUser.id,
        estado_solicitud: 'Radicada',
        estado_solicitud_fecha: new Date(),
      },
    });

    // Escalation email if needed
    if (data.requiere_escalar && data.area_escalar) {
      try {
        await prisma.studentRequest.update({
          where: { id: created.id },
          data: { estado_solicitud: 'Escalada', estado_solicitud_fecha: new Date() },
        });
        await sendEscalationEmail({
          area: data.area_escalar,
          studentName: `${data.nombres} ${data.apellidos}`,
          studentId: data.id_estudiante,
          requestDescription: data.descripcion_solicitud,
          requestId: created.id,
          numeroRadicado,
        });
      } catch { /* don't fail */ }
    }

    return NextResponse.json({ id: created.id, numero_radicado: numeroRadicado }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Ha ocurrido un error interno.' }, { status: 500 });
  }
}
