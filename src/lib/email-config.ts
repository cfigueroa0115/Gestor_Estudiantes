export interface EscalationEmailRecipient {
  email: string;
  apiKeyEnvVar: string; // nombre de la variable de entorno con la API key de Resend
}

export interface EscalationEmailConfig {
  area: string;
  recipients: EscalationEmailRecipient[];
}

/**
 * Configuracion de correos de escalamiento por area.
 * Cada destinatario tiene su propia API key de Resend (sin dominio verificado,
 * cada cuenta solo puede recibir correos en su propia direccion).
 * 
 * Variables de entorno requeridas:
 * - RESEND_API_KEY_SANDRA: API key de la cuenta sandra.rodriguezac@ucc.edu.co
 * - RESEND_API_KEY_CARLOS: API key de la cuenta carlos.figueroama@campusucc.edu.co
 */
export const ESCALATION_EMAIL_CONFIG: EscalationEmailConfig[] = [
  {
    area: 'Financiera',
    recipients: [
      { email: 'sandra.rodriguezac@ucc.edu.co', apiKeyEnvVar: 'RESEND_API_KEY_SANDRA' },
      { email: 'carlos.figueroama@campusucc.edu.co', apiKeyEnvVar: 'RESEND_API_KEY_CARLOS' },
    ],
  },
  {
    area: 'Registro',
    recipients: [
      { email: 'sandra.rodriguezac@ucc.edu.co', apiKeyEnvVar: 'RESEND_API_KEY_SANDRA' },
      { email: 'carlos.figueroama@campusucc.edu.co', apiKeyEnvVar: 'RESEND_API_KEY_CARLOS' },
    ],
  },
  {
    area: 'Tesorería',
    recipients: [
      { email: 'sandra.rodriguezac@ucc.edu.co', apiKeyEnvVar: 'RESEND_API_KEY_SANDRA' },
      { email: 'carlos.figueroama@campusucc.edu.co', apiKeyEnvVar: 'RESEND_API_KEY_CARLOS' },
    ],
  },
];
