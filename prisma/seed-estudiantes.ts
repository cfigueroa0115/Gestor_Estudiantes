import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const ESTUDIANTES = [
  { id_estudiante: '410259', tipo_documento: 'CC', nro_documento: '1032487527', primer_apellido: 'Contreras', segundo_apellido: 'Yance', apellidos: 'Contreras Yance', primer_nombre: 'Juan', segundo_nombre: 'Pablo', nombres: 'Juan Pablo', genero: 'Masculino', telefono: '3197268303', correo: 'juan.contrerasy@campusucc.edu.co', eps: 'SANITAS EPS', ciclo_lectivo: '2610', codigo_sede: '01BOG', programa_academico: '01IIC', horario: 'DIUR', nivel_academico: '10S', tipo_admision: 'RNG', desc_tipo_admision: 'Reingreso' },
  { id_estudiante: '890837', tipo_documento: 'CC', nro_documento: '1003630898', primer_apellido: 'Prieto', segundo_apellido: 'Cubides', apellidos: 'Prieto Cubides', primer_nombre: 'Danna', segundo_nombre: 'Alexandra', nombres: 'Danna Alexandra', genero: 'Femenino', telefono: '3222806613', correo: 'danna.prieto@campusucc.edu.co', eps: 'SALUD TOTAL', ciclo_lectivo: '2610', codigo_sede: '01BOG', programa_academico: '01IIC', horario: 'MNOC', nivel_academico: '7S', tipo_admision: 'REG', desc_tipo_admision: 'Regular' },
  { id_estudiante: '891502', tipo_documento: 'CC', nro_documento: '1116070809', primer_apellido: 'Lozano', segundo_apellido: 'Clavijo', apellidos: 'Lozano Clavijo', primer_nombre: 'Francisco', segundo_nombre: 'Javier', nombres: 'Francisco Javier', genero: 'Masculino', telefono: '3145795529', correo: 'francisco.lozano@campusucc.edu.co', eps: 'FAMISANAR EPS', ciclo_lectivo: '2610', codigo_sede: '01BOG', programa_academico: '01IIC', horario: 'MNOC', nivel_academico: '7S', tipo_admision: 'REG', desc_tipo_admision: 'Regular' },
  { id_estudiante: '518205', tipo_documento: 'CC', nro_documento: '1018495100', primer_apellido: 'Ospina', segundo_apellido: 'Villalobos', apellidos: 'Ospina Villalobos', primer_nombre: 'Jereth', segundo_nombre: 'Daniela', nombres: 'Jereth Daniela', genero: 'Femenino', telefono: '3208580809', correo: 'jereth.ospina@campusucc.edu.co', eps: 'SANITAS EPS', ciclo_lectivo: '2610', codigo_sede: '01BOG', programa_academico: '01IIC', horario: 'MNOC', nivel_academico: '9S', tipo_admision: 'REG', desc_tipo_admision: 'Regular' },
  { id_estudiante: '933308', tipo_documento: 'TI', nro_documento: '1030572059', primer_apellido: 'Beltran', segundo_apellido: 'Fernandez', apellidos: 'Beltran Fernandez', primer_nombre: 'Juliana', segundo_nombre: '', nombres: 'Juliana', genero: 'Femenino', telefono: '3162326322', correo: 'juliana.beltranfe@campusucc.edu.co', eps: 'ALIANSALUD S.A.', ciclo_lectivo: '2610', codigo_sede: '01BOG', programa_academico: '01IIC', horario: 'DIUR', nivel_academico: '4S', tipo_admision: 'REG', desc_tipo_admision: 'Regular' },
  { id_estudiante: '913062', tipo_documento: 'CC', nro_documento: '1069476085', primer_apellido: 'Santos', segundo_apellido: 'Arguello', apellidos: 'Santos Arguello', primer_nombre: 'Kewen', segundo_nombre: 'Andres', nombres: 'Kewen Andres', genero: 'Masculino', telefono: '3132558156', correo: 'kewen.santos@campusucc.edu.co', eps: 'LA NUEVA EPS', ciclo_lectivo: '2610', codigo_sede: '01BOG', programa_academico: '01IIC', horario: 'DIUR', nivel_academico: '6S', tipo_admision: 'REG', desc_tipo_admision: 'Regular' },
  { id_estudiante: '823477', tipo_documento: 'CC', nro_documento: '1030666758', primer_apellido: 'Martinez', segundo_apellido: 'Vargas', apellidos: 'Martinez Vargas', primer_nombre: 'Daniela', segundo_nombre: '', nombres: 'Daniela', genero: 'Femenino', telefono: '3013383543', correo: 'daniela.martinezva@campusucc.edu.co', eps: 'COLMENA', ciclo_lectivo: '2610', codigo_sede: '01BOG', programa_academico: '01IIC', horario: 'MNOC', nivel_academico: '7S', tipo_admision: 'REG', desc_tipo_admision: 'Regular' },
  { id_estudiante: '546728', tipo_documento: 'TI', nro_documento: '1000383013', primer_apellido: 'Parra', segundo_apellido: 'Rios', apellidos: 'Parra Rios', primer_nombre: 'Nycoll', segundo_nombre: 'Valentina', nombres: 'Nycoll Valentina', genero: 'Femenino', telefono: '3057153243', correo: 'nycoll.parra@campusucc.edu.co', eps: 'COMPESAR EPS', ciclo_lectivo: '2610', codigo_sede: '01BOG', programa_academico: '01IIC', horario: 'DIUR', nivel_academico: '6S', tipo_admision: 'RNG', desc_tipo_admision: 'Reingreso' },
  { id_estudiante: '823267', tipo_documento: 'CC', nro_documento: '1032461496', primer_apellido: 'Bustamante', segundo_apellido: 'Henao', apellidos: 'Bustamante Henao', primer_nombre: 'Maryeli', segundo_nombre: '', nombres: 'Maryeli', genero: 'Femenino', telefono: '3144393636', correo: 'maryeli.bustamante@campusucc.edu.co', eps: 'COMPESAR EPS', ciclo_lectivo: '2610', codigo_sede: '01BOG', programa_academico: '01IIC', horario: 'DIUR', nivel_academico: '8S', tipo_admision: 'REG', desc_tipo_admision: 'Regular' },
  { id_estudiante: '922984', tipo_documento: 'CC', nro_documento: '1031180885', primer_apellido: 'Arenas', segundo_apellido: 'Carvajal', apellidos: 'Arenas Carvajal', primer_nombre: 'Wendy', segundo_nombre: 'Daniela', nombres: 'Wendy Daniela', genero: 'Femenino', telefono: '3104567821', correo: 'wendy.arenas@campusucc.edu.co', eps: 'FAMISANAR EPS', ciclo_lectivo: '2610', codigo_sede: '01BOG', programa_academico: '01IIC', horario: 'MNOC', nivel_academico: '4S', tipo_admision: 'REG', desc_tipo_admision: 'Regular' },
];

async function main() {
  console.log(`Insertando ${ESTUDIANTES.length} estudiantes...`);
  for (const est of ESTUDIANTES) {
    const existing = await prisma.estudiante.findUnique({ where: { id_estudiante: est.id_estudiante } });
    if (!existing) {
      await prisma.estudiante.create({ data: est });
    }
  }
  console.log('Seed de estudiantes completado.');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
