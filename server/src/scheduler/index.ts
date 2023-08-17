import {
  pollSqs,
  deleteMessageFromSqsRecivedMessageResult,
} from '../services/aws-sqs.js';
import { Logger } from '../services/logger.js';
import { SQS_TRANSCRIPTION_QUEUE_URL as QUEUE_URL } from '../common/env.js';
import { SQSTranscriptionMessageHandler } from '../transcription/process-event.js';
import { ScheduledAsyncTask } from './scheduler.js';

export const POLL_INTERVAL_MS = 15000;

async function whisperPyannoteTranscriptionTasks(
  _: String,
  executionLogger: Logger
): Promise<void> {
  try {
    let res = await pollSqs(QUEUE_URL);
    executionLogger.debug(`Processing SQS event`, res);
    await new SQSTranscriptionMessageHandler(
      res,
      executionLogger
    ).processSQSMessage();
    deleteMessageFromSqsRecivedMessageResult(QUEUE_URL, res);
    executionLogger.info(`Completed transcription SQS poll JOB`);
  } catch (err) {
    executionLogger.error(`Error processing transcription SQS message`, err);
  }
}

export const sqsPollAsyncTask = new ScheduledAsyncTask(
  'audio_bucket_sqs_poll_process',
  whisperPyannoteTranscriptionTasks,
  POLL_INTERVAL_MS
);

sqsPollAsyncTask.start();
