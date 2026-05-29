import { Resend } from 'resend';
import { ESCALATION_EMAIL_CONFIG } from './email-config';

/**
 * Send an escalation email when a student request is escalated.
 * Uses Resend API for reliable email delivery from serverless environments.
 * Required env var: RESEND_API_KEY
 */
export async function sendEscalationEmail(params: {
  area: string;
  studentName: string;
  studentId: string;
  requestDescription: string;
  requestId: string;
  numeroRadicado: string;
}): Promise<boolean> {
  const { area, studentName, studentId, requestDescription, numeroRadicado } = params;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[Email] Servicio de correo no configurado. Falta RESEND_API_KEY.');
    return false;
  }

  const emailConfig = ESCALATION_EMAIL_CONFIG.find(
    (config) => config.area.toLowerCase() === area.toLowerCase()
  );
  if (!emailConfig) {
    console.error(`[Email] No se encontro configuracion para el area: ${area}`);
    return false;
  }

  const now = new Date();
  const fecha = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  const fromAddress = process.env.EMAIL_FROM || 'Portal Gestion Estudiantes UCC <onboarding@resend.dev>';

  const htmlBody = [
    '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"></head><body>',
    '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">',
    '<div style="background:linear-gradient(135deg,#00ccaf,#43a047);padding:20px;border-radius:8px 8px 0 0;">',
    '<h2 style="color:#fff;margin:0;">Solicitud Escalada</h2>',
    '<p style="color:#e0f7fa;margin:4px 0 0;">Portal de Gesti&#243;n de Estudiantes UCC</p>',
    '</div>',
    '<div style="border:1px solid #e0e0e0;border-top:none;padding:20px;border-radius:0 0 8px 8px;">',
    `<p style="color:#333;">Se ha escalado una solicitud estudiantil al &#225;rea <strong>${area}</strong>.</p>`,
    '<table style="width:100%;border-collapse:collapse;margin:16px 0;">',
    `<tr><td style="padding:10px;border:1px solid #e0e0e0;font-weight:bold;background:#f5f5f5;">N&#176; Radicado</td><td style="padding:10px;border:1px solid #e0e0e0;font-weight:bold;color:#00796b;">${numeroRadicado}</td></tr>`,
    `<tr><td style="padding:10px;border:1px solid #e0e0e0;font-weight:bold;background:#f5f5f5;">Estudiante</td><td style="padding:10px;border:1px solid #e0e0e0;">${studentName}</td></tr>`,
    `<tr><td style="padding:10px;border:1px solid #e0e0e0;font-weight:bold;background:#f5f5f5;">ID Estudiante</td><td style="padding:10px;border:1px solid #e0e0e0;">${studentId}</td></tr>`,
    `<tr><td style="padding:10px;border:1px solid #e0e0e0;font-weight:bold;background:#f5f5f5;">Descripci&#243;n</td><td style="padding:10px;border:1px solid #e0e0e0;">${requestDescription}</td></tr>`,
    `<tr><td style="padding:10px;border:1px solid #e0e0e0;font-weight:bold;background:#f5f5f5;">&#193;rea escalada</td><td style="padding:10px;border:1px solid #e0e0e0;">${area}</td></tr>`,
    `<tr><td style="padding:10px;border:1px solid #e0e0e0;font-weight:bold;background:#f5f5f5;">Fecha</td><td style="padding:10px;border:1px solid #e0e0e0;">${fecha}</td></tr>`,
    '</table>',
    '<p style="color:#999;font-size:11px;margin-top:20px;border-top:1px solid #eee;padding-top:12px;">',
    'Este es un correo autom&#225;tico generado por el Portal de Gesti&#243;n de Estudiantes UCC.<br>',
    'Programa de Ingenier&#237;a Industrial - Universidad Cooperativa de Colombia.',
    '</p></div></div></body></html>',
  ].join('');

  try {
    const resend = new Resend(apiKey);
    const recipients = [emailConfig.to];
    const ccList = emailConfig.cc.length > 0 ? emailConfig.cc : undefined;

    // Intentar enviar con CC
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: recipients,
      cc: ccList,
      subject: `[Escalamiento] Radicado ${numeroRadicado} - Area ${area} - ${studentName}`,
      html: htmlBody,
    });

    if (error) {
      // Si falla con CC, reintentar sin CC
      if (ccList && ccList.length > 0) {
        console.warn('[Email] Fallo con CC, reintentando sin CC:', error.message);
        const { error: retryError } = await resend.emails.send({
          from: fromAddress,
          to: recipients,
          subject: `[Escalamiento] Radicado ${numeroRadicado} - Area ${area} - ${studentName}`,
          html: htmlBody,
        });
        if (retryError) {
          console.error('[Email] Error en reintento sin CC:', retryError.message);
          return false;
        }
        console.log(`[Email] Correo enviado sin CC. Radicado: ${numeroRadicado}, To: ${emailConfig.to}`);
        return true;
      }
      console.error('[Email] Error de Resend:', error.message);
      return false;
    }

    console.log(`[Email] Correo enviado. Radicado: ${numeroRadicado}, Area: ${area}, To: ${emailConfig.to}, CC: ${emailConfig.cc.join(', ')}`);
    return true;
  } catch (error) {
    console.error('[Email] Error al enviar:', error instanceof Error ? error.message : error);
    return false;
  }
}
