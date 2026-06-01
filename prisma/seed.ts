import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const USERS = [
  { usuario: '52317897', nombre: 'Sandra Patricia Rodriguez Acevedo', cargo: 'Jefe' as const, organizacion: '01IIC', estado: 'Activo' as const },
  { usuario: '1129564302', nombre: 'Carlos Alberto Figueroa Martinez', cargo: 'Profesor' as const, organizacion: '01IIC', estado: 'Activo' as const },
  { usuario: '23551', nombre: 'Freddy Andres Perez', cargo: 'Profesor' as const, organizacion: '01IIC', estado: 'Inactivo' as const },
  { usuario: '201143', nombre: 'Christian Leonardo Hidalgo', cargo: 'Profesor' as const, organizacion: '01IIC', estado: 'Inactivo' as const },
  { usuario: '263687', nombre: 'Carolina Suarez', cargo: 'Profesor' as const, organizacion: '01IIC', estado: 'Inactivo' as const },
  { usuario: '279522', nombre: 'German Ernesto Ramoz', cargo: 'Profesor' as const, organizacion: '01IIC', estado: 'Inactivo' as const },
  { usuario: '279573', nombre: 'Jesus Mauricio Niño', cargo: 'Profesor' as const, organizacion: '01IIC', estado: 'Inactivo' as const },
  { usuario: '279605', nombre: 'Jose Eduardo Ustariz', cargo: 'Profesor' as const, organizacion: '01IIC', estado: 'Inactivo' as const },
  { usuario: '279693', nombre: 'Pablo Elias Velasquez', cargo: 'Profesor' as const, organizacion: '01IIC', estado: 'Inactivo' as const },
  { usuario: '329045', nombre: 'Henry Mauricio Pulido', cargo: 'Profesor' as const, organizacion: '01IIC', estado: 'Inactivo' as const },
  { usuario: '510510', nombre: 'Emiro Alberto Trujillo', cargo: 'Profesor' as const, organizacion: '01IIC', estado: 'Inactivo' as const },
];

async function main() {
  const passwordHash = await bcrypt.hash("Lifl172023Cf", 12);

  for (const user of USERS) {
    const existing = await prisma.user.findUnique({ where: { usuario: user.usuario } });
    if (!existing) {
      await prisma.user.create({
        data: {
          usuario: user.usuario,
          nombre: user.nombre,
          password_hash: passwordHash,
          cargo: user.cargo,
          organizacion: user.organizacion,
          estado: user.estado,
          created_by: null,
        },
      });
    } else {
      // Update nombre and organizacion for existing users
      await prisma.user.update({
        where: { usuario: user.usuario },
        data: { nombre: user.nombre, organizacion: user.organizacion },
      });
    }
  }

  console.log(`Seed completado: ${USERS.length} usuarios procesados.`);
}

main()
  .catch((e) => { console.error("Error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
