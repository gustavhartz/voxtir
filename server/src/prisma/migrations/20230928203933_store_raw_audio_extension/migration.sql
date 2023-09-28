-- AlterEnum
ALTER TYPE "TranscriptionProcessStatus" ADD VALUE 'AUDIO_PREPROCESSOR_JOB_PENDING';

-- AlterEnum
ALTER TYPE "taskType" ADD VALUE 'AUDIO_PREPROCESSOR_JOB_STARTER';

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "rawAudioFileExtension" TEXT;
