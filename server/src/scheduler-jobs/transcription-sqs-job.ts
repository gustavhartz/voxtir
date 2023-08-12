import { SimpleIntervalJob, AsyncTask } from 'toad-scheduler';
import {
  pollSqs,
  deleteMessageFromSqsRecivedMessageResult,
} from '../services/aws-sqs.js';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../services/logger.js';
import { SQS_TRANSCRIPTION_QUEUE_URL as QUEUE_URL } from '../common/env.js';
import { processSQSMessage } from '../transcription/process-event.js';

export const POLL_INTERVAL = 15; // Seconds

const task = new AsyncTask(
  'transcription sqs poll and process',
  async () => {
    let res = await pollSqs(QUEUE_URL);
    try {
      processSQSMessage(res);
      deleteMessageFromSqsRecivedMessageResult(QUEUE_URL, res);
    } catch (err) {
      logger.error('Error processing transcription SQS message. ', err);
    }
    logger.info(`Completed transcription SQS poll`);
  },
  (err: Error) => {
    logger.error('Error in transcription SQS processing', err);
  }
);
export const job = new SimpleIntervalJob({ seconds: POLL_INTERVAL }, task, {
  preventOverrun: true,
  id: uuidv4(),
});
