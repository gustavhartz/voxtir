import aws from 'aws-sdk';
import {
  uploadObject,
  generatePresignedUrlForObject,
} from '../services/aws.js';
import { logger } from '../services/logger.js';

// CONSTANTS
const AWS_AUDIO_BUCKET_PRESIGNED_URL_EXPIRATION = 60 * 60 * 2; // 2 Hours in milliseconds
const AWS_REGION = process.env.AWS_REGION;
const AWS_AUDIO_BUCKET_NAME = process.env.AWS_AUDIO_BUCKET_NAME;

// TRANSCRIPTION BUCKET SETUP
export const uploadedAudioFilePrefix = 'raw-audio';
export const processedAudioFilePrefix = 'processed-audio';
export const transcriptionFilePrefix = 'transcription';
export const speakerDiarizationFilePrefix = 'speaker-diarization';
export const mergedTranscriptionFilePrefix = 'merged-transcription';

export const processedFileFormat = 'wav';

if (!AWS_REGION || !AWS_AUDIO_BUCKET_NAME) {
  throw new Error('Missing env - not defined');
}

/**
 * Basic function for uploading an audio file to S3 from user. Intended to be used for raw audio files
 * than then will be processed by the transcription service (lambda). This function will not overwrite
 * existing files. And should only really be used for the initial user upload.
 * @param documentId
 * @param body
 * @param fileEnding
 * @param contentType
 * @returns
 */
export const uploadAudioFile = async (
  documentId: string,
  body: Buffer,
  fileEnding: string = '',
  contentType: string = 'audio/wav'
): Promise<aws.S3.ManagedUpload.SendData> => {
  const key = `${uploadedAudioFilePrefix}/${documentId}.${fileEnding}`;
  logger.info(`Uploading audio file to ${key}`);
  return uploadObject(AWS_AUDIO_BUCKET_NAME, key, body, contentType, false);
};

/**
 * This function will generate a pre-signed URL for a processed audio file. This is intended to be used
 * for the client to download the processed audio file. The URL will expire after 2 hours. At assumes that
 * the file is in the processed-audio folder in S3. Thus the caller is responsible for ensuring that the file
 * is in the correct folder / has been processed.
 * @param documentId
 * @returns
 */
export const getPresignedUrlForDocumentAudioFile = async (
  documentId: string
): Promise<{ url: string; expiresAt: number }> => {
  const key = `${processedAudioFilePrefix}/${documentId}.${processedFileFormat}`;
  let url = await generatePresignedUrlForObject(
    AWS_AUDIO_BUCKET_NAME,
    key,
    AWS_AUDIO_BUCKET_PRESIGNED_URL_EXPIRATION
  );
  // calculate expiration for client
  const expiration = new Date();

  expiration.setTime(
    expiration.getTime() + AWS_AUDIO_BUCKET_PRESIGNED_URL_EXPIRATION * 1000
  );
  return { url, expiresAt: expiration.getTime() };
};

let isRunningDirectly = false;
if (isRunningDirectly) {
  let documentId = 'tawefwaefcsdfsffsefssdvfsesefsst';
  let body = Buffer.from('girglpershjg');
  let fileEnding = 'txt';
  let t2 = await uploadAudioFile(documentId, body, fileEnding, 'text/plain');
  console.log(t2);
  console.log('Uploaded audio file');
  let t3 = await getPresignedUrlForDocumentAudioFile(documentId);
  console.log(t3);
}
