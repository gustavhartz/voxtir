import pino from 'pino';
import { LOG_LEVEL, NODE_ENV } from '../common/env.js';
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
  if (NODE_ENV === 'test') {
    return 'error';
  }
  return LOG_LEVEL;
}

const level = calculateLevel();
export const logger = pino({
  base: null,
  ...prettyPrint,
  level: level,
  messageKey: 'message',
  hooks: {
    logMethod(inputArgs, method, level) {
      if (inputArgs.length >= 2) {
        const arg1 = inputArgs.shift();
        const arg2 = inputArgs.shift();
        return method.apply(this, [arg2, arg1, ...inputArgs]);
      }
      return method.apply(this, inputArgs);
    },
  },
});

// Add a request id to the logger. Accepts anything with a requestId property, but intended for express requests.
export const requestLogger = (req: any) => {
  return logger.child({ requestId: req.requestId, logType: 'request' });
};
// For logging from the scheduler to identify it as such
export const schedulerLogger = (schedulerNamer: String) => {
  return logger.child({ logType: 'scheduler', schedulerNamer: schedulerNamer });
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
