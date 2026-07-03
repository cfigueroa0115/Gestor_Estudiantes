-- AlterTable: Add nro_documento column to student_requests
-- This is a non-destructive migration - only adds a new nullable column
ALTER TABLE "student_requests" ADD COLUMN IF NOT EXISTS "nro_documento" VARCHAR(20);
