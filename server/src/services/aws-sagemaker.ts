import {
  CreateTransformJobCommand,
  CreateTransformJobCommandInput,
  SageMakerClient,
} from '@aws-sdk/client-sagemaker';

import { AWS_REGION } from '../common/env.js';
import { logger } from './logger.js';

const client = new SageMakerClient({ region: AWS_REGION });

export const createBatchTransformJob = (
  params: CreateTransformJobCommandInput
) => {
  logger.info(`Creating transcription job ${params.TransformJobName}`);
  const command = new CreateTransformJobCommand(params);
  return client.send(command);
};
