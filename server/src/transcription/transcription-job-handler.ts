import {
  ListTransformJobsCommandInput,
  TransformJobStatus,
} from '@aws-sdk/client-sagemaker';
import { TranscriptionProcessStatus, TranscriptionType } from '@prisma/client';
import * as Y from 'yjs';

import { AWS_AUDIO_BUCKET_NAME } from '../common/env.js';
import prisma from '../prisma/index.js';
import { listBatchTransformJobs } from '../services/aws-sagemaker.js';
import { Logger } from '../services/logger.js';
import {
  S3StorageHandler,
  StorageHandler,
} from '../services/storageHandler.js';
import { TipTapJSONToYDoc } from '../tiptap-editor/index.js';
import {
  getGeneratedTranscriptionFileKey,
  getSpeakerDiarizationOutputKey,
  getSpeechToTextOutputKey,
  LanguageCodePairs,
} from './common.js';
import { SagemakerBatchTransformTranscription } from './sagemaker-transcription.js';
import { WhisperPyannoteMerger } from './whisper-pyannote-merge-into-tiptap.js';

export class TranscriptionJobHandler {
  logger: Logger;
  storageHandler: StorageHandler;
  runFilter: ListTransformJobsCommandInput;

  runningJobs = 0;
  static MAX_CONCURRENT_TRANSCRIPTION_JOBS = 4;

  constructor(
    logger: Logger,
    storageHandler: StorageHandler,
    runFilter: ListTransformJobsCommandInput
  ) {
    this.storageHandler = storageHandler;
    this.logger = logger;
    this.runFilter = runFilter;
  }

  protected async processStartedJobs(): Promise<void> {
    this.logger.info(`Proccesing Existing Sagemaker jobs`);
    const activeJobs = await listBatchTransformJobs(this.runFilter);
    this.runningJobs = 0;
    for (const job of activeJobs.TransformJobSummaries ?? []) {
      switch (job.TransformJobStatus) {
        case TransformJobStatus.FAILED:
          await prisma.transcriptionJob.update({
            where: { jobName: job.TransformJobName },
            data: { status: TranscriptionProcessStatus.FAILED },
          });
          this.logger.error(
            `Transcription job ${job.TransformJobName} failed`,
            job.FailureReason
          );
          break;
        case TransformJobStatus.IN_PROGRESS:
          this.runningJobs++;
          break;

        case TransformJobStatus.COMPLETED:
          job.TransformEndTime;
          await prisma.transcriptionJob.update({
            where: { jobName: job.TransformJobName },
            data: {
              status: TranscriptionProcessStatus.TRANSCRIPTION_JOB_COMPLETED,
              jobFinishedAt: job.TransformEndTime || new Date(),
            },
          });
          this.logger.info(
            `Transcription job ${job.TransformJobName} completed`
          );
          break;
        case TransformJobStatus.STOPPING:
          this.logger.warn(
            `Unexpected sagemaker job status ${job.TransformJobStatus}`,
            job
          );
          this.runningJobs++;
          break;

        case TransformJobStatus.STOPPED:
          this.logger.warn(
            `Unexpected sagemaker job status ${job.TransformJobStatus}`,
            job
          );
          break;
      }
    }
  }
  protected async processFinishedJobs(): Promise<void> {
    const finishedJobs = await prisma.transcriptionJob.findMany({
      where: {
        type: TranscriptionType.AUTOMATIC,
        status: TranscriptionProcessStatus.TRANSCRIPTION_JOB_COMPLETED,
      },
      include: { document: true },
    });
    this.logger.info(`Merging ${finishedJobs.length} finished sagemaker jobs`);

    // Get transcription output file names

    for (const job of finishedJobs) {
      const document = job.document;
      const whisperTranscriptObject = await this.storageHandler.getObject(
        getSpeechToTextOutputKey(document.id)
      );

      if (!whisperTranscriptObject) {
        this.logger.error(
          `Error loading whisperTranscriptObject.Body for ${getSpeechToTextOutputKey(
            document.id
          )}`
        );
        return;
      }
      const whisperTranscript = JSON.parse(
        new TextDecoder().decode(whisperTranscriptObject)
      );
      const pyannoteTranscriptObject = await this.storageHandler.getObject(
        getSpeakerDiarizationOutputKey(document.id)
      );
      if (!pyannoteTranscriptObject) {
        this.logger.error(
          `Error loading pyannoteTranscriptObject.Body for ${getSpeechToTextOutputKey(
            document.id
          )}`
        );
        return;
      }
      const pyannoteTranscript = JSON.parse(
        new TextDecoder().decode(pyannoteTranscriptObject)
      );
      const mergedTranscript = new WhisperPyannoteMerger(
        pyannoteTranscript,
        whisperTranscript,
        25,
        15,
        document.title,
        this.logger
      ).createSpeakerChangeTranscriptionTipTapJSON();
      const mergedTranscriptKey = getGeneratedTranscriptionFileKey(document.id);

      await this.storageHandler.putObject(
        mergedTranscriptKey,
        Buffer.from(JSON.stringify(mergedTranscript)),
        'application/json',
        undefined,
        true
      );

      // Convert to TipTapTransformerDocument
      const yDoc = TipTapJSONToYDoc(mergedTranscript.default);
      const yDocArray = Y.encodeStateAsUpdate(yDoc);

      await prisma.document.update({
        where: {
          id: document.id,
        },
        data: {
          data: Buffer.from(yDocArray),
          transcription: {
            update: {
              status: TranscriptionProcessStatus.DONE,
            },
          },
        },
      });
    }
  }
  protected async processQueuedJobs(): Promise<void> {
    // Get all documents that have not been transcribed
    const queuedDocuments = await prisma.document.findMany({
      where: {
        transcription: {
          type: TranscriptionType.AUTOMATIC,
          status: TranscriptionProcessStatus.QUEUED,
        },
        audioFileURL: { not: null },
      },
      orderBy: { createdAt: 'asc' },
      take:
        TranscriptionJobHandler.MAX_CONCURRENT_TRANSCRIPTION_JOBS -
        this.runningJobs,
    });
    this.logger.info(`Starting ${queuedDocuments.length} transcription jobs`);

    // For each document ordered by creation time, start a transcription job until the limit is reached
    for (const document of queuedDocuments) {
      const TranscriptionProcessor = new SagemakerBatchTransformTranscription(
        new S3StorageHandler(AWS_AUDIO_BUCKET_NAME),
        document.id,
        document.audioFileURL!,
        {
          model: 'medium',
          language: document.language as keyof typeof LanguageCodePairs,
        },
        this.logger
      );
      try {
        const jobName = await TranscriptionProcessor.triggerBatchTransformJob();
        await prisma.transcriptionJob.update({
          where: { documentId: document.id },
          data: {
            jobName: jobName,
            status: TranscriptionProcessStatus.TRANSCRIPTION_JOB_RUNNING,
            jobStartedAt: new Date(),
          },
        });
        this.logger.info(
          `Created transcription job ${jobName} for ${document.id}`
        );
      } catch (err) {
        this.logger.error(`Error starting transcription job`, err);
        break;
      }
    }
  }

  async run(): Promise<void> {
    this.logger.info(`Running transcription job handler`);
    await this.processStartedJobs();
    this.logger.info(`${this.runningJobs} transcription jobs running`);
    await this.processQueuedJobs();
    await this.processFinishedJobs();
  }
}
