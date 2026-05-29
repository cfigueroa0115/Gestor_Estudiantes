export interface EscalationEmailConfig {
  area: string;
  to: string;
  cc: string[];
}

export const ESCALATION_EMAIL_CONFIG: EscalationEmailConfig[] = [
  { area: 'Financiera', to: 'sandra.rodriguezac@ucc.edu.co', cc: ['carlos.figueroama@campusucc.edu.co'] },
  { area: 'Registro', to: 'sandra.rodriguezac@ucc.edu.co', cc: ['carlos.figueroama@campusucc.edu.co'] },
  { area: 'Tesorería', to: 'sandra.rodriguezac@ucc.edu.co', cc: ['carlos.figueroama@campusucc.edu.co'] },
];
