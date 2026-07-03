-- CreateTable: programas
CREATE TABLE IF NOT EXISTS "programas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "codigo" VARCHAR(10) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "admin_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "email_escalar" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "programas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "programas_codigo_key" ON "programas"("codigo");

-- AlterTable: Add programa_id to users (nullable, no FK constraint initially)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "programa_id" UUID;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_programa_id_fkey') THEN
        ALTER TABLE "users" ADD CONSTRAINT "users_programa_id_fkey" FOREIGN KEY ("programa_id") REFERENCES "programas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- Insert programs
INSERT INTO "programas" ("codigo", "nombre", "email_escalar") VALUES
('01IIC', 'Ingeniería Industrial', NULL),
('01IIV', 'Ingeniería Industrial Virtual', NULL),
('01SIS', 'Ingeniería de Sistemas', NULL),
('01AMB', 'Ingeniería Ambiental', NULL),
('01TEL', 'Ingeniería de Telecomunicaciones', NULL),
('01ELE', 'Ingeniería Electrónica', NULL),
('01TIC', 'Tecnología en desarrollo y administración de aplicaciones informáticas', 'daniel.barrera@ucc.edu.co'),
('01TAC', 'Tecnología en control y automatización industrial', 'daniel.barrera@ucc.edu.co')
ON CONFLICT ("codigo") DO NOTHING;

-- Associate existing Ing. Industrial users with programa 01IIC
UPDATE "users" SET "programa_id" = (SELECT "id" FROM "programas" WHERE "codigo" = '01IIC')
WHERE "programa_id" IS NULL AND "organizacion" = '01IIC';

UPDATE "users" SET "programa_id" = (SELECT "id" FROM "programas" WHERE "codigo" = '01IIV')
WHERE "programa_id" IS NULL AND "organizacion" = '01IIV';
