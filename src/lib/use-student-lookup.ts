/**
 * Fetches student data by ID or Nro Documento from the API.
 * Returns id_estudiante, nro_documento, nombres, apellidos, correo, celular if found.
 */
export async function lookupStudent(idEstudiante: string): Promise<{
  found: boolean;
  id_estudiante?: string;
  nro_documento?: string;
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

/**
 * Fetches student data by Nro Documento from the API.
 */
export async function lookupStudentByDoc(nroDocumento: string): Promise<{
  found: boolean;
  id_estudiante?: string;
  nro_documento?: string;
  nombres?: string;
  apellidos?: string;
  correo?: string;
  celular?: string;
} | null> {
  if (!nroDocumento || nroDocumento.length < 3) return null;

  try {
    const res = await fetch(`/api/estudiantes/${nroDocumento}?by=documento`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.found) return data;
    return null;
  } catch {
    return null;
  }
}
