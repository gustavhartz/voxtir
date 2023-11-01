import { taskType, TranscriptionProcessStatus } from '@prisma/client';

import { AWS_AUDIO_BUCKET_NAME } from '../common/env.js';
import prisma from '../prisma/index.js';
import { subtractCreditsFromUser } from '../routes/graphql/resolvers/database-helpers.js';
import { Logger, logger } from '../services/logger.js';
import { S3StorageHandler } from '../services/storageHandler.js';
import { TranscriptionJobHandler } from '../transcription/transcription-job-handler.js';
import { processAudioFile } from './audioPreProcessing.js';
import { taskLockWrapper } from './common.js';
import { HandlerFunction, ScheduledAsyncTask } from './scheduler.js';

export const POLL_INTERVAL_MS = 15000;
const UPLOAD_TIME_LIMIT = 5 * 60 * 1000; // 5 minutes

/**
 * This job will start the transcription job for all pending jobs. This manages all the states of the transcription jobs
 * it will start the sage maker job, and update the database with the job id and status
 * it will also update the database with the transcription job results
 * it will also merge the transcription job results into the document
 * @param {string} _
 * @param {Logger} executionLogger
 * @return {*}  {Promise<void>}
 */
const transcriptionJobTask: HandlerFunction = async (
  _: string,
  executionLogger: Logger
): Promise<void> => {
  executionLogger.info(`Starting transcription job`);

  const runningJobs = await prisma.transcriptionJob.findMany({
    where: {
      status: TranscriptionProcessStatus.TRANSCRIPTION_JOB_RUNNING,
    },
  });
  // get the earliest start time of the running jobs
  const earliestStartTime = runningJobs.reduce((earliestTime, job) => {
    if (!job.jobStartedAt) {
      return earliestTime;
    }
    return earliestTime < job.jobStartedAt! ? earliestTime : job.jobStartedAt;
  }, new Date());

  await new TranscriptionJobHandler(
    executionLogger,
    new S3StorageHandler(AWS_AUDIO_BUCKET_NAME),
    { CreationTimeAfter: earliestStartTime }
  ).run();
};

/**
 * This job will start the audio pre-processing job for all pending jobs
 * This will execute the lambda function running ffmpeg and convert the audio file to the correct format
 * Additionally it will get the audio length and store it in the database, and clip size to 3 hours
 * @param {string} _
 * @param {Logger} executionLogger
 * @return {*}  {Promise<void>}
 */
const audioPreProcessingJobTask: HandlerFunction = async (
  _: string,
  executionLogger: Logger
): Promise<void> => {
  executionLogger.info(`Starting audio pre-processing job`);
  const pendingJobs = await prisma.transcriptionJob.findMany({
    where: {
      status: TranscriptionProcessStatus.AUDIO_PREPROCESSOR_JOB_PENDING,
    },
    include: {
      document: true,
    },
  });
  // Start the audio pre-processing job for each pending job
  const jobList = pendingJobs.map((job) => {
    if (!job.document.audioFileURL || !job.document.rawAudioFileExtension) {
      executionLogger.error(
        `Document ${job.document.id} does not have an audio file URL`
      );
      return Promise.resolve(); // or return Promise.reject("REJECTED"); if you want to handle rejection separately
    }
    const { id: documentId, rawAudioFileExtension } = job.document;
    const transcriptionJobId = job.id;
    return processAudioFile(
      documentId,
      rawAudioFileExtension,
      transcriptionJobId,
      job.type
    );
  });

  const result = await Promise.all(jobList);

  // Log the number of jobs that failed
  const failedJobs = result.filter((job) => !job);
  executionLogger.info(
    `Audio pre-processing job completed. ${failedJobs.length} jobs failed of ${result.length} total jobs`
  );
};

/**
 * This job will check uploaded audio files and determine if they are valid audio files
 * @param {string} _
 * @param {Logger} executionLogger
 * @return {*}  {Promise<void>}
 */
const audioValidationJobTask: HandlerFunction = async (
  _: string,
  executionLogger: Logger
): Promise<void> => {
  executionLogger.info(`Starting audio validation job`);
  const pendingJobs = await prisma.transcriptionJob.findMany({
    where: {
      status: TranscriptionProcessStatus.PENDING_AUDIO_FILE_UPLOAD,
    },
    include: {
      document: true,
    },
  });
  const s3 = new S3StorageHandler(AWS_AUDIO_BUCKET_NAME);
  // Start the audio pre-processing job for each pending job
  const jobList = pendingJobs.map(async (job) => {
    if (!job.document.audioFileURL || !job.document.rawAudioFileExtension) {
      executionLogger.error(
        `Document ${job.document.id} does not have an audio file URL`
      );
      return Promise.resolve(); // or return Promise.reject("REJECTED"); if you want to handle rejection separately
    }
    const { audioFileURL, updatedAt, id } = job.document;

    try {
      await s3.headObject(audioFileURL);
      if (job.document.createdByUserId) {
        await subtractCreditsFromUser(job.document.createdByUserId, 1);
      }
      await prisma.transcriptionJob.update({
        where: {
          documentId: id,
        },
        data: {
          status: TranscriptionProcessStatus.AUDIO_PREPROCESSOR_JOB_PENDING,
        },
      });
      executionLogger.info(
        `Document ${job.document.id} is inspected and moved to audio pre-processing job`
      );
    } catch (e) {
      executionLogger.warn(
        `Document ${job.document.id} does not have an uploaded audio file URL or user out of credits. Will be deleted`
      );

      // If more than UPLOAD_TIME_LIMIT minutes old we delete it
      if (updatedAt.getTime() < new Date().getTime() - UPLOAD_TIME_LIMIT) {
        await prisma.document.delete({
          where: {
            id: id,
          },
        });
      }
    }
  });

  await Promise.all(jobList);
  executionLogger.info(`Audio upload validation job completed`);
};

export const audioPreProcessingJob = new ScheduledAsyncTask(
  'audio_preprocessing_job',
  taskLockWrapper(
    taskType.AUDIO_PREPROCESSOR_JOB_STARTER,
    audioPreProcessingJobTask,
    false
  ),
  POLL_INTERVAL_MS
);

export const transcriptionJob = new ScheduledAsyncTask(
  'sagemaker_transcription_job',
  taskLockWrapper(taskType.TRANSCRIPTION_JOB_STARTER, transcriptionJobTask),
  POLL_INTERVAL_MS
);

export const audioFileValidation = new ScheduledAsyncTask(
  'audio_file_validation_job',
  taskLockWrapper(
    taskType.AUDIO_VALIDATION_JOB_STARTER,
    audioValidationJobTask
  ),
  POLL_INTERVAL_MS
);

const isRunningDirectly = true;
if (isRunningDirectly) {
  // await transcriptionJobTask('', logger);
  // await audioPreProcessingJobTask('', logger);
  await audioValidationJobTask('', logger);
}
