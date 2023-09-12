/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ReceiveMessageCommandOutput } from '@aws-sdk/client-sqs';
import { Document } from '@prisma/client';
import { S3Event, S3EventRecord } from 'aws-lambda';
import * as Y from 'yjs';

import { AWS_AUDIO_BUCKET_NAME } from '../common/env.js';
import prisma from '../prisma/index.js';
import { Logger, logger as CoreLogger } from '../services/logger.js';
import {
  S3StorageHandler,
  StorageHandler,
} from '../services/storageHandler.js';
import { TipTapJSONToYDoc } from '../tiptap-editor/index.js';
import {
  audioFilePrefix,
  generatedTranscriptionFilePrefix,
  speakerDiarizationFilePrefix,
  speechToTextFilePrefix,
  splitAudioTranscriptionBucketKey,
} from './common.js';
import { LanguageCodePairs } from './common.js';
import { SagemakerBatchTransformTranscription } from './sagemaker-transcription.js';
import { WhisperPyannoteMerger } from './whisper-pyannote-merge-into-tiptap.js';

export class SQSTranscriptionMessageHandler {
  private logger: Logger;
  private event: ReceiveMessageCommandOutput;
  constructor(event: ReceiveMessageCommandOutput, logger: Logger) {
    this.logger = logger;
    this.event = event;
  }

  async processSQSMessage(): Promise<void> {
    for (const message of this.event.Messages ?? []) {
      if (!message.Body) {
        return;
      }
      const body: S3Event = JSON.parse(message.Body);
      await this.processS3Events(body);
    }
  }
  private async processS3Events(event: S3Event): Promise<void> {
    // Test events are different from real events
    if (Object.prototype.hasOwnProperty.call(event, 'Event')) {
      this.logger.info(
        'Test event revieced in transcription processing, skipping'
      );
      return;
    }
    for (const record of event.Records) {
      await new S3AudioTranscriptionEventHandler(
        record,
        new S3StorageHandler(AWS_AUDIO_BUCKET_NAME),
        this.logger
      ).process();
    }
  }
}

export class S3AudioTranscriptionEventHandler {
  #document: Document | null = null;
  storageHandler: StorageHandler;
  event: S3EventRecord;
  setupComplete = false;
  logger: Logger;

  constructor(
    event: S3EventRecord,
    storageHandler: StorageHandler,
    logger?: Logger
  ) {
    this.storageHandler = storageHandler;
    this.event = event;
    this.logger = logger || CoreLogger;
  }

  async #setup(): Promise<void> {
    if (this.setupComplete) {
      return;
    }
    const success = await this.#validateAndSetDocument();
    if (!success || !this.#document) {
      throw new Error('Could not validate and set document');
    }

    this.setupComplete = true;
  }
  shouldProcessDocumet(): boolean {
    if (
      this.#document?.transcriptionStatus === 'DONE' ||
      this.#document?.transcriptionType === 'MANUAL'
    ) {
      return false;
    }
    return true;
  }

  async process(): Promise<void> {
    if (!this.shouldProcessEvent()) {
      return;
    }
    await this.#setup();
    // Get rid of ts error
    if (!this.#document) {
      this.logger.error('this.#document is null');
      return;
    }
    if (!this.shouldProcessDocumet()) {
      this.logger.info(
        `Document ${this.#document?.id} should not be processed. Skipping`
      );
    }
    const { prefix } = splitAudioTranscriptionBucketKey(this.getKeyFromEvent());
    switch (prefix) {
      case audioFilePrefix: {
        const TranscriptionProcessor = new SagemakerBatchTransformTranscription(
          new S3StorageHandler(AWS_AUDIO_BUCKET_NAME),
          this.#document.id,
          this.getKeyFromEvent(),
          {
            model: 'medium',
            language: this.#document.language as keyof typeof LanguageCodePairs,
          },
          this.logger
        );
        await TranscriptionProcessor.triggerBatchTransformJob();
        break;
      }
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
        break;
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
        break;
      default:
        this.logger.debug(
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

  async #createAndPutSpeakerChangeHTMLDocument(): Promise<void> {
    const document = this.#document as any as Document;
    const whisperTranscriptObject = await this.storageHandler.getObject(
      //@ts-ignore
      document.speechToTextFileURL
    );
    if (!whisperTranscriptObject) {
      this.logger.error(
        `Error loading whisperTranscriptObject.Body for ${document.speechToTextFileURL}`
      );
      return;
    }
    const whisperTranscript = JSON.parse(
      new TextDecoder().decode(whisperTranscriptObject)
    );
    const pyannoteTranscriptObject = await this.storageHandler.getObject(
      //@ts-ignore
      document.speakerDiarizationFileURL
    );
    if (!pyannoteTranscriptObject) {
      this.logger.error(
        `Error loading pyannoteTranscriptObject.Body for ${document.speakerDiarizationFileURL}`
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
    ).createSpeakerChangeTranscriptionHTML();
    const mergedTranscriptKey = `${generatedTranscriptionFilePrefix}/${document.id}.html`;

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
        mergedTranscriptionFileURL: mergedTranscriptKey,
        transcriptionStatus: 'DONE',
        data: Buffer.from(yDocArray),
      },
    });
  }

  shouldProcessEvent(): boolean {
    if (this.getEventTypeFromEvent() !== 'ObjectCreated:Put') {
      this.logger.debug(
        `Received ${this.event.eventName} event for ${this.event.s3.object.key}. Skipping.`
      );
      return false;
    }
    if (this.getBucketFromEvent() !== AWS_AUDIO_BUCKET_NAME) {
      this.logger.error(
        `Unexpected bucket ${this.getBucketFromEvent()} in transcription processing, expected ${AWS_AUDIO_BUCKET_NAME}`
      );
      return false;
    }
    return true;
  }
  async #validateAndSetDocument(): Promise<boolean> {
    const key = this.getKeyFromEvent();
    const { prefix, documentId } = splitAudioTranscriptionBucketKey(key);

    this.logger.info(
      `Processing ${this.getEventTypeFromEvent()} event for ${prefix}/${key}`
    );

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
      },
    });

    // Error handling
    if (!document) {
      this.logger.error(
        `Recieved event for unknown document. Could not find document for audio file ${key}`
      );
      return false;
    }

    if (document.transcriptionType === 'MANUAL') {
      this.logger.info(
        `Skipping processing of ${key} because transcription type is MANUAL`
      );
      return false;
    }
    this.#document = document;
    return true;
  }

  getBucketFromEvent(): string {
    return this.event.s3.bucket.name;
  }

  getKeyFromEvent(): string {
    return this.event.s3.object.key;
  }

  getEventTypeFromEvent(): string {
    return this.event.eventName;
  }
}
