export interface EscalationEmailConfig {
  area: string;
  to: string;
  cc: string[];
}

/**
 * Configuracion de correos de escalamiento por area.
 * 
 * IMPORTANTE: Resend sin dominio verificado solo permite enviar a la cuenta
 * registrada (carlos.figueroama@campusucc.edu.co). Los CC a otros dominios
 * no se entregan hasta verificar el dominio ucc.edu.co en Resend.
 * 
 * Una vez verificado el dominio, actualizar:
 * - to: 'sandra.rodriguezac@ucc.edu.co'
 * - cc: ['carlos.figueroama@campusucc.edu.co']
 */
export const ESCALATION_EMAIL_CONFIG: EscalationEmailConfig[] = [
  { area: 'Financiera', to: 'carlos.figueroama@campusucc.edu.co', cc: [] },
  { area: 'Registro', to: 'carlos.figueroama@campusucc.edu.co', cc: [] },
  { area: 'Tesorería', to: 'carlos.figueroama@campusucc.edu.co', cc: [] },
];
