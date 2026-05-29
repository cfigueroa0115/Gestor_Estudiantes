export interface EscalationEmailConfig {
  area: string;
  to: string;
  cc: string[];
}

/**
 * Configuración de correos de escalamiento por área.
 * 
 * NOTA: Mientras no se verifique el dominio ucc.edu.co en Resend,
 * solo se puede enviar a carlos.figueroama@campusucc.edu.co (cuenta registrada).
 * Una vez verificado el dominio, cambiar los destinatarios a los definitivos:
 * - to: 'sandra.rodriguezac@ucc.edu.co'
 * - cc: ['carlos.figueroama@campusucc.edu.co']
 */
export const ESCALATION_EMAIL_CONFIG: EscalationEmailConfig[] = [
  { area: 'Financiera', to: 'carlos.figueroama@campusucc.edu.co', cc: [] },
  { area: 'Registro', to: 'carlos.figueroama@campusucc.edu.co', cc: [] },
  { area: 'Tesorería', to: 'carlos.figueroama@campusucc.edu.co', cc: [] },
];
