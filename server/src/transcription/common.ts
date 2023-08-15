import { logger } from '../services/logger.js';

// CONSTANTS
export const AWS_AUDIO_BUCKET_PRESIGNED_URL_EXPIRATION = 60 * 60 * 2; // 2 Hours in milliseconds

// TRANSCRIPTION BUCKET SETUP
export const audioFilePrefix = 'raw-audio';
export const speechToTextFilePrefix = 'speech-to-text';
export const speakerDiarizationFilePrefix = 'speaker-diarization';
export const mergedTranscriptionFilePrefix = 'merged-transcription';
export const sagemakerJSONFilePrefix = 'sagemaker-input';
// NOTE: This is the prefix for the output of the sagemaker job. But the output is not used
export const sagemakerOutputFilePrefix = 'sagemaker-output';

interface audioTranscriptionKeyParts {
  prefix: string;
  documentId: string;
  fileType: string;
  fullKey: string;
}
/**
 * Simple function to split an audio transcription key into its parts. Expects the key to be in the format <AUDIO_FOLDER_PREFIX>/<DOCUMENT_ID>.<FILE_TYPE>
 * @param key
 * @returns
 */
export function splitAudioTranscriptionBucketKey(
  key: string
): audioTranscriptionKeyParts {
  if (
    key.split('/').length !== 2 ||
    !(key.split('.').length === 2 || key.split('.').length === 3)
  ) {
    logger.error(
      `Unexpected key format for audio transcription file ${key}, expected <AUDIO_FOLDER_PREFIX>/<DOCUMENT_ID>.<FILE_TYPE>`
    );
    throw new Error(
      `Unexpected key format for audio transcription file ${key}, expected <AUDIO_FOLDER_PREFIX>/<DOCUMENT_ID>.<FILE_TYPE>`
    );
  }

  const prefix = key.split('/')[0];
  const documentId = key.split('/')[1].split('.')[0];
  const fileType = key.split('/')[1].split('.')[1];

  return { prefix, documentId, fileType, fullKey: key };
}
