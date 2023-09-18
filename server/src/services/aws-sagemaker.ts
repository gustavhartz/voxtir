import {
  CreateTransformJobCommand,
  CreateTransformJobCommandInput,
  ListTransformJobsCommand,
  ListTransformJobsCommandInput,
  ListTransformJobsCommandOutput,
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

export const listBatchTransformJobs = async (
  params: ListTransformJobsCommandInput
): Promise<ListTransformJobsCommandOutput> => {
  logger.info(`Listing transcription jobs`);
  const command = new ListTransformJobsCommand(params);
  let response = await client.send(command);
  while (response.NextToken) {
    logger.debug(`Fetching next page of sagemaker jobs`);
    const nextCommand = new ListTransformJobsCommand({
      ...params,
      NextToken: response.NextToken,
    });
    const nextResponse = await client.send(nextCommand);
    response = {
      ...nextResponse,
      TransformJobSummaries: [
        ...(response.TransformJobSummaries ?? []),
        ...(nextResponse.TransformJobSummaries ?? []),
      ],
    };
  }
  return response;
};
