/**
 * Genera un número de radicado alfanumérico único.
 * Formato: RAD-YYYYMMDD-XXXXX
 * Donde XXXXX es un código alfanumérico aleatorio de 5 caracteres.
 * Ejemplo: RAD-20260529-A3K7M
 */
export function generateNumeroRadicado(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;

  // Generate 5 random alphanumeric characters (uppercase)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded I, O, 0, 1 to avoid confusion
  let randomPart = '';
  for (let i = 0; i < 5; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `RAD-${datePart}-${randomPart}`;
}
