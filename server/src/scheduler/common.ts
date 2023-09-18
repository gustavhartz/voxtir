import { Prisma, taskType } from '@prisma/client';

import prisma from '../prisma/index.js';
import { logger } from '../services/logger.js';

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
      }
    }
    logger.error(
      `Unexpected prisma error when attempting to acquire lock on ${task}`,
      e
    );
    return false;
  }
};
