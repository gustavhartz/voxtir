import {
  InvokeCommand,
  InvokeCommandInput,
  LambdaClient,
} from '@aws-sdk/client-lambda'; // ES Modules import

import { AUDIO_PROCESSOR_LAMBDA_NAME, AWS_REGION } from '../common/env.js';
import { logger } from './logger.js';

const client = new LambdaClient({
  region: AWS_REGION,
});
const asciiDecoder = new TextDecoder('ascii');

export interface AudioProcessorResponse {
  statusCode: number;
  body: {
    original_file_length: number;
    processed_file_length: number;
  };
}

interface AudioProcessorInput {
  input_file_bucket: string;
  input_file_key: string;
  input_file_format: string;
  output_file_bucket: string;
  output_file_key: string;
  output_file_format: string;
}

export const invokeAudioProcessor = async (
  processingConfig: AudioProcessorInput
): Promise<AudioProcessorResponse> => {
  logger.debug('invokeAudioProcessor', processingConfig);
  const input: InvokeCommandInput = {
    FunctionName: AUDIO_PROCESSOR_LAMBDA_NAME,
    InvocationType: 'RequestResponse',
    Payload: JSON.stringify(processingConfig),
  };
  const command = new InvokeCommand(input);
  const res = await client.send(command);
  logger.debug('invokeAudioProcessor response', res.$metadata);
  const data = asciiDecoder.decode(res.Payload);
  const audioProcessorResponse = JSON.parse(data) as AudioProcessorResponse;
  return audioProcessorResponse;
};

const isRunningDirectly = false;
if (isRunningDirectly) {
  const res = await invokeAudioProcessor({
    input_file_bucket: 'voxtir-audiofiles-staging',
    input_file_key: 'raw-audio/6579c92d-f962-4c29-987c-42f17525396a.mp3',
    input_file_format: 'mp3',
    output_file_bucket: 'voxtir-audiofiles-staging',
    output_file_key: 'raw-audio/test-lambda.mp3',
    output_file_format: 'mp3',
  });
  console.log(res);
}
