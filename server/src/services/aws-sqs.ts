import { logger } from './logger.js';
import { AWS_REGION } from '../common/env.js';
import {
  SQSClient,
  DeleteMessageCommand,
  ReceiveMessageCommand,
  ReceiveMessageRequest,
  ReceiveMessageResult,
} from '@aws-sdk/client-sqs'; // ES Modules import

const client = new SQSClient({ region: AWS_REGION });

/**
 * Poll SQS. Returns the promise from SQS. Basic params
 {
    AttributeNames: ['All'],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: ['All'],
    QueueUrl: queueUrl,
    VisibilityTimeout: 100,
    WaitTimeSeconds: 0,
  };
 * @param queueUrl 
 * @param requestParams 
 * @returns 
 */
export const pollSqs = async (
  queueUrl: string,
  requestParams?: ReceiveMessageRequest
) => {
  const params = {
    AttributeNames: ['All'],
    MaxNumberOfMessages: 1,
    MessageAttributeNames: ['All'],
    QueueUrl: queueUrl,
    VisibilityTimeout: 100,
    WaitTimeSeconds: 0,
    ...requestParams,
  };
  const command = new ReceiveMessageCommand(params);
  return await client.send(command);
};

export const deleteMessageFromSqsRecivedMessageResult = async (
  queueUrl: string,
  messageResult: ReceiveMessageResult
) => {
  if (messageResult.Messages && messageResult.Messages.length > 0) {
    // delete all messages
    const deletePromises = messageResult.Messages.map((message) =>
      deleteMessageFromSqsReciptHandle(
        queueUrl,
        message.ReceiptHandle as string
      )
    );
    await Promise.all(deletePromises);
    logger.debug(
      `deleted ${messageResult.Messages?.length} messages from SQS ${queueUrl}`
    );
  }
};

/**
 * Poll SQS and delete a message. Returns the promise from SQS
 * @param queueUrl
 * @param receiptHandle
 * @returns
 */
export const deleteMessageFromSqsReciptHandle = async (
  queueUrl: string,
  receiptHandle: string
) => {
  const input = {
    // DeleteMessageRequest
    QueueUrl: queueUrl, // required
    ReceiptHandle: receiptHandle, // required
  };
  const command = new DeleteMessageCommand(input);
  await client.send(command);
};

/**
 * A helper function that polls SQS and deletes all messages. Returns the messages from SQS
 * @param queueUrl
 * @param requestParams
 * @returns
 */
export const pollSqsAndDelete = async (
  queueUrl: string,
  requestParams?: ReceiveMessageRequest
) => {
  const res = await pollSqs(queueUrl, requestParams);
  await deleteMessageFromSqsRecivedMessageResult(queueUrl, res);
  return res;
};
