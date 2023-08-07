import aws from 'aws-sdk';
import { logger } from './logger.js';
import { AWS_REGION } from '../helpers/env.js';
// ENV

aws.config.update({
  region: AWS_REGION,
});

const sqs = new aws.SQS({ apiVersion: '2012-11-05' });

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
  requestParams?: aws.SQS.ReceiveMessageRequest
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
  return sqs.receiveMessage(params).promise();
};

export const deleteMessageFromSqsRecivedMessageResult = async (
  queueUrl: string,
  messageResult: aws.SQS.ReceiveMessageResult
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
  const params = {
    QueueUrl: queueUrl,
    ReceiptHandle: receiptHandle,
  };
  return sqs.deleteMessage(params).promise();
};

/**
 * A helper function that polls SQS and deletes all messages. Returns the messages from SQS
 * @param queueUrl
 * @param requestParams
 * @returns
 */
export const pollSqsAndDelete = async (
  queueUrl: string,
  requestParams?: aws.SQS.ReceiveMessageRequest
) => {
  const res = await pollSqs(queueUrl, requestParams);
  await deleteMessageFromSqsRecivedMessageResult(queueUrl, res);
  return res;
};
