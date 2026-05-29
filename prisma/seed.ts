import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("Lifl172023Cf", 12);

  // Check if user exists first (avoid transaction-based upsert)
  const existing = await prisma.user.findUnique({
    where: { usuario: "1129564302" },
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        usuario: "1129564302",
        password_hash: passwordHash,
        cargo: "Profesor",
        estado: "Activo",
        created_by: null,
      },
    });
    console.log("Seed completado: usuario inicial creado.");
  } else {
    console.log("Seed: usuario inicial ya existe, omitiendo.");
  }
}

main()
  .catch((e) => {
    console.error("Error ejecutando seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
