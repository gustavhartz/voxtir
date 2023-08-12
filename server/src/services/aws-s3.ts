import aws from 'aws-sdk';
import { logger } from './logger.js';
import { FileAlreadyExistsError } from '../types/customErrors.js';
import { AWS_REGION } from '../common/env.js';
// ENV

aws.config.update({
  region: AWS_REGION,
});

const s3 = new aws.S3({ apiVersion: '2006-03-01' });

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
