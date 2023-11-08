-- AlterEnum
ALTER TYPE "TranscriptionProcessStatus" ADD VALUE 'PENDING_AUDIO_FILE_UPLOAD';

-- AlterEnum
ALTER TYPE "taskType" ADD VALUE 'AUDIO_VALIDATION_JOB_STARTER';

-- Add task entries. One for the current migration and one since i forgot in the previous one
/**
INSERT INTO "Task" ("type", "details", "isLocked", "lastSuccessAt", "createdAt", "updatedAt") VALUES ('TRANSCRIPTION_JOB_STARTER', 'Used to enforce that only one job runs at a time', false, null, '2023-09-18 00:00:00', '2023-11-01 00:00:00') ON CONFLICT ("type") DO NOTHING;
INSERT INTO "Task" ("type", "details", "isLocked", "lastSuccessAt", "createdAt", "updatedAt") VALUES ('AUDIO_VALIDATION_JOB_STARTER', 'Used to enforce that only one job runs at a time', false, null, '2023-10-18 00:00:00', '2023-11-01 00:00:00') ON CONFLICT ("type") DO NOTHING;
INSERT INTO "Task" ("type", "details", "isLocked", "lastSuccessAt", "createdAt", "updatedAt") VALUES ('AUDIO_PREPROCESSOR_JOB_STARTER', 'Used to enforce that only one job runs at a time', false, null, '2023-11-01 00:00:00', '2023-11-01 00:00:00') ON CONFLICT ("type") DO NOTHING;
**/
