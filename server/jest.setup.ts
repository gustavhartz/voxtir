process.env.DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5433/core?schema=public';
process.env.NODE_ENV = 'development';
process.env.APP_PORT = '8080';
process.env.APP_NAME = 'Voxtir';
process.env.PROJECT_SHARING_EXPIRATION_TIME = '604800';
process.env.JWT_SECRET = 'test';
process.env.RESEND_API_KEY = 'test';
process.env.FRONTEND_BASE_URL = 'http://localhost:5173';
process.env.RESEND_DOMAIN = 'staging.voxtir.com';
process.env.AWS_TRANSCRIPTION_REGION = 'eu-west-3';
process.env.AWS_REGION = 'eu-north-1';
process.env.AWS_AUDIO_BUCKET_NAME = 'voxtir-audiofiles-staging';
process.env.AUTH0_DOMAIN = 'test';
process.env.AUTH0_CLIENT_ID = 'test';
process.env.AUTH0_CLIENT_SECRET = 'test';
process.env.LOG_LEVEL = 'debug';
process.env.SQS_TRANSCRIPTION_QUEUE_URL = 'test';
process.env.SAGEMAKER_TRANSCRIPTION_MODEL_NAME =
  'voxtir-transcription-model-staging';
process.env.ENABLE_SCHEDULER_JOBS = 'false';
process.env.AUDIO_PROCESSOR_LAMBDA_NAME = 'audio-processor-staging';
