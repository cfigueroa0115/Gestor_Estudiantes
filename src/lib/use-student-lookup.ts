/**
 * Fetches student data by ID from the API.
 * Returns nombres, apellidos, correo, celular if found.
 */
export async function lookupStudent(idEstudiante: string): Promise<{
  found: boolean;
  nombres?: string;
  apellidos?: string;
  correo?: string;
  celular?: string;
} | null> {
  if (!idEstudiante || idEstudiante.length < 3) return null;

  try {
    const res = await fetch(`/api/estudiantes/${idEstudiante}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.found) return data;
    return null;
  } catch {
    return null;
  }
}
