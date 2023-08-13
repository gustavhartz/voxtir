import { S3Event, S3EventRecord } from 'aws-lambda';
import { ReceiveMessageCommandOutput } from '@aws-sdk/client-sqs'; // ES Mimport { logger } from '../services/logger.js';
import prisma from '../prisma/index.js';
import { Document } from '@prisma/client';
import { AWS_AUDIO_BUCKET_NAME } from '../common/env.js';
import {
  audioFilePrefix,
  speakerDiarizationFilePrefix,
  speechToTextFilePrefix,
  mergedTranscriptionFilePrefix,
  splitAudioTranscriptionBucketKey,
} from './common.js';
import { SagemakerWhisperTranscription } from './sagemaker-transcription.js';
import {
  S3StorageHandler,
  StorageHandler,
} from '../services/storageHandler.js';
import { LanguageCodePairs } from './languages.js';
import { createSpeakerChangeTranscriptionHTML } from './merge-whisper-pyannote.js';
import { logger } from '../services/logger.js';

export const processSQSMessage = (event: ReceiveMessageCommandOutput) => {
  event.Messages?.forEach((message) => {
    if (!message.Body) {
      return;
    }
    const body: S3Event = JSON.parse(message.Body);
    processS3Events(body);
  });
};

const processS3Events = async (event: S3Event) => {
  // Test events are different from real events
  if (event.hasOwnProperty('Event')) {
    logger.info('Test event revieced in transcription processing, skipping');
    return;
  }
  await Promise.all(
    event.Records.map((record) => {
      new AudioTranscriptionEventHandler(
        record,
        new S3StorageHandler(AWS_AUDIO_BUCKET_NAME)
      ).process();
    })
  );
};

export class AudioTranscriptionEventHandler {
  #document: Document | null = null;
  storageHandler: StorageHandler;
  event: S3EventRecord;
  setupComplete: boolean = false;

  constructor(event: S3EventRecord, storageHandler: StorageHandler) {
    this.storageHandler = storageHandler;
    this.event = event;
  }

  async #setup() {
    if (this.setupComplete) {
      return;
    }
    let success = await this.#validateAndSetDocument();
    if (!success || !this.#document) {
      throw new Error('Could not validate and set document');
    }

    this.setupComplete = true;
  }

  async process(): Promise<void> {
    if (!this.shouldProcessEvent()) {
      return;
    }
    await this.#setup();
    // Get rid of ts error
    if (!this.#document) {
      logger.error('this.#document is null');
      return;
    }
    const { prefix } = splitAudioTranscriptionBucketKey(this.getKeyFromEvent());
    switch (prefix) {
      case audioFilePrefix:
        let TranscriptionProcessor = new SagemakerWhisperTranscription(
          new S3StorageHandler(AWS_AUDIO_BUCKET_NAME),
          this.#document.id,
          this.getKeyFromEvent(),
          {
            model: 'medium',
            language: this.#document.language as keyof typeof LanguageCodePairs,
          }
        );
        await TranscriptionProcessor.triggerBatchTransformJob();
      case speakerDiarizationFilePrefix:
        this.#document = await prisma.document.update({
          where: {
            id: this.#document.id,
          },
          data: {
            transcriptionStatus: 'PROCESSING',
            speakerDiarizationFileURL: this.getKeyFromEvent(),
          },
        });
      case speechToTextFilePrefix:
        this.#document = await prisma.document.update({
          where: {
            id: this.#document.id,
          },
          data: {
            transcriptionStatus: 'PROCESSING',
            speechToTextFileURL: this.getKeyFromEvent(),
          },
        });
      default:
        logger.debug(
          `Received ${this.getEventTypeFromEvent()} event for ${this.getKeyFromEvent()}. Skipping.`
        );
    }
    if (!this.readyForSpeakerChangeTranscription()) {
      return;
    }
    await this.#createAndPutSpeakerChangeHTMLDocument();
  }

  readyForSpeakerChangeTranscription(): boolean {
    const document = this.#document;
    if (!document) {
      throw new Error('document is null');
    }
    if (
      !document.speakerDiarizationFileURL ||
      !document.speechToTextFileURL ||
      !(document.transcriptionStatus === 'PROCESSING')
    ) {
      return false;
    }
    return true;
  }

  async #createAndPutSpeakerChangeHTMLDocument() {
    const document = this.#document as any as Document;
    let whisperTranscriptObject = await this.storageHandler.getObject(
      //@ts-ignore
      document.speechToTextFileURL
    );
    if (!whisperTranscriptObject) {
      logger.error(
        `Error loading whisperTranscriptObject.Body for ${document.speechToTextFileURL}`
      );
      return;
    }
    let whisperTranscript = JSON.parse(whisperTranscriptObject.toString());
    let pyannoteTranscriptObject = await this.storageHandler.getObject(
      //@ts-ignore
      document.speakerDiarizationFileURL
    );
    if (!pyannoteTranscriptObject) {
      logger.error(
        `Error loading pyannoteTranscriptObject.Body for ${document.speakerDiarizationFileURL}`
      );
      return;
    }
    let pyannoteTranscript = JSON.parse(pyannoteTranscriptObject.toString());
    let mergedTranscript = createSpeakerChangeTranscriptionHTML(
      pyannoteTranscript,
      whisperTranscript
    );
    let mergedTranscriptKey = `${mergedTranscriptionFilePrefix}/${document.id}.html`;

    await this.storageHandler.putObject(
      mergedTranscriptKey,
      Buffer.from(mergedTranscript),
      'text/html',
      true
    );

    await prisma.document.update({
      where: {
        id: document.id,
      },
      data: {
        mergedTranscriptionFileURL: mergedTranscriptKey,
        transcriptionStatus: 'DONE',
      },
    });
  }

  shouldProcessEvent() {
    if (this.event.eventName !== 'ObjectCreated:Put') {
      logger.debug(
        `Received ${this.event.eventName} event for ${this.event.s3.object.key}. Skipping.`
      );
      return false;
    }
    if (this.getBucketFromEvent() !== AWS_AUDIO_BUCKET_NAME) {
      logger.error(
        `Unexpected bucket ${this.getBucketFromEvent()} in transcription processing, expected ${AWS_AUDIO_BUCKET_NAME}`
      );
      return false;
    }
    return true;
  }
  async #validateAndSetDocument() {
    let key = this.getKeyFromEvent();
    const { prefix, documentId } = splitAudioTranscriptionBucketKey(key);

    logger.info(
      `Processing ${this.getEventTypeFromEvent()} event for ${prefix}/${key}`
    );

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
      },
    });

    // Error handling
    if (!document) {
      logger.error(
        `Recieved event for unknown document. Could not find document for audio file ${key}`
      );
      return false;
    }

    if (document.transcriptionType === 'MANUAL') {
      logger.info(
        `Skipping processing of ${key} because transcription type is MANUAL`
      );
      return false;
    }
    this.#document = document;
    return true;
  }

  getBucketFromEvent() {
    return this.event.s3.bucket.name;
  }

  getKeyFromEvent() {
    return this.event.s3.object.key;
  }

  getEventTypeFromEvent() {
    return this.event.eventName;
  }
}
