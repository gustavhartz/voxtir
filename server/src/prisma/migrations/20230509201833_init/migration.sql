-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "core";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "documents";

-- CreateTable
CREATE TABLE "documents"."Documents" (
    "id" SERIAL NOT NULL,
    "data" BYTEA NOT NULL,
    "documentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Documents_documentId_key" ON "documents"."Documents"("documentId");

-- CreateIndex
CREATE INDEX "Documents_documentId_idx" ON "documents"."Documents"("documentId");
