import { v4 as uuidv4 } from 'uuid';

import { Logger, schedulerLogger } from '../services/logger.js';

export interface HandlerFunction {
  (executionId: string, executionLogger: Logger): Promise<void>;
}
export class ScheduledAsyncTask {
  private handler: HandlerFunction;
  private intervalTime: number;
  private isRunning = false;
  private runningUUID: string | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private taskName: string;
  logger: Logger;

  constructor(
    taskName: string,
    handler: (executionId: string, executionLogger: Logger) => Promise<void>,
    intervalTime: number
  ) {
    this.handler = handler;
    this.intervalTime = intervalTime;
    this.taskName = taskName;
    this.logger = schedulerLogger(taskName);
  }

  async start(): Promise<void> {
    if (this.intervalId) {
      this.logger.info(
        `Task: already running with intervalId: ${this.intervalId} `
      );
      return;
    }

    this.intervalId = setInterval(async () => {
      const executionId = uuidv4();
      await this.executeTask(executionId);
    }, this.intervalTime);

    this.logger.info(`Task ${this.taskName} started`);
  }

  private async executeTask(executionId: string): Promise<void> {
    if (this.isRunning) {
      //Use logger
      this.logger.info(
        `Task with id ${this.runningUUID} already running. Skipping ${executionId}`
      );
      return;
    }

    this.isRunning = true;
    this.runningUUID = executionId;

    try {
      this.logger.info(`starting handler for ${executionId}`);
      await this.handler(
        executionId,
        this.logger.child({ executionId: executionId })
      );
    } catch (error) {
      this.logger.error(`error in task execution for ${executionId}`, error);
    }
    this.logger.info(
      `Done executing handler for task ${executionId}. Freeing up job for new execution`
    );
    this.isRunning = false;
    this.runningUUID = '';
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.logger.info(
        `Scheduled task stopped.${this.taskName}-${this.intervalId}`
      );
      this.intervalId = null;
      return;
    }
    this.logger.warn(`Scheduled task not running`);
  }
}
