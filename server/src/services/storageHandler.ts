import {
  GetObjectCommand,
  HeadObjectCommand,
  HeadObjectCommandOutput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { AWS_REGION } from '../common/env.js';
import { FileAlreadyExistsError } from '../types/customErrors.js';
import { logger } from './logger.js';

export interface PresignedUrl {
  url: string;
  key: string;
  expiration: Date;
}

/**
 * Generic storage handler class
 *
 * @abstract
 * @param {string} key
 * @param {PutObjectCommandInput['Body']} object
 * @return {*}  {Promise<void>}
 * @memberof StorageHandler
 */
export abstract class StorageHandler {
  abstract putObject(
    key: string,
    object: PutObjectCommandInput['Body'],
    contentType: string,
    contentLength?: number,
    overwrite?: boolean
  ): Promise<void>;
  abstract getObject(key: string): Promise<Uint8Array | undefined>;
  abstract generatePresignedUrlForGetObject(
    key: string,
    expiration: number
  ): Promise<string>;
}

export class S3StorageHandler extends StorageHandler {
  private s3: S3Client;
  private bucket: string;

  constructor(bucket: string) {
    super();
    this.s3 = new S3Client({
      apiVersion: '2006-03-01',
      region: AWS_REGION,
    });
    this.bucket = bucket;
  }

  async putObject(
    key: string,
    object: PutObjectCommandInput['Body'],
    contentType: string,
    contentLength?: number,
    overwrite?: boolean
  ): Promise<void> {
    if (!overwrite) {
      try {
        await this.getObject(key);
        logger.info(`Object ${key} already exists, skipping upload`);
        throw new FileAlreadyExistsError(`File ${key} already exists`);
      } catch (e) {
        // Object does not exist, continue
      }
    }
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: object,
      ContentType: contentType,
      ContentLength: contentLength,
    });
    await this.s3.send(command);
  }

  async getObject(key: string): Promise<Uint8Array | undefined> {
    const params = {
      Bucket: this.bucket,
      Key: key,
    };
    const command = new GetObjectCommand(params);
    const response = await this.s3.send(command);
    return response.Body?.transformToByteArray();
  }

  async headObject(key: string): Promise<HeadObjectCommandOutput> {
    const params = {
      Bucket: this.bucket,
      Key: key,
    };
    const command = new HeadObjectCommand(params);
    return await this.s3.send(command);
  }

  async generatePresignedUrlForGetObject(
    key: string,
    expiration: number
  ): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });

    const response = await getSignedUrl(this.s3, command, {
      expiresIn: expiration,
    });
    return response;
  }

  async generatePresignedUrlForPutObject(
    key: string,
    expiration: number
  ): Promise<PresignedUrl> {
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: key });

    const response = await getSignedUrl(this.s3, command, {
      expiresIn: expiration,
    });
    return {
      url: response,
      key,
      expiration: new Date(Date.now() + expiration * 1000),
    };
  }
}

const isRunningDirectly = false;
if (isRunningDirectly) {
  const s3 = new S3StorageHandler('voxtir-audiofiles-staging');
  const presigned = await s3.generatePresignedUrlForPutObject('test', 60 * 5);
  console.log(presigned);
  const res = await s3.headObject(presigned.key);
  console.log(res);
}
