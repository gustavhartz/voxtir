import { ToadScheduler } from 'toad-scheduler';
import { job as transcriptionSqsJob } from './transcription-sqs-job.js';

export const addJobsToScheduler = (scheduler: ToadScheduler): void => {
  scheduler.addSimpleIntervalJob(transcriptionSqsJob);
};
