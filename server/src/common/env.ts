// Desc: This file contains all the environment variables used in the application and asserts that they are defined.

// For development, we can use the dotenv package to load the environment variables from the .env file.
import dotenv from 'dotenv';
dotenv.config();

export const {
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  AWS_AUDIO_BUCKET_NAME,
  AWS_REGION,
  RESEND_DOMAIN,
  FRONTEND_BASE_URL,
  RESEND_API_KEY,
  JWT_SECRET,
  PROJECT_SHARING_EXPIRATION_TIME,
  APP_NAME,
  APP_PORT,
  NODE_ENV,
  DATABASE_URL,
  SQS_TRANSCRIPTION_QUEUE_URL,
  SAGEMAKER_TRANSCRIPTION_MODEL_NAME,
  ENABLE_SCHEDULER_JOBS,
  AUTH0_DOMAIN,
} = process.env as {
  AUTH0_CLIENT_ID: string;
  AUTH0_CLIENT_SECRET: string;
  AWS_AUDIO_BUCKET_NAME: string;
  AWS_REGION: string;
  RESEND_DOMAIN: string;
  FRONTEND_BASE_URL: string;
  RESEND_API_KEY: string;
  JWT_SECRET: string;
  PROJECT_SHARING_EXPIRATION_TIME: string;
  APP_NAME: string;
  APP_PORT: string;
  NODE_ENV: string;
  DATABASE_URL: string;
  SQS_TRANSCRIPTION_QUEUE_URL: string;
  SAGEMAKER_TRANSCRIPTION_MODEL_NAME: string;
  ENABLE_SCHEDULER_JOBS: string;
  AUTH0_DOMAIN: string;
};
// Assert defined
if (
  !AUTH0_CLIENT_ID ||
  !AUTH0_CLIENT_SECRET ||
  !AWS_AUDIO_BUCKET_NAME ||
  !AWS_REGION ||
  !RESEND_DOMAIN ||
  !FRONTEND_BASE_URL ||
  !RESEND_API_KEY ||
  !JWT_SECRET ||
  !PROJECT_SHARING_EXPIRATION_TIME ||
  !APP_NAME ||
  !APP_PORT ||
  !NODE_ENV ||
  !DATABASE_URL ||
  !SQS_TRANSCRIPTION_QUEUE_URL ||
  !SAGEMAKER_TRANSCRIPTION_MODEL_NAME ||
  !AUTH0_DOMAIN
) {
  throw new Error('Missing env');
}
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
