import { AWS_AUDIO_BUCKET_NAME } from '../common/env.js';
import prisma from '../prisma/index.js';
import { logger } from '../services/logger.js';
import { S3StorageHandler } from '../services/storageHandler.js';
import {
  audioFilePrefix,
  AWS_AUDIO_BUCKET_PRESIGNED_URL_EXPIRATION,
} from './common.js';

const s3 = new S3StorageHandler(AWS_AUDIO_BUCKET_NAME);

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
  fileEnding = '',
  contentType = ''
): Promise<string> => {
  const key = `${audioFilePrefix}/${documentId}.${fileEnding}`;
  logger.info(`Uploading audio file to ${key}`);

  await s3.putObject(key, body, contentType, false);
  return key;
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
  const doc = await prisma.document.findUnique({
    where: {
      id: documentId,
    },
  });
  if (!doc || !doc.audioFileURL) {
    throw new Error(
      `Document with id ${documentId} not found with audio file key`
    );
  }
  const url = await s3.generatePresignedUrlForObject(
    doc.audioFileURL,
    AWS_AUDIO_BUCKET_PRESIGNED_URL_EXPIRATION
  );
  // calculate expiration for client
  const expiration = new Date();

  expiration.setTime(
    expiration.getTime() + AWS_AUDIO_BUCKET_PRESIGNED_URL_EXPIRATION * 1000
  );
  return { url, expiresAt: expiration.getTime() };
};

const isRunningDirectly = false;
if (isRunningDirectly) {
  const documentId = 'tawefwaefcsdfsffsefssdvfsesefsst';
  const body = Buffer.from('girglpershjg');
  const fileEnding = 'txt';
  const t2 = await uploadAudioFile(documentId, body, fileEnding, 'text/plain');
  console.log(t2);
  console.log('Uploaded audio file');
  const t3 = await getPresignedUrlForDocumentAudioFile(documentId);
  console.log(t3);
}
