// Desc: This file contains all the environment variables used in the application and asserts that they are defined.

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
  COOKIE_SECRET,
  APP_NAME,
  APP_PORT,
  NODE_ENV,
  DATABASE_URL,
  SQS_TRANSCRIPTION_QUEUE_URL,
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
  COOKIE_SECRET: string;
  APP_NAME: string;
  APP_PORT: string;
  NODE_ENV: string;
  DATABASE_URL: string;
  SQS_TRANSCRIPTION_QUEUE_URL: string;
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
  !COOKIE_SECRET ||
  !APP_NAME ||
  !APP_PORT ||
  !NODE_ENV ||
  !DATABASE_URL ||
  !SQS_TRANSCRIPTION_QUEUE_URL
) {
  throw new Error('Missing env');
}
export const DEVELOPMENT_USER = process.env.DEVELOPMENT_USER || '';
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';