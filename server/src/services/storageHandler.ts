import {
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

import { AWS_REGION } from '../common/env.js';
import { FileAlreadyExistsError } from '../types/customErrors.js';
import { logger } from './logger.js';

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
}

export class S3StorageHandler extends StorageHandler {
  private s3: S3Client;
  private bucket: string;

  constructor(bucket: string) {
    super();
    this.s3 = new S3Client({ apiVersion: '2006-03-01', region: AWS_REGION });
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

  async generatePresignedUrlForObject(
    key: string,
    expiration: number
  ): Promise<string> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });

    const response = await getSignedUrl(this.s3, command, {
      expiresIn: expiration,
    });
    return response;
  }
}

export class MemoryStorageHandler extends StorageHandler {
  private storage: Map<string, PutObjectCommandInput['Body']>;

  constructor() {
    super();
    this.storage = new Map();
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
        this.storage.get(key);
        logger.info(`Object ${key} already exists, skipping upload`);
        throw new FileAlreadyExistsError(`File ${key} already exists`);
      } catch (e) {
        // Object does not exist, continue
      }
    }
    this.storage.set(key, object);
  }

  async getObject(key: string): Promise<Uint8Array | undefined> {
    return convertToByteArray(this.storage.get(key));
  }
}

async function convertToByteArray(
  input: PutObjectCommandInput['Body']
): Promise<Uint8Array> {
  if (typeof input === 'string') {
    return new TextEncoder().encode(input);
  } else if (input instanceof Uint8Array) {
    return input;
  } else if (Buffer.isBuffer(input)) {
    return new Uint8Array(input);
  } else if (input instanceof Readable) {
    logger.info(
      'Converting stream to byte array is not supported in memory storage handler'
    );
    throw new Error('Unsupported input type');
  } else {
    throw new Error('Unsupported input type');
  }
}
