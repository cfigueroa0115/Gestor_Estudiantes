import { Resend } from 'resend';
import { ESCALATION_EMAIL_CONFIG } from './email-config';

/**
 * Builds the HTML email template for escalation notifications.
 * Uses HTML entities for special characters and inline styles for email compatibility.
 * Includes UCC logo from the production URL.
 */
function buildEmailHtml(params: {
  area: string;
  studentName: string;
  studentId: string;
  requestDescription: string;
  numeroRadicado: string;
  fecha: string;
}): string {
  const { area, studentName, studentId, requestDescription, numeroRadicado, fecha } = params;
  const logoUrl = 'https://gestor-estudiantes-ucc.vercel.app/logo-ucc.jpeg';

  return [
    '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#f4f4f4;">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:30px 0;">',
    '<tr><td align="center">',
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">',

    // Header con logo
    '<tr><td style="background:linear-gradient(135deg,#00ccaf,#2e7d32);padding:30px 40px;text-align:center;">',
    `<img src="${logoUrl}" alt="UCC" width="80" height="80" style="width:80px;height:80px;border-radius:12px;margin-bottom:12px;object-fit:contain;background:#fff;padding:4px;">`,
    '<h1 style="color:#ffffff;font-family:Arial,sans-serif;font-size:22px;margin:0;font-weight:700;">Solicitud Escalada</h1>',
    '<p style="color:#e0f7fa;font-family:Arial,sans-serif;font-size:13px;margin:6px 0 0;">Portal de Gesti&#243;n de Estudiantes UCC</p>',
    '</td></tr>',

    // Badge de estado
    '<tr><td style="padding:24px 40px 0;text-align:center;">',
    `<span style="display:inline-block;background-color:#fff3e0;color:#e65100;font-family:Arial,sans-serif;font-size:12px;font-weight:700;padding:6px 16px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">Escalada a ${area}</span>`,
    '</td></tr>',

    // Cuerpo
    '<tr><td style="padding:24px 40px;">',
    '<p style="color:#333;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;margin:0 0 20px;">',
    `Se ha escalado una solicitud estudiantil que requiere atenci&#243;n del &#225;rea <strong>${area}</strong>.`,
    '</p>',

    // Tabla de datos
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">',
    `<tr><td style="padding:14px 16px;background:#f8fffe;border-bottom:1px solid #e0e0e0;font-family:Arial,sans-serif;font-size:12px;color:#666;font-weight:600;width:140px;">N&#176; RADICADO</td><td style="padding:14px 16px;background:#f8fffe;border-bottom:1px solid #e0e0e0;font-family:Arial,sans-serif;font-size:16px;color:#00796b;font-weight:700;">${numeroRadicado}</td></tr>`,
    `<tr><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-family:Arial,sans-serif;font-size:12px;color:#666;font-weight:600;">ESTUDIANTE</td><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-family:Arial,sans-serif;font-size:14px;color:#333;">${studentName}</td></tr>`,
    `<tr><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-family:Arial,sans-serif;font-size:12px;color:#666;font-weight:600;">ID ESTUDIANTE</td><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-family:Arial,sans-serif;font-size:14px;color:#333;">${studentId}</td></tr>`,
    `<tr><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-family:Arial,sans-serif;font-size:12px;color:#666;font-weight:600;">DESCRIPCI&#211;N</td><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-family:Arial,sans-serif;font-size:14px;color:#333;">${requestDescription}</td></tr>`,
    `<tr><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-family:Arial,sans-serif;font-size:12px;color:#666;font-weight:600;">&#193;REA ESCALADA</td><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-family:Arial,sans-serif;font-size:14px;color:#333;font-weight:600;">${area}</td></tr>`,
    `<tr><td style="padding:12px 16px;font-family:Arial,sans-serif;font-size:12px;color:#666;font-weight:600;">FECHA</td><td style="padding:12px 16px;font-family:Arial,sans-serif;font-size:14px;color:#333;">${fecha}</td></tr>`,
    '</table>',
    '</td></tr>',

    // Footer
    '<tr><td style="padding:20px 40px 30px;border-top:1px solid #f0f0f0;">',
    '<p style="font-family:Arial,sans-serif;font-size:11px;color:#999;margin:0;line-height:1.5;text-align:center;">',
    'Este es un correo autom&#225;tico generado por el Portal de Gesti&#243;n de Estudiantes UCC.<br>',
    'Programa de Ingenier&#237;a Industrial &#8226; Universidad Cooperativa de Colombia<br>',
    '&#169; Mgtr. Carlos Alberto Figueroa',
    '</p></td></tr>',

    '</table></td></tr></table></body></html>',
  ].join('');
}


/**
 * Send escalation emails to all configured recipients for the given area.
 * Each recipient gets their own email sent via their own Resend API key.
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
  const subject = `[Escalamiento] Radicado ${numeroRadicado} - Area ${area} - ${studentName}`;
  const htmlBody = buildEmailHtml({ area, studentName, studentId, requestDescription, numeroRadicado, fecha });

  let allSent = true;

  for (const recipient of emailConfig.recipients) {
    const apiKey = process.env[recipient.apiKeyEnvVar];
    if (!apiKey) {
      console.error(`[Email] Falta variable ${recipient.apiKeyEnvVar} para ${recipient.email}`);
      allSent = false;
      continue;
    }

    try {
      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: fromAddress,
        to: [recipient.email],
        subject,
        html: htmlBody,
      });

      if (error) {
        console.error(`[Email] Error enviando a ${recipient.email}:`, error.message);
        allSent = false;
      } else {
        console.log(`[Email] Enviado a ${recipient.email}. Radicado: ${numeroRadicado}`);
      }
    } catch (err) {
      console.error(`[Email] Error enviando a ${recipient.email}:`, err instanceof Error ? err.message : err);
      allSent = false;
    }
  }

  return allSent;
}
