console.log('Starting server...');
console.time('deps');
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import chalk from 'chalk';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import expressWebsockets from 'express-ws';
import { graphqlUploadExpress } from 'graphql-upload-minimal';
import http from 'http';
import morgan from 'morgan';
import { serializeError } from 'serialize-error';

import {
  APP_NAME,
  APP_PORT,
  ENABLE_SCHEDULER_JOBS,
  FRONTEND_BASE_URL,
  NODE_ENV,
} from './common/env.js';
import { requestId, userInfoSync } from './middleware.js';
import prisma from './prisma/index.js';
import { getGqlServer } from './routes/graphql/index.js';
import wsRoutes from './routes/websocket/index.js';
import { audioPreProcessingJob, transcriptionJob } from './scheduler/index.js';
import { auth0Middleware } from './services/auth0.js';
import { logger } from './services/logger.js';

console.timeEnd('deps');

console.time('startup');

// Worst case capture
process.on('unhandledRejection', (reason, promise) => {
  logger.fatal('unhandledRejection', {
    promise: serializeError(promise),
    reason: serializeError(reason),
  });
});
process.on('uncaughtExceptionMonitor', (err, origin) => {
  logger.fatal('uncaughtExceptionMonitor', {
    err: serializeError(err),
    origin: serializeError(origin),
  });
});

async function main(): Promise<void> {
  if (ENABLE_SCHEDULER_JOBS === 'true') {
    logger.info('Scheduler jobs enabled');
    transcriptionJob.start();
    audioPreProcessingJob.start();
  }

  const expressApp = express();
  const httpServer = http.createServer(expressApp);
  const app = expressWebsockets(expressApp, httpServer).app;

  // Common Middleware
  app.use(
    morgan(`${chalk.green(APP_NAME)} :method :url :status - :response-time ms`)
  );
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(requestId);

  const corsOptions: cors.CorsOptions = {
    origin: FRONTEND_BASE_URL,
    credentials: false,
    preflightContinue: false,
  };

  // Set up CORS middleware based on NODE_ENV
  app.use(cors(corsOptions));

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

  // Socket related routes
  app.use(wsRoutes);
  app.use(auth0Middleware);
  app.use(userInfoSync);

  // Error capture
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err.name === 'UnauthorizedError') {
      // Set an appropriate status code and send the error as JSON
      res.status(401).json({
        reason: err.message,
        message: 'No valid Auth0 token provided in header',
        // Include any additional properties you want to expose
      });
    }
  });

  const fileUploadSizeLimit = 2000 * 10 ** 6; // 2GB
  const gqlServer = await getGqlServer(httpServer);
  expressApp.use(
    '/graphql',
    graphqlUploadExpress({ maxFileSize: fileUploadSizeLimit, maxFiles: 1 }), // since it's a stream this is not noticed until s3 upload
    expressMiddleware(gqlServer, {
      context: async ({ req }) => ({
        prisma: prisma,
        req: req,
        userId: req.auth?.payload.sub as string,
      }),
    })
  );

  httpServer.listen({ port: APP_PORT }, () => {
    console.info(`
        Server "${chalk.magentaBright(
          'APP_NAME'
        )}" started. Port: ${chalk.blue.bold(
      APP_PORT
    )} , NODE_ENV: ${chalk.blue.bold(NODE_ENV)}
        Open Project: ${chalk.bold.underline.yellow(
          `http://localhost:${APP_PORT}`
        )} (ctrl+click)
      `);
    console.timeEnd('startup');
  });
}

await main();
