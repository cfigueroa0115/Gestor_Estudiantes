import { Resend } from 'resend';

interface ExpiredAlertEmailParams {
  numeroRadicado: string;
  studentName: string;
  estado: string;
  diasVencida: number;
  descripcion: string;
}

/**
 * Builds the HTML email template for expired request alerts.
 * Uses RED color theme to indicate urgency/expiration.
 */
function buildExpiredAlertHtml(params: ExpiredAlertEmailParams): string {
  const { numeroRadicado, studentName, estado, diasVencida, descripcion } = params;
  const logoUrl = 'https://gestor-estudiantes-ucc.vercel.app/logo-ucc.jpeg';

  const estadoDisplay = estado === 'EnProgreso' ? 'En progreso' : estado;

  return [
    '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background-color:#f4f4f4;">',
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:30px 0;">',
    '<tr><td align="center">',
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">',

    // Header con logo - RED theme
    '<tr><td style="background:linear-gradient(135deg,#d32f2f,#b71c1c);padding:30px 40px;text-align:center;">',
    `<img src="${logoUrl}" alt="UCC" width="80" height="80" style="width:80px;height:80px;border-radius:12px;margin-bottom:12px;object-fit:contain;background:#fff;padding:4px;">`,
    '<h1 style="color:#ffffff;font-family:Arial,sans-serif;font-size:22px;margin:0;font-weight:700;">&#9888; Solicitud Vencida</h1>',
    '<p style="color:#ffcdd2;font-family:Arial,sans-serif;font-size:13px;margin:6px 0 0;">Portal de Gesti&#243;n de Estudiantes UCC</p>',
    '</td></tr>',

    // Badge de alerta
    '<tr><td style="padding:24px 40px 0;text-align:center;">',
    `<span style="display:inline-block;background-color:#ffebee;color:#c62828;font-family:Arial,sans-serif;font-size:12px;font-weight:700;padding:6px 16px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;">&#9888; ALERTA VENCIMIENTO - ${diasVencida.toFixed(1)} d&#237;as</span>`,
    '</td></tr>',

    // Cuerpo
    '<tr><td style="padding:24px 40px;">',
    '<p style="color:#333;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;margin:0 0 20px;">',
    `La siguiente solicitud ha <strong>excedido el tiempo m&#225;ximo</strong> permitido en estado <strong>${estadoDisplay}</strong> y requiere atenci&#243;n inmediata.`,
    '</p>',

    // Tabla de datos
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">',
    `<tr><td style="padding:14px 16px;background:#ffebee;border-bottom:1px solid #e0e0e0;font-family:Arial,sans-serif;font-size:12px;color:#666;font-weight:600;width:140px;">N&#176; RADICADO</td><td style="padding:14px 16px;background:#ffebee;border-bottom:1px solid #e0e0e0;font-family:Arial,sans-serif;font-size:16px;color:#c62828;font-weight:700;">${numeroRadicado}</td></tr>`,
    `<tr><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-family:Arial,sans-serif;font-size:12px;color:#666;font-weight:600;">ESTUDIANTE</td><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-family:Arial,sans-serif;font-size:14px;color:#333;">${studentName}</td></tr>`,
    `<tr><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-family:Arial,sans-serif;font-size:12px;color:#666;font-weight:600;">ESTADO</td><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-family:Arial,sans-serif;font-size:14px;color:#c62828;font-weight:700;">${estadoDisplay}</td></tr>`,
    `<tr><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-family:Arial,sans-serif;font-size:12px;color:#666;font-weight:600;">D&#205;AS VENCIDA</td><td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-family:Arial,sans-serif;font-size:14px;color:#c62828;font-weight:700;">${diasVencida.toFixed(1)} d&#237;as</td></tr>`,
    `<tr><td style="padding:12px 16px;font-family:Arial,sans-serif;font-size:12px;color:#666;font-weight:600;">DESCRIPCI&#211;N</td><td style="padding:12px 16px;font-family:Arial,sans-serif;font-size:14px;color:#333;">${descripcion}</td></tr>`,
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
 * Send expired alert emails to both admins using the dual Resend API key pattern.
 * Each recipient gets their own email sent via their own Resend API key.
 */
export async function sendExpiredAlertEmail(params: ExpiredAlertEmailParams): Promise<boolean> {
  const { numeroRadicado, estado } = params;

  const estadoDisplay = estado === 'EnProgreso' ? 'En progreso' : estado;
  const fromAddress = process.env.EMAIL_FROM || 'Portal Gestion Estudiantes UCC <onboarding@resend.dev>';
  const subject = `[ALERTA VENCIMIENTO] Radicado ${numeroRadicado} - ${estadoDisplay} - Vencida`;
  const htmlBody = buildExpiredAlertHtml(params);

  const recipients = [
    { email: 'sandra.rodriguezac@ucc.edu.co', apiKeyEnvVar: 'RESEND_API_KEY_SANDRA' },
    { email: 'carlos.figueroama@campusucc.edu.co', apiKeyEnvVar: 'RESEND_API_KEY_CARLOS' },
  ];

  let allSent = true;

  for (const recipient of recipients) {
    const apiKey = process.env[recipient.apiKeyEnvVar];
    if (!apiKey) {
      console.error(`[Email Alert] Falta variable ${recipient.apiKeyEnvVar} para ${recipient.email}`);
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
        console.error(`[Email Alert] Error enviando a ${recipient.email}:`, error.message);
        allSent = false;
      } else {
        console.log(`[Email Alert] Alerta enviada a ${recipient.email}. Radicado: ${numeroRadicado}`);
      }
    } catch (err) {
      console.error(`[Email Alert] Error enviando a ${recipient.email}:`, err instanceof Error ? err.message : err);
      allSent = false;
    }
  }

  return allSent;
}
