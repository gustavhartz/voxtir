import { Prisma, taskType } from '@prisma/client';

import prisma from '../prisma/index.js';
import { logger } from '../services/logger.js';
import { Logger } from '../services/logger.js';
import { HandlerFunction } from './scheduler.js';

export const acquireTaskLock = async (task: taskType): Promise<boolean> => {
  try {
    await prisma.task.update({
      where: { type: task, isLocked: false },
      data: { isLocked: true },
    });
    logger.debug(`Acquired lock on ${task}`);
    return true;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2025') {
        logger.debug(`Task ${task} is already locked by another process`);
        return false;
      }
    }
    logger.error(
      `Unexpected prisma error when attempting to acquire lock on ${task}`,
      e
    );
    return false;
  }
};

export function taskLockWrapper(
  task: taskType,
  handlerFunction: HandlerFunction,
  lockOnFailure = true
): HandlerFunction {
  // Wrap in handler function
  return async function (
    executionId: string,
    executionLogger: Logger
  ): Promise<void> {
    executionLogger.info(`Starting transcription job`);
    const obtainedLock = await acquireTaskLock(task);
    if (!obtainedLock) {
      executionLogger.info(
        `Did not obtain lock for transcription job task. Exiting`
      );
      return;
    }
    try {
      executionLogger.info(
        `Obtained lock for transcription job task. Starting execution`
      );

      await handlerFunction(executionId, executionLogger);

      executionLogger.info(`Successfully executed task ${task}`);

      await prisma.task.update({
        where: { type: task },
        data: { lastSuccessAt: new Date(), isLocked: false },
      });
    } catch (e) {
      executionLogger.error(`Error executing task ${task}`, e);

      await prisma.task.update({
        where: { type: task },
        data: {
          isLocked: lockOnFailure ? true : false,
          errorMessages: JSON.stringify(e),
        },
      });
    }
  };
}
