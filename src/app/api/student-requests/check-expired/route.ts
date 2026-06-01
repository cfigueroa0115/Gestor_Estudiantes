import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendExpiredAlertEmail } from '@/lib/email-alert';

/**
 * Semaphore thresholds (in days) for each state.
 * A request is "vencida" (expired) when it exceeds the max time.
 */
const EXPIRATION_THRESHOLDS: Record<string, number> = {
  Radicada: 1,
  EnProgreso: 2,
  Escalada: 5,
};

/**
 * GET /api/student-requests/check-expired
 * 
 * Checks all requests that are expired based on the semaphore rules:
 * - Radicada: >1 day
 * - EnProgreso: >2 days
 * - Escalada: >5 days
 * 
 * For each expired request that hasn't been alerted yet, sends an alert email
 * to both admins and marks the request as alerted.
 * 
 * This endpoint can be called by a cron job or manually.
 */
export async function GET() {
  try {
    const now = new Date();

    // Fetch all non-closed requests that haven't been alerted yet
    const requests = await prisma.studentRequest.findMany({
      where: {
        alerta_vencimiento_enviada: false,
        estado_solicitud: {
          in: ['Radicada', 'EnProgreso', 'Escalada'],
        },
      },
      select: {
        id: true,
        numero_radicado: true,
        nombres: true,
        apellidos: true,
        estado_solicitud: true,
        estado_solicitud_fecha: true,
        created_at: true,
        descripcion_solicitud: true,
      },
    });

    let alertsSent = 0;
    let alertsFailed = 0;

    for (const request of requests) {
      const estadoDate = new Date(request.estado_solicitud_fecha || request.created_at);
      const diffDays = (now.getTime() - estadoDate.getTime()) / (1000 * 60 * 60 * 24);

      const threshold = EXPIRATION_THRESHOLDS[request.estado_solicitud];
      if (!threshold || diffDays <= threshold) {
        continue; // Not expired yet
      }

      // Send alert email
      const success = await sendExpiredAlertEmail({
        numeroRadicado: request.numero_radicado,
        studentName: `${request.nombres} ${request.apellidos}`,
        estado: request.estado_solicitud,
        diasVencida: diffDays,
        descripcion: request.descripcion_solicitud,
      });

      if (success) {
        // Mark as alerted to avoid duplicate emails
        await prisma.studentRequest.update({
          where: { id: request.id },
          data: { alerta_vencimiento_enviada: true },
        });
        alertsSent++;
      } else {
        alertsFailed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Verificación completada. Alertas enviadas: ${alertsSent}, fallidas: ${alertsFailed}`,
      alertsSent,
      alertsFailed,
      totalChecked: requests.length,
    });
  } catch (error) {
    console.error('[Check Expired] Error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Error interno al verificar solicitudes vencidas' },
      { status: 500 }
    );
  }
}
