import { taskType, TranscriptionProcessStatus } from '@prisma/client';

import { AWS_AUDIO_BUCKET_NAME } from '../common/env.js';
import prisma from '../prisma/index.js';
import { Logger, logger } from '../services/logger.js';
import { S3StorageHandler } from '../services/storageHandler.js';
import { TranscriptionJobHandler } from '../transcription/transcription-job-handler.js';
import { processAudioFile } from './audioPreProcessing.js';
import { acquireTaskLock } from './common.js';
import { HandlerFunction, ScheduledAsyncTask } from './scheduler.js';

export const POLL_INTERVAL_MS = 15000;

const transcriptionJobTask: HandlerFunction = async (
  _: string,
  executionLogger: Logger
): Promise<void> => {
  executionLogger.info(`Starting transcription job`);
  const obtainedLock = await acquireTaskLock(
    taskType.TRANSCRIPTION_JOB_STARTER
  );
  if (!obtainedLock) {
    executionLogger.info(
      `Did not obtain lock for transcription job task. Exiting`
    );
    return;
  }

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

  await prisma.task.update({
    where: { type: taskType.TRANSCRIPTION_JOB_STARTER },
    data: { lastSuccessAt: new Date(), isLocked: false },
  });
};

const audioPreProcessingJobTask: HandlerFunction = async (
  _: string,
  executionLogger: Logger
): Promise<void> => {
  executionLogger.info(`Starting transcription job`);
  const obtainedLock = await acquireTaskLock(
    taskType.AUDIO_PREPROCESSOR_JOB_STARTER
  );
  if (!obtainedLock) {
    executionLogger.info(
      `Did not obtain lock for transcription job task. Exiting`
    );
    return;
  }
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
  await prisma.task.update({
    where: { type: taskType.AUDIO_PREPROCESSOR_JOB_STARTER },
    data: { lastSuccessAt: new Date(), isLocked: false },
  });
};

export const audioPreProcessingJob = new ScheduledAsyncTask(
  'audio_preprocessing_job',
  audioPreProcessingJobTask,
  POLL_INTERVAL_MS
);

export const transcriptionJob = new ScheduledAsyncTask(
  'sagemaker_transcription_job',
  transcriptionJobTask,
  POLL_INTERVAL_MS
);

const isRunningDirectly = true;
if (isRunningDirectly) {
  // const runningJobs = await prisma.transcriptionJob.findMany({
  //   where: {
  //     status: TranscriptionProcessStatus.TRANSCRIPTION_JOB_RUNNING,
  //   },
  // });
  // // get the earliest start time of the running jobs
  // const earliestStartTime = runningJobs.reduce((earliestTime, job) => {
  //   if (!job.jobStartedAt) {
  //     return earliestTime;
  //   }
  //   return earliestTime < job.jobStartedAt! ? earliestTime : job.jobStartedAt;
  // }, new Date());
  // await new TranscriptionJobHandler(
  //   logger,
  //   new S3StorageHandler(AWS_AUDIO_BUCKET_NAME),
  //   { CreationTimeAfter: earliestStartTime }
  // ).run();
  await audioPreProcessingJobTask('', logger);
}
