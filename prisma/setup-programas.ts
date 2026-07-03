import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== Configurando programas y usuarios ===\n");

  // 1. Get program IDs
  const programas = await prisma.programa.findMany();
  console.log("Programas en BD:", programas.map(p => `${p.codigo}: ${p.nombre}`));

  const prog01IIC = programas.find(p => p.codigo === '01IIC');
  const prog01TIC = programas.find(p => p.codigo === '01TIC');
  const prog01TAC = programas.find(p => p.codigo === '01TAC');

  if (!prog01IIC || !prog01TIC || !prog01TAC) {
    console.error("ERROR: Programas no encontrados");
    return;
  }

  // 2. Associate ALL existing users (org 01IIC) with programa 01IIC
  const updated = await prisma.user.updateMany({
    where: { programa_id: null },
    data: { programa_id: prog01IIC.id },
  });
  console.log(`\nUsuarios existentes asociados a Ing. Industrial: ${updated.count}`);

  // 3. Create Daniel Barrera user for 01TIC
  const passwordHash = await bcrypt.hash("Dani314635", 12);
  
  const daniel = await prisma.user.upsert({
    where: { usuario: "314635" },
    update: {
      nombre: "Daniel Ricardo Barrera Rojas",
      cargo: "Jefe",
      organizacion: "01TIC",
      programa_id: prog01TIC.id,
      estado: "Activo",
      password_hash: passwordHash,
    },
    create: {
      usuario: "314635",
      nombre: "Daniel Ricardo Barrera Rojas",
      password_hash: passwordHash,
      cargo: "Jefe",
      organizacion: "01TIC",
      programa_id: prog01TIC.id,
      estado: "Activo",
    },
  });
  console.log(`\nUsuario Daniel Barrera creado/actualizado: ${daniel.usuario} (${daniel.nombre})`);

  // 4. Update programa admin_ids
  await prisma.programa.update({
    where: { id: prog01TIC.id },
    data: { admin_ids: [daniel.usuario] },
  });
  await prisma.programa.update({
    where: { id: prog01TAC.id },
    data: { admin_ids: [daniel.usuario] },
  });
  console.log("Admin configurado para 01TIC y 01TAC: 314635 (Daniel Barrera)");

  // 5. Set admin_ids for Ing. Industrial
  await prisma.programa.update({
    where: { id: prog01IIC.id },
    data: { admin_ids: ["1129564302", "52317897"] },
  });
  console.log("Admins Ing. Industrial: 1129564302, 52317897");

  // 6. Summary
  const totalUsers = await prisma.user.count();
  const totalProgramas = await prisma.programa.count();
  console.log(`\n=== Resumen ===`);
  console.log(`Programas: ${totalProgramas}`);
  console.log(`Usuarios: ${totalUsers}`);

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
