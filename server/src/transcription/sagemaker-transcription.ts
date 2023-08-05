import { CreateTransformJobCommandInput } from '@aws-sdk/client-sagemaker';
import { v4 as uuidv4 } from 'uuid';
import {
  AWS_AUDIO_BUCKET_NAME,
  SAGEMAKER_TRANSCRIPTION_MODEL_NAME,
} from '../helpers/env.js';
import { uploadObject } from '../services/aws.js';
import { createBatchTransformJob } from '../services/aws-sagemaker.js';
import {
  speechToTextFilePrefix,
  speakerDiarizationFilePrefix,
  sagemakerJSONFilePrefix,
  sagemakerOutputFilePrefix,
} from './index.js';
import { logger } from '../services/logger.js';

const createTranscriptionJobPayload = (
  jsonInputFileUri: string,
  documentId: string
): CreateTransformJobCommandInput => {
  const params = {
    // CreateTransformJobRequest
    TransformJobName: `${documentId}-${uuidv4()}`, // required
    ModelName: SAGEMAKER_TRANSCRIPTION_MODEL_NAME, // required
    Environment: {
      // TransformEnvironmentMap
      env1: 'STRING_VALUE',
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

export interface modelOptions {
  model: string;
  language?: string;
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

interface TranscriptionJsonFile {
  bucketName: string;
  audioInputKey: string;
  speakerDiarizationOutputKey: string;
  speechToTextOutputKey: string;
  modelOptions: modelOptions;
}

const createTranscriptionJsonFile = (
  documentId: string,
  audioFileUrl: string,
  modelOptions: modelOptions
) => {
  const jsonFile: TranscriptionJsonFile = {
    bucketName: AWS_AUDIO_BUCKET_NAME,
    audioInputKey: audioFileUrl,
    speakerDiarizationOutputKey: `${speakerDiarizationFilePrefix}/${documentId}`,
    speechToTextOutputKey: `${speechToTextFilePrefix}/${documentId}`,
    modelOptions: modelOptions,
  };
  return jsonFile;
};

let isRunningDirectly = false;
if (isRunningDirectly) {
  await createTranscriptionJob('input', 'raw-audio/input.wav');
}
