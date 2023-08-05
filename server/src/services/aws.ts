import aws from 'aws-sdk';
import { logger } from './logger.js';
import { FileAlreadyExistsError } from '../types/customErrors.js';
import { AWS_REGION } from '../helpers/env.js';
// ENV

aws.config.update({
  region: AWS_REGION,
});

const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const sqs = new aws.SQS({ apiVersion: '2012-11-05' });

export const uploadObject = async (
  bucket: string,
  key: string,
  body: Buffer,
  contentType: string,
  overwrite: boolean = false
): Promise<aws.S3.ManagedUpload.SendData> => {
  const uploadParams = {
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  };
  if (!overwrite) {
    try {
      await s3.headObject({ Bucket: bucket, Key: key }).promise();
      throw new FileAlreadyExistsError(`File ${key} already exists`);
    } catch (err: any) {
      if (err.statusCode === 404 || err.code === 'NotFound') {
        logger.info(`File ${key} not found, uploading`);
      } else if (err.status === 409) {
        logger.info(`file ${key} already exists, skipping upload`);
        throw new FileAlreadyExistsError(`File ${key} already exists`);
      } else {
        logger.error(`Unexpected error in S3 checking if file exists`);
        throw err;
      }
    }
  }
  return s3.upload(uploadParams).promise();
};

// Generate a pre-signed URL for a file
export const generatePresignedUrlForObject = async (
  bucket: string,
  key: string,
  expiration: number
): Promise<string> => {
  const params = {
    Bucket: bucket,
    Key: key,
    Expires: expiration,
  };
  return s3.getSignedUrlPromise('getObject', params);
};

export const loadObject = async (bucket: string, key: string) => {
  const params = {
    Bucket: bucket,
    Key: key,
  };
  return s3.getObject(params).promise();
};
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

/**
 * Poll SQS and delete a message. Returns the promise from SQS
 * @param queueUrl
 * @param receiptHandle
 * @returns
 */
export const deleteMessageFromSqs = async (
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
  if (res.Messages && res.Messages.length > 0) {
    // delete all messages
    const deletePromises = res.Messages.map((message) =>
      deleteMessageFromSqs(queueUrl, message.ReceiptHandle as string)
    );
    await Promise.all(deletePromises);
    logger.debug(
      `deleted ${res.Messages?.length} messages from SQS ${queueUrl}`
    );
  }
  return res;
};
