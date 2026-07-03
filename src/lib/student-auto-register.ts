import { prisma } from '@/lib/prisma';

/**
 * Auto-registers a student in the estudiantes table if they don't already exist.
 * This is triggered when a request is created and the student was NOT found during lookup.
 * Only inserts - never updates or deletes existing records.
 */
export async function autoRegisterStudent(data: {
  id_estudiante: string;
  nro_documento?: string | null;
  nombres: string;
  apellidos: string;
  correo: string;
  celular: string;
  programa: string;
  modalidad: string;
}): Promise<void> {
  try {
    // Check if student already exists by id_estudiante
    const existing = await prisma.estudiante.findUnique({
      where: { id_estudiante: data.id_estudiante },
      select: { id: true },
    });

    // Only insert if student does NOT exist
    if (!existing) {
      // Map programa name to programa_academico code
      const programaCode = mapProgramaToCode(data.programa, data.modalidad);

      await prisma.estudiante.create({
        data: {
          id_estudiante: data.id_estudiante,
          nro_documento: data.nro_documento || null,
          nombres: data.nombres,
          apellidos: data.apellidos,
          correo: data.correo,
          telefono: data.celular,
          programa_academico: programaCode,
        },
      });
    }
  } catch (error) {
    // Don't fail the request if auto-register fails
    console.error('[autoRegisterStudent] Error:', error);
  }
}

/**
 * Maps the programa name and modalidad to the corresponding programa_academico code.
 */
function mapProgramaToCode(programa: string, modalidad: string): string {
  const prog = programa.toLowerCase();

  if (prog.includes('industrial')) {
    // 01IIV = Virtual, 01IIC = Presencial/Funza
    if (modalidad === 'Virtual') return '01IIV';
    return '01IIC';
  }

  // Default: use first program code available
  return '01IIC';
}
