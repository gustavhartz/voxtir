import { AWS_AUDIO_BUCKET_NAME } from '../common/env.js';
import { mimeTypeToExtension } from '../common/file-formats.js';
import prisma from '../prisma/index.js';
import { logger } from '../services/logger.js';
import { S3StorageHandler } from '../services/storageHandler.js';
import {
  AWS_AUDIO_BUCKET_PRESIGNED_URL_EXPIRATION,
  getRawAudioFileKey,
} from './common.js';

const s3 = new S3StorageHandler(AWS_AUDIO_BUCKET_NAME);

/**
 * Basic function for uploading an audio file to S3 from user. Intended to be used for raw audio files
 * than then will be processed by the transcription service (lambda). This function will not overwrite
 * existing files. And should only really be used for the initial user upload.
 * @param documentId
 * @param body
 * @param fileName
 * @param contentType
 * @returns
 */
export const uploadAudioFile = async (
  documentId: string,
  body: Buffer,
  contentLength: number,
  fileName = '',
  contentType = ''
): Promise<string> => {
  const fileExtension = mimeTypeToExtension(contentType);
  const key = getRawAudioFileKey(documentId, fileExtension);
  logger.info(
    `Uploading audio file ${fileName} to ${key} with size ${contentLength}`
  );
  await s3.putObject(key, body, contentType, contentLength, false);
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
): Promise<{ url: string; expiresAtUnixSeconds: number }> => {
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
  return { url, expiresAtUnixSeconds: Math.floor(expiration.getTime() / 1000) };
};
