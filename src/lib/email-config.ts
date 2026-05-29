export interface EscalationEmailConfig {
  area: string;
  to: string;
  cc: string[];
}

/**
 * Configuracion de correos de escalamiento por area.
 * 
 * Destinatario principal: carlos.figueroama@campusucc.edu.co
 * CC: sandra.rodriguezac@ucc.edu.co (requiere verificacion de dominio en Resend)
 * 
 * PENDIENTE: Una vez el area de TI de la UCC agregue los registros DNS
 * en campusucc.edu.co, el dominio se verificara y los CC funcionaran.
 * Registros requeridos:
 * - MX: send -> feedback-smtp.sa-east-1.amazonses.com
 * - TXT: resend._domainkey -> (clave DKIM)
 * - TXT: send -> v=spf1 include:amazonses.com ~all
 */
export const ESCALATION_EMAIL_CONFIG: EscalationEmailConfig[] = [
  { area: 'Financiera', to: 'carlos.figueroama@campusucc.edu.co', cc: ['sandra.rodriguezac@ucc.edu.co'] },
  { area: 'Registro', to: 'carlos.figueroama@campusucc.edu.co', cc: ['sandra.rodriguezac@ucc.edu.co'] },
  { area: 'Tesorería', to: 'carlos.figueroama@campusucc.edu.co', cc: ['sandra.rodriguezac@ucc.edu.co'] },
];
