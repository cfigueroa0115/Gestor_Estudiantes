import nodemailer from 'nodemailer';
import { ESCALATION_EMAIL_CONFIG } from './email-config';

/**
 * Creates a nodemailer transporter configured for Microsoft 365 / Office 365.
 * Uses STARTTLS on port 587 as required by Microsoft.
 * 
 * Environment variables required:
 * - SMTP_HOST: smtp.office365.com
 * - SMTP_PORT: 587
 * - SMTP_USER: sandra.rodriguezac@ucc.edu.co
 * - SMTP_PASS: App Password or account password (configured in Vercel, never in code)
 * - SMTP_FROM: "Portal Gestión de Estudiantes UCC <sandra.rodriguezac@ucc.edu.co>"
 */
function createTransporter() {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort, 10),
    secure: false, // false for STARTTLS on port 587
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false,
    },
  });
}

/**
 * Send an escalation email when a student request is escalated.
 * Uses Microsoft 365 SMTP with STARTTLS.
 * Sender: sandra.rodriguezac@ucc.edu.co (configured via SMTP_FROM env var)
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

  const smtpFrom = process.env.SMTP_FROM;

  if (!smtpFrom) {
    console.error('[Email] SMTP_FROM no configurado.');
    return false;
  }

  const transporter = createTransporter();

  if (!transporter) {
    console.error('[Email] Servicio de correo no configurado. Variables faltantes: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS. Configure las credenciales en Vercel.');
    return false;
  }

  // Find email config for the area
  const emailConfig = ESCALATION_EMAIL_CONFIG.find(
    (config) => config.area.toLowerCase() === area.toLowerCase()
  );

  if (!emailConfig) {
    console.error(`[Email] No se encontró configuración de correo para el área: ${area}`);
    return false;
  }

  const now = new Date();
  const fechaFormateada = now.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #00ccaf, #43a047); padding: 20px; border-radius: 8px 8px 0 0;">
        <h2 style="color: #fff; margin: 0;">Solicitud Escalada</h2>
        <p style="color: #e0f7fa; margin: 4px 0 0;">Portal de Gestión de Estudiantes UCC</p>
      </div>
      <div style="border: 1px solid #e0e0e0; border-top: none; padding: 20px; border-radius: 0 0 8px 8px;">
        <p style="color: #333;">Se ha escalado una solicitud estudiantil al área <strong>${area}</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; background: #f5f5f5;">N° Radicado</td><td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; color: #00796b;">${numeroRadicado}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; background: #f5f5f5;">Estudiante</td><td style="padding: 10px; border: 1px solid #e0e0e0;">${studentName}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; background: #f5f5f5;">ID Estudiante</td><td style="padding: 10px; border: 1px solid #e0e0e0;">${studentId}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; background: #f5f5f5;">Descripción</td><td style="padding: 10px; border: 1px solid #e0e0e0;">${requestDescription}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; background: #f5f5f5;">Área escalada</td><td style="padding: 10px; border: 1px solid #e0e0e0;">${area}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; background: #f5f5f5;">Fecha</td><td style="padding: 10px; border: 1px solid #e0e0e0;">${fechaFormateada}</td></tr>
        </table>
        <p style="color: #999; font-size: 11px; margin-top: 20px; border-top: 1px solid #eee; padding-top: 12px;">
          Este es un correo automático generado por el Portal de Gestión de Estudiantes UCC.<br>
          Programa de Ingeniería Industrial - Universidad Cooperativa de Colombia.
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: smtpFrom,
      to: emailConfig.to,
      cc: emailConfig.cc.join(', '),
      subject: `[Escalamiento] Radicado ${numeroRadicado} - Área ${area} - ${studentName}`,
      html: htmlBody,
    });

    console.log(`[Email] Correo enviado exitosamente. Radicado: ${numeroRadicado}, Área: ${area}, Destino: ${emailConfig.to}`);
    return true;
  } catch (error) {
    console.error('[Email] Error al enviar correo de escalamiento:', error instanceof Error ? error.message : error);
    return false;
  }
}
