-- CreateEnum
CREATE TYPE "Cargo" AS ENUM ('Profesor', 'Jefe', 'Administrativo');

-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('Activo', 'Inactivo');

-- CreateEnum
CREATE TYPE "Modalidad" AS ENUM ('Presencial', 'Virtual', 'Funza');

-- CreateEnum
CREATE TYPE "TipoSolicitud" AS ENUM ('Académico', 'Financiero', 'Certificados');

-- CreateEnum
CREATE TYPE "EstadoSolicitud" AS ENUM ('Radicada', 'Escalada', 'En progreso', 'Cerrada');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "usuario" VARCHAR(20) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "cargo" "Cargo" NOT NULL,
    "estado" "Estado" NOT NULL DEFAULT 'Activo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "disabled_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "created_by" UUID,
    "updated_by" UUID,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_requests" (
    "id" UUID NOT NULL,
    "numero_radicado" VARCHAR(20) NOT NULL,
    "fecha_solicitud" DATE NOT NULL,
    "id_estudiante" VARCHAR(10) NOT NULL,
    "nombres" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "correo" VARCHAR(100) NOT NULL,
    "celular" VARCHAR(15) NOT NULL,
    "programa" VARCHAR(50) NOT NULL,
    "modalidad" "Modalidad" NOT NULL,
    "tipo_solicitud" "TipoSolicitud" NOT NULL,
    "solicitud_academica" VARCHAR(100),
    "solicitud_financiera" VARCHAR(100),
    "descripcion_solicitud" VARCHAR(1200) NOT NULL,
    "requiere_escalar" BOOLEAN NOT NULL,
    "area_escalar" VARCHAR(50),
    "estado_solicitud" "EstadoSolicitud" NOT NULL DEFAULT 'Radicada',
    "estado_solicitud_fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observaciones" VARCHAR(1200),
    "created_by_user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "student_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_usuario_key" ON "users"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "student_requests_numero_radicado_key" ON "student_requests"("numero_radicado");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_requests" ADD CONSTRAINT "student_requests_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_requests" ADD CONSTRAINT "student_requests_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
