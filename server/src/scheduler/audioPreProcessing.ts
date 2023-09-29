import { TranscriptionProcessStatus, TranscriptionType } from '@prisma/client';

import { AWS_AUDIO_BUCKET_NAME } from '../common/env.js';
import prisma from '../prisma/index.js';
import { invokeAudioProcessor } from '../services/aws-lambda.js';
import { logger } from '../services/logger.js';
import {
  getProcessedAudioFileKey,
  getRawAudioFileKey,
} from '../transcription/common.js';
const TARGET_FILE_FORMAT = 'mp3';

export const processAudioFile = async (
  documentId: string,
  rawAudioFileExtension: string,
  transcriptionJobId: string,
  transcriptionType: TranscriptionType
): Promise<boolean> => {
  try {
    const rawAudioKey = getRawAudioFileKey(documentId, rawAudioFileExtension);
    const processedAudioKey = getProcessedAudioFileKey(
      documentId,
      TARGET_FILE_FORMAT
    );
    logger.info(`Running ffmpeg lambda on audiofile ${rawAudioKey}`);
    const processingResult = await invokeAudioProcessor({
      input_file_bucket: AWS_AUDIO_BUCKET_NAME,
      input_file_key: rawAudioKey,
      input_file_format: rawAudioFileExtension,
      output_file_bucket: AWS_AUDIO_BUCKET_NAME,
      output_file_key: processedAudioKey,
      output_file_format: TARGET_FILE_FORMAT,
    });
    await prisma.transcriptionJob.update({
      where: {
        id: transcriptionJobId,
      },
      data: {
        status:
          transcriptionType === TranscriptionType.AUTOMATIC
            ? TranscriptionProcessStatus.QUEUED
            : TranscriptionProcessStatus.DONE,
        document: {
          update: {
            audioFileURL: processedAudioKey,
            rawAudioFileLengthSeconds:
              processingResult.body.original_file_length,
            processedAudioFileLengthSeconds:
              processingResult.body.processed_file_length,
          },
        },
      },
    });
    return true;
  } catch (e) {
    logger.error(`Error processing audio file ${e}`);
    await prisma.transcriptionJob.update({
      where: {
        id: transcriptionJobId,
      },
      data: {
        status: TranscriptionProcessStatus.FAILED,
      },
    });
    return false;
  }
};
