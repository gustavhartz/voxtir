import pino from 'pino';
export type Logger = pino.Logger;

// Use pretty print for test environment
const prettyPrint =
  process.env.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      }
    : {};

function calculateLevel(): string {
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL;
  }
  if (process.env.NODE_ENV === 'test') {
    return 'error';
  }
  return 'info';
}

const level = calculateLevel();
export const logger = pino({
  base: null,
  ...prettyPrint,
  level: level,
  messageKey: 'message',
});

// Add a request id to the logger. Accepts anything with a requestId property, but intended for express requests.
export const requestLogger = (req: any) => {
  return logger.child({ requestId: req.requestId });
};

let runningDirectly = false;
if (runningDirectly) {
  logger.info('my test');
  logger.error('my error');
  logger.info({ obj: 'yes' });
  logger.info('info obj', { obj: 'yes' });
  logger.error('error obj', { obj: 'yes' });

  const reqLog = requestLogger({ requestId: '123-abc' });

  reqLog.error('error obj', { obj: 'yes' });
  reqLog.error({ obj: 'yes' });
  reqLog.info('info obj', { obj: 'yes' });
}
