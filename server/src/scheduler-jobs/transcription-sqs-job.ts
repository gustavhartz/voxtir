import { SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import {
  pollSqs,
  deleteMessageFromSqsRecivedMessageResult,
} from '../services/aws-sqs.js';
import { schedulerLogger as logger } from '../services/logger.js';
import { SQS_TRANSCRIPTION_QUEUE_URL as QUEUE_URL } from '../common/env.js';
import { processSQSMessage } from '../transcription/process-event.js';

export const POLL_INTERVAL = 10; // Seconds
export const JOB_ID = 'transcription-sqs-poll';

const task = new AsyncTask(
  'transcription sqs poll and process',
  async () => {
    let res = await pollSqs(QUEUE_URL);
    try {
      logger.debug(`Received event`, res);
      processSQSMessage(res);
      deleteMessageFromSqsRecivedMessageResult(QUEUE_URL, res);
      logger.info(`Completed transcription SQS poll`);
    } catch (err) {
      logger.error('Error processing transcription SQS message', err);
    }
  },
  (err: Error) => {
    logger.error('Error in transcription SQS processing', err);
  }
);
export const job = new SimpleIntervalJob({ seconds: POLL_INTERVAL }, task, {
  preventOverrun: true,
  id: JOB_ID,
});
