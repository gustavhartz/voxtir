import aws from 'aws-sdk';
import { FileAlreadyExistsError } from '../types/customErrors';
// ENV
const AWS_REGION = process.env.AWS_REGION;

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
      throw new FileAlreadyExistsError(`File already exists at ${key}`);
    } catch (err: any) {
      if (!(err instanceof FileAlreadyExistsError)) {
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
