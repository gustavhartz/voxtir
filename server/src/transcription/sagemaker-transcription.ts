import { CreateTransformJobCommandInput } from '@aws-sdk/client-sagemaker';
import { v4 as uuidv4 } from 'uuid';
import {
  AWS_AUDIO_BUCKET_NAME,
  SAGEMAKER_TRANSCRIPTION_MODEL_NAME,
} from '../helpers/env.js';
import { uploadObject } from '../services/aws-s3.js';
import { createBatchTransformJob } from '../services/aws-sagemaker.js';
import {
  speechToTextFilePrefix,
  speakerDiarizationFilePrefix,
  sagemakerJSONFilePrefix,
  sagemakerOutputFilePrefix,
  splitAudioTranscriptionBucketKey,
} from './common.js';
import { logger } from '../services/logger.js';
import { LanguageCodePairs } from './languages.js';
import {
  NODE_ENV,
  SAGEMAKER_TRANSCRIPTION_MODEL_ENV_AVAILABLE_WHISPER_MODELS,
  SAGEMAKER_TRANSCRIPTION_MODEL_ENV_HF_AUTH_TOKEN,
  LOG_LEVEL,
} from '../helpers/env.js';

interface TranscriptionJsonFile {
  bucketName: string;
  audioInputKey: string;
  fileExtension: string;
  speakerDiarizationOutputKey: string;
  speechToTextOutputKey: string;
  modelOptions: modelOptions;
}

export interface modelOptions {
  model: string;
  language?: keyof typeof LanguageCodePairs;
  speakerCount?: number;
}

export const createTranscriptionJob = async (
  documentId: string,
  audioFileUri: string,
  modelOptions: modelOptions = { model: 'medium' }
) => {
  logger.info(
    `Creating uploading json file for sagemaker - documentId: ${documentId}`
  );
  let key = `${sagemakerJSONFilePrefix}/${documentId}.json`;
  let jsonFile = createTranscriptionJsonFile(
    documentId,
    audioFileUri,
    modelOptions
  );
  await uploadObject(
    AWS_AUDIO_BUCKET_NAME,
    key,
    Buffer.from(JSON.stringify(jsonFile)),
    'application/json',
    true
  );
  let jsonInputFileUri = `s3://${AWS_AUDIO_BUCKET_NAME}/${key}`;

  // Create jobPayload
  let payload = createTranscriptionJobPayload(jsonInputFileUri, documentId);

  // Create job
  try {
    await createBatchTransformJob(payload);
  } catch (e) {
    logger.error(`Error creating transcription job: ${e}`);
  }
};

const createTranscriptionJobPayload = (
  jsonInputFileUri: string,
  documentId: string
): CreateTransformJobCommandInput => {
  const params = {
    // CreateTransformJobRequest
    TransformJobName: `${documentId}-${uuidv4()}`, // required
    ModelName: SAGEMAKER_TRANSCRIPTION_MODEL_NAME, // required
    Environment: {
      /* 
      TransformEnvironmentMap. This is the environment variables for the sagemaker container. 
      Currently, log level and environment are just passed through.
      */
      AVAILABLE_WHISPER_MODELS:
        SAGEMAKER_TRANSCRIPTION_MODEL_ENV_AVAILABLE_WHISPER_MODELS,
      HF_AUTH_TOKEN: SAGEMAKER_TRANSCRIPTION_MODEL_ENV_HF_AUTH_TOKEN,
      LOG_LEVEL: LOG_LEVEL,
      ENVIRONMENT: NODE_ENV,
    },
    TransformInput: {
      // TransformInput
      DataSource: {
        // TransformDataSource
        S3DataSource: {
          // TransformS3DataSource
          S3DataType: 'S3Prefix',
          S3Uri: jsonInputFileUri, // required
        },
      },
      CompressionType: 'None',
      SplitType: 'None',
    },
    TransformOutput: {
      // TransformOutput
      S3OutputPath: `s3://${AWS_AUDIO_BUCKET_NAME}/${sagemakerOutputFilePrefix}/${documentId}`, // required
      AssembleWith: 'None',
    },
    TransformResources: {
      // TransformResources
      InstanceType: 'ml.g4dn.xlarge',
      InstanceCount: 1,
    },
  };
  return params;
};

const createTranscriptionJsonFile = (
  documentId: string,
  audioFileUrl: string,
  modelOptions: modelOptions
) => {
  let keyInfo = splitAudioTranscriptionBucketKey(audioFileUrl);
  const jsonFile: TranscriptionJsonFile = {
    bucketName: AWS_AUDIO_BUCKET_NAME,
    audioInputKey: audioFileUrl,
    fileExtension: keyInfo.fileType, // Not really used as this is also the file extension of the audio file
    speakerDiarizationOutputKey: `${speakerDiarizationFilePrefix}/${documentId}.json`,
    speechToTextOutputKey: `${speechToTextFilePrefix}/${documentId}.json`,
    modelOptions: modelOptions,
  };
  return jsonFile;
};

let isRunningDirectly = false;
if (isRunningDirectly) {
  await createTranscriptionJob('input', 'raw-audio/input.wav');
}
