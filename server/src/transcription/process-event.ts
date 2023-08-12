import { S3Event, S3EventRecord } from 'aws-lambda';
import aws from 'aws-sdk';
import { logger } from '../services/logger.js';
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
import { loadObject, uploadObject } from '../services/aws-s3.js';
import { createTranscriptionJob } from './sagemaker-transcription.js';
import { LanguageCodePairs } from './languages.js';
import { createSpeakerChangeTranscriptionHTML } from './merge-whisper-pyannote.js';

export const processSQSMessage = (event: aws.SQS.ReceiveMessageResult) => {
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
      processS3Event(record);
    })
  );
};

const processS3Event = async (event: S3EventRecord) => {
  const key = event.s3.object.key;
  const bucket = event.s3.bucket.name;
  let eventType = event.eventName;

  const { prefix, documentId } = splitAudioTranscriptionBucketKey(key);

  logger.info(`Processing ${eventType} event for ${key}`);

  if (bucket !== AWS_AUDIO_BUCKET_NAME) {
    logger.error(
      `Unexpected bucket ${bucket} in transcription processing, expected ${AWS_AUDIO_BUCKET_NAME}`
    );
    return;
  }

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
    return;
  }

  if (document.transcriptionType === 'MANUAL') {
    logger.info(
      `Skipping processing of ${key} because transcription type is MANUAL`
    );
    return;
  }
  // Process event
  let postOperationDocument: Document | undefined;
  switch (prefix) {
    case audioFilePrefix:
      postOperationDocument = await processAudioFilePrefixEvent(document, key);
      break;
    case speakerDiarizationFilePrefix:
      postOperationDocument = await processSpeakerDiarizationFilePrefixEvent(
        document,
        key
      );
      break;
    case speechToTextFilePrefix:
      postOperationDocument = await processSpeechToTextFilePrefixEvent(
        document,
        key
      );
      break;
  }
  // Decide if we need to merge the transcription
  if (!postOperationDocument) {
    logger.error(
      `Error processing ${key} for document ${document.id}, postOperationDocument is undefined`
    );
    return;
  }
  if (
    document.speakerDiarizationFileURL &&
    document.speechToTextFileURL &&
    document.transcriptionStatus === 'PROCESSING'
  ) {
    let mergedTranscript = await getSpeakerChangeTranscriptionDocument(
      postOperationDocument
    );
    let mergedTranscriptKey = `${mergedTranscriptionFilePrefix}/${postOperationDocument.id}.html`;
    if (!mergedTranscript) {
      logger.error(
        `Error creating mergedTranscript for ${postOperationDocument.id}`
      );
      return;
    }
    await uploadObject(
      AWS_AUDIO_BUCKET_NAME,
      mergedTranscriptKey,
      Buffer.from(mergedTranscript),
      'text/html',
      true
    );
    await prisma.document.update({
      where: {
        id: postOperationDocument.id,
      },
      data: {
        mergedTranscriptionFileURL: mergedTranscriptKey,
        transcriptionStatus: 'DONE',
      },
    });
  }
};

const processSpeechToTextFilePrefixEvent = async (
  document: Document,
  speechToTextFileUrl: string
) => {
  logger.info(`speechToText file ${speechToTextFileUrl} received`);
  return await prisma.document.update({
    where: {
      id: document.id,
    },
    data: {
      transcriptionStatus: 'PROCESSING',
      speechToTextFileURL: speechToTextFileUrl,
    },
  });
};

const processAudioFilePrefixEvent = async (
  document: Document,
  audioFileUrl: string
) => {
  // start transcription
  createTranscriptionJob(document.id, audioFileUrl, {
    model: 'medium',
    language: document.language as keyof typeof LanguageCodePairs,
  });

  return await prisma.document.update({
    where: {
      id: document.id,
    },
    data: {
      transcriptionStatus: 'PROCESSING',
      transcriptionStartedAt: new Date(),
    },
  });
};

const processSpeakerDiarizationFilePrefixEvent = async (
  document: Document,
  speakerDiarizationFileUrl: string
) => {
  logger.info(`speakerDiarization file ${speakerDiarizationFileUrl} received`);

  return await prisma.document.update({
    where: {
      id: document.id,
    },
    data: {
      transcriptionStatus: 'PROCESSING',
      speakerDiarizationFileURL: speakerDiarizationFileUrl,
    },
  });
};

const getSpeakerChangeTranscriptionDocument = async (document: Document) => {
  if (!document.speechToTextFileURL || !document.speakerDiarizationFileURL) {
    logger.error(
      `Cannot create speaker change transcription document for ${document.id} because speechToTextFileURL or speakerDiarizationFileURL is missing`
    );
    return;
  }
  let whisperTranscriptObject = await loadObject(
    AWS_AUDIO_BUCKET_NAME,
    document.speechToTextFileURL
  );
  if (!whisperTranscriptObject.Body) {
    logger.error(
      `Error loading whisperTranscriptObject.Body for ${document.speechToTextFileURL}`
    );
    return;
  }
  let whisperTranscript = JSON.parse(whisperTranscriptObject.Body.toString());
  let pyannoteTranscriptObject = await loadObject(
    AWS_AUDIO_BUCKET_NAME,
    document.speakerDiarizationFileURL
  );
  if (!pyannoteTranscriptObject.Body) {
    logger.error(
      `Error loading pyannoteTranscriptObject.Body for ${document.speakerDiarizationFileURL}`
    );
    return;
  }
  let pyannoteTranscript = JSON.parse(pyannoteTranscriptObject.Body.toString());

  let mergedTranscript = createSpeakerChangeTranscriptionHTML(
    pyannoteTranscript,
    whisperTranscript
  );
  return mergedTranscript;
};

let isRunningDirectly = false;
if (isRunningDirectly) {
  let key = 'raw-audio/2a3137c7-d384-4ccf-b988-1fba8b959b9b.wav';
  let message = JSON.parse(
    `{"Records":[{"eventVersion":"2.1","eventSource":"aws:s3","awsRegion":"eu-north-1","eventTime":"2023-08-07T21:13:34.120Z","eventName":"ObjectCreated:Put","userIdentity":{"principalId":"A2V19B3S4B84UN"},"requestParameters":{"sourceIPAddress":"94.147.132.243"},"responseElements":{"x-amz-request-id":"ZRJHBNYAAR4Y5HBJ","x-amz-id-2":"hM1opR9W2viLhYrBw366UZ/OgvX+8fIiZVNG4AxLS3MixYCzLUG0mighFO7ZQDI8xGB+q1HfjEBnX4jgJixbTa/s5mq2Tuj+"},"s3":{"s3SchemaVersion":"1.0","configurationId":"tf-s3-queue-20230802193330704100000001","bucket":{"name":"voxtir-audiofiles-staging","ownerIdentity":{"principalId":"A2V19B3S4B84UN"},"arn":"arn:aws:s3:::voxtir-audiofiles-staging"},"object":{"key":"${key}","size":0,"eTag":"d41d8cd98f00b204e9800998ecf8427e","sequencer":"0064D15E7E185D5852"}}}]}`
  );
  processS3Events(message);
}
