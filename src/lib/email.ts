import nodemailer from 'nodemailer';
import { ESCALATION_EMAIL_CONFIG } from './email-config';

/**
 * Send an escalation email when a student request is escalated to a specific area.
 * If SMTP is not configured (env vars missing), logs a warning and skips sending.
 */
export async function sendEscalationEmail(params: {
  area: string;
  studentName: string;
  studentId: string;
  requestDescription: string;
  requestId: string;
}): Promise<boolean> {
  const { area, studentName, studentId, requestDescription, requestId } = params;

  // Check SMTP configuration
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass || !smtpFrom) {
    console.warn('[Email] SMTP no configurado. Variables faltantes: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM. Se omite el envío del correo de escalamiento.');
    return false;
  }

  // Find email config for the area
  const emailConfig = ESCALATION_EMAIL_CONFIG.find(
    (config) => config.area.toLowerCase() === area.toLowerCase()
  );

  if (!emailConfig) {
    console.warn(`[Email] No se encontró configuración de correo para el área: ${area}`);
    return false;
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort, 10),
    secure: parseInt(smtpPort, 10) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const now = new Date();
  const fechaFormateada = now.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Solicitud Escalada - Portal de Gestión de Estudiantes UCC</h2>
      <p>Se ha escalado una solicitud estudiantil al área <strong>${area}</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">ID Solicitud</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${requestId}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Estudiante</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${studentName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">ID Estudiante</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${studentId}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Descripción</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${requestDescription}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Área escalada</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${area}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">Fecha de escalamiento</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${fechaFormateada}</td>
        </tr>
      </table>
      <p style="color: #666; font-size: 12px;">Este es un correo automático generado por el Portal de Gestión de Estudiantes UCC.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to: emailConfig.to,
      cc: emailConfig.cc.join(', '),
      subject: `[Escalamiento] Solicitud estudiantil - Área ${area} - ${studentName}`,
      html: htmlBody,
    });

    console.log(`[Email] Correo de escalamiento enviado exitosamente para solicitud ${requestId} al área ${area}`);
    return true;
  } catch (error) {
    console.error('[Email] Error al enviar correo de escalamiento:', error);
    return false;
  }
}
