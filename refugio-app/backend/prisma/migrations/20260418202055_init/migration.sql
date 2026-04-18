-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'VOLUNTARIO', 'ADOPTANTE');

-- CreateEnum
CREATE TYPE "Especie" AS ENUM ('PERRO', 'GATO', 'OTRO');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MACHO', 'HEMBRA');

-- CreateEnum
CREATE TYPE "EstadoAnimal" AS ENUM ('DISPONIBLE', 'EN_ACOGIDA', 'ADOPTADO', 'EN_TRATAMIENTO', 'NO_DISPONIBLE');

-- CreateEnum
CREATE TYPE "TipoExpediente" AS ENUM ('VACUNA', 'DESPARASITACION', 'CIRUGIA', 'REVISION', 'TRATAMIENTO');

-- CreateEnum
CREATE TYPE "EstadoAdopcion" AS ENUM ('SOLICITADA', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'COMPLETADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoApadrinamiento" AS ENUM ('MENSUAL', 'PUNTUAL');

-- CreateEnum
CREATE TYPE "EstadoApadrinamiento" AS ENUM ('ACTIVO', 'CANCELADO', 'FINALIZADO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT,
    "telefono" TEXT,
    "rol" "Role" NOT NULL DEFAULT 'ADOPTANTE',
    "preferencias" JSONB,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "animales" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "especie" "Especie" NOT NULL,
    "raza" TEXT,
    "sexo" "Sexo" NOT NULL,
    "fechaNacimiento" TIMESTAMP(3),
    "edadEstimada" INTEGER,
    "peso" DECIMAL(5,2),
    "color" TEXT,
    "chip" TEXT,
    "estado" "EstadoAnimal" NOT NULL DEFAULT 'DISPONIBLE',
    "descripcion" TEXT,
    "descripcionManual" TEXT,
    "fotos" TEXT[],
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ubicacion" TEXT,
    "caracteristicas" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "animales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expedientes_medicos" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "tipo" "TipoExpediente" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "veterinario" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL,
    "proximaRevision" TIMESTAMP(3),
    "documentos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "expedientes_medicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adopciones" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "estado" "EstadoAdopcion" NOT NULL DEFAULT 'SOLICITADA',
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaAprobacion" TIMESTAMP(3),
    "fechaCompletada" TIMESTAMP(3),
    "notas" TEXT,
    "puntuacionCompatibilidad" DOUBLE PRECISION,
    "motivoRechazo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adopciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apadrinamientos" (
    "id" TEXT NOT NULL,
    "animalId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tipo" "TipoApadrinamiento" NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "estado" "EstadoApadrinamiento" NOT NULL DEFAULT 'ACTIVO',
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apadrinamientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donaciones" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "concepto" TEXT,
    "metodoPago" TEXT,
    "stripePaymentId" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "animales_chip_key" ON "animales"("chip");

-- CreateIndex
CREATE INDEX "animales_estado_idx" ON "animales"("estado");

-- CreateIndex
CREATE INDEX "animales_especie_idx" ON "animales"("especie");

-- CreateIndex
CREATE INDEX "expedientes_medicos_animalId_idx" ON "expedientes_medicos"("animalId");

-- CreateIndex
CREATE INDEX "expedientes_medicos_fecha_idx" ON "expedientes_medicos"("fecha");

-- CreateIndex
CREATE INDEX "adopciones_estado_idx" ON "adopciones"("estado");

-- CreateIndex
CREATE INDEX "adopciones_animalId_idx" ON "adopciones"("animalId");

-- CreateIndex
CREATE INDEX "adopciones_usuarioId_idx" ON "adopciones"("usuarioId");

-- CreateIndex
CREATE INDEX "apadrinamientos_estado_idx" ON "apadrinamientos"("estado");

-- CreateIndex
CREATE INDEX "apadrinamientos_usuarioId_idx" ON "apadrinamientos"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "donaciones_stripePaymentId_key" ON "donaciones"("stripePaymentId");

-- CreateIndex
CREATE INDEX "donaciones_usuarioId_idx" ON "donaciones"("usuarioId");

-- CreateIndex
CREATE INDEX "donaciones_fecha_idx" ON "donaciones"("fecha");

-- AddForeignKey
ALTER TABLE "expedientes_medicos" ADD CONSTRAINT "expedientes_medicos_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adopciones" ADD CONSTRAINT "adopciones_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adopciones" ADD CONSTRAINT "adopciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apadrinamientos" ADD CONSTRAINT "apadrinamientos_animalId_fkey" FOREIGN KEY ("animalId") REFERENCES "animales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apadrinamientos" ADD CONSTRAINT "apadrinamientos_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donaciones" ADD CONSTRAINT "donaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
