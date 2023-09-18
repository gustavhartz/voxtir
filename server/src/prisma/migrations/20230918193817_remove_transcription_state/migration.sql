/*
  Warnings:

  - The values [MERGE_TRANSCRIPTION_DATA_STARTED] on the enum `TranscriptionProcessStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TranscriptionProcessStatus_new" AS ENUM ('QUEUED', 'TRANSCRIPTION_JOB_RUNNING', 'TRANSCRIPTION_JOB_COMPLETED', 'FAILED', 'DONE');
ALTER TABLE "TranscriptionJob" ALTER COLUMN "status" TYPE "TranscriptionProcessStatus_new" USING ("status"::text::"TranscriptionProcessStatus_new");
ALTER TYPE "TranscriptionProcessStatus" RENAME TO "TranscriptionProcessStatus_old";
ALTER TYPE "TranscriptionProcessStatus_new" RENAME TO "TranscriptionProcessStatus";
DROP TYPE "TranscriptionProcessStatus_old";
COMMIT;
