import { defineConfig } from "prisma/config";

// Load dotenv only in development (Vercel provides env vars in production)
try {
  require("dotenv/config");
} catch {
  // dotenv not available in production build
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
