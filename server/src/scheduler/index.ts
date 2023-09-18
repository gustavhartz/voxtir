import { taskType } from '@prisma/client';

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
    executionLogger.info(`Could not obtain lock for transcription job starter`);
    return;
  }
  const jobStarTime = new Date();
  const task = await prisma.task.findFirst({
    where: { type: taskType.TRANSCRIPTION_JOB_STARTER },
  });
  let lastSuccessAt = task?.lastSuccessAt;
  if (!lastSuccessAt) {
    executionLogger.warn(
      `No last success time found for transcription job starter. Running from current time -1 day`
    );
    //Now minus 1 day
    lastSuccessAt = new Date(Date.now() - 86400000);
  }

  await new TranscriptionJobHandler(
    executionLogger,
    new S3StorageHandler(AWS_AUDIO_BUCKET_NAME),
    { CreationTimeAfter: lastSuccessAt }
  ).run();

  await prisma.task.update({
    where: { type: taskType.TRANSCRIPTION_JOB_STARTER },
    data: { lastSuccessAt: jobStarTime },
  });
};

export const transcriptionJob = new ScheduledAsyncTask(
  'audio_bucket_sqs_poll_process',
  transcriptionJobTask,
  POLL_INTERVAL_MS
);

const isRunningLocally = true;
if (isRunningLocally) {
  await transcriptionJobTask('', logger);
}
