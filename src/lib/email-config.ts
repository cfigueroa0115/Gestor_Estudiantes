export interface EscalationEmailConfig {
  area: string;
  to: string;
  cc: string[];
}

/**
 * Configuración de correos de escalamiento por área.
 * Todos los correos incluyen copia a sandra.rodriguezac@ucc.edu.co
 */
export const ESCALATION_EMAIL_CONFIG: EscalationEmailConfig[] = [
  { area: 'Financiera', to: 'carlos.figueroama@campusucc.edu.co', cc: ['sandra.rodriguezac@ucc.edu.co'] },
  { area: 'Registro', to: 'carlos.figueroama@campusucc.edu.co', cc: ['sandra.rodriguezac@ucc.edu.co'] },
  { area: 'Tesorería', to: 'carlos.figueroama@campusucc.edu.co', cc: ['sandra.rodriguezac@ucc.edu.co'] },
];
