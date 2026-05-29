import { Resend } from 'resend';
import { ESCALATION_EMAIL_CONFIG } from './email-config';

/**
 * Send an escalation email when a student request is escalated.
 * Uses Resend API for reliable email delivery from serverless environments.
 * 
 * Required env var: RESEND_API_KEY
 * When Microsoft 365 credentials are available, the from address will be
 * sandra.rodriguezac@ucc.edu.co (requires domain verification in Resend).
 * For now uses onboarding@resend.dev as sender.
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
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });

  const fromAddress = process.env.EMAIL_FROM || 'Portal Gestión Estudiantes UCC <onboarding@resend.dev>';

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
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: [emailConfig.to],
      cc: emailConfig.cc,
      subject: `[Escalamiento] Radicado ${numeroRadicado} - Área ${area} - ${studentName}`,
      html: htmlBody,
    });

    if (error) {
      console.error('[Email] Error de Resend:', error.message);
      return false;
    }

    console.log(`[Email] Correo enviado. Radicado: ${numeroRadicado}, Área: ${area}, Destino: ${emailConfig.to}, CC: ${emailConfig.cc.join(', ')}`);
    return true;
  } catch (error) {
    console.error('[Email] Error al enviar correo:', error instanceof Error ? error.message : error);
    return false;
  }
}
