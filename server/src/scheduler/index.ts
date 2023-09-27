import { taskType, TranscriptionProcessStatus } from '@prisma/client';

import { AWS_AUDIO_BUCKET_NAME } from '../common/env.js';
import prisma from '../prisma/index.js';
import { Logger, logger } from '../services/logger.js';
import { S3StorageHandler } from '../services/storageHandler.js';
import { TranscriptionJobHandler } from '../transcription/transcription-job-handler.js';
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

export const transcriptionJob = new ScheduledAsyncTask(
  'sagemaker_transcription_job',
  transcriptionJobTask,
  POLL_INTERVAL_MS
);

const isRunningDirectly = false;
if (isRunningDirectly) {
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
    logger,
    new S3StorageHandler(AWS_AUDIO_BUCKET_NAME),
    { CreationTimeAfter: earliestStartTime }
  ).run();
}
