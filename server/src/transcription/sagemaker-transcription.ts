import { CreateTransformJobCommandInput } from '@aws-sdk/client-sagemaker';
import { getShortDateFormat } from '../common/date.js';
import {
  AWS_AUDIO_BUCKET_NAME,
  SAGEMAKER_TRANSCRIPTION_MODEL_NAME,
  NODE_ENV,
} from '../common/env.js';
import { createBatchTransformJob } from '../services/aws-sagemaker.js';
import {
  speechToTextFilePrefix,
  speakerDiarizationFilePrefix,
  sagemakerJSONFilePrefix,
  sagemakerOutputFilePrefix,
  splitAudioTranscriptionBucketKey,
} from './common.js';
import { logger as coreLogger, Logger } from '../services/logger.js';
import { LanguageCodePairs } from './common.js';
import { v4 as uuidv4 } from 'uuid';
import { StorageHandler } from '../services/storageHandler.js';

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

export class SagemakerBatchTransformTranscription {
  StorageHandler: StorageHandler;
  documentId: string;
  audioFileUrl: string;
  modelOptions: modelOptions;
  logger: Logger;
  constructor(
    StorageHandler: StorageHandler,
    documentId: string,
    audioFileUrl: string,
    modelOptions: modelOptions,
    logger?: Logger
  ) {
    this.StorageHandler = StorageHandler;
    this.documentId = documentId;
    this.audioFileUrl = audioFileUrl;
    this.modelOptions = modelOptions;
    this.logger = logger || coreLogger;
  }
  prepareBatchTransformJobPayload = async () => {
    let key = this.getJsonFileKey();
    let jsonFile = this.createTranscriptionJsonFile();
    await this.StorageHandler.putObject(
      key,
      Buffer.from(JSON.stringify(jsonFile)),
      'application/json',
      true
    );
    return this.createTranscriptionJobPayload();
  };
  getJsonFileKey = () => {
    return `${sagemakerJSONFilePrefix}/${this.documentId}.json`;
  };
  getJsonInputFileUri = () => {
    return `s3://${AWS_AUDIO_BUCKET_NAME}/${this.getJsonFileKey()}`;
  };

  createTranscriptionJsonFile = () => {
    let keyInfo = splitAudioTranscriptionBucketKey(this.audioFileUrl);
    const jsonFile: TranscriptionJsonFile = {
      bucketName: AWS_AUDIO_BUCKET_NAME,
      audioInputKey: this.audioFileUrl,
      fileExtension: keyInfo.fileType, // Not really used as this is also the file extension of the audio file
      speakerDiarizationOutputKey: `${speakerDiarizationFilePrefix}/${this.documentId}.json`,
      speechToTextOutputKey: `${speechToTextFilePrefix}/${this.documentId}.json`,
      modelOptions: this.modelOptions,
    };
    return jsonFile;
  };
  triggerBatchTransformJob = async () => {
    let payload = await this.prepareBatchTransformJobPayload();
    try {
      await createBatchTransformJob(payload);
    } catch (e) {
      this.logger.error(`Error creating transcription job: ${e}`);
    }
  };

  createTranscriptionJobPayload = (): CreateTransformJobCommandInput => {
    return {
      // CreateTransformJobRequest
      TransformJobName: `${this.documentId}-${getShortDateFormat(
        new Date()
      )}-${uuidv4().substring(0, 4)}`, // required
      ModelName: SAGEMAKER_TRANSCRIPTION_MODEL_NAME, // required
      MaxConcurrentTransforms: 1,
      BatchStrategy: 'SingleRecord',
      TransformInput: {
        // TransformInput
        DataSource: {
          // TransformDataSource
          S3DataSource: {
            // TransformS3DataSource
            S3DataType: 'S3Prefix',
            S3Uri: this.getJsonInputFileUri(), // required
          },
        },
        ContentType: 'application/json',
        CompressionType: 'None',
        SplitType: 'None',
      },
      TransformOutput: {
        // TransformOutput
        S3OutputPath: `s3://${AWS_AUDIO_BUCKET_NAME}/${sagemakerOutputFilePrefix}/${this.documentId}`, // required
        AssembleWith: 'None',
      },
      TransformResources: {
        // TransformResources
        InstanceType: 'ml.g4dn.xlarge',
        InstanceCount: 1,
      },
      Tags: [
        // TagList
        {
          // Tag
          Key: 'enviroment',
          Value: NODE_ENV,
        },
      ],
    };
  };
}
