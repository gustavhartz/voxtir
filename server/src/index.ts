console.log('Starting server...');
console.time('deps');
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import chalk from 'chalk';
import cookieParser from 'cookie-parser';
import session from 'cookie-session';
import cors from 'cors';
import express from 'express';
import expressWebsockets from 'express-ws';
import { graphqlUploadExpress } from 'graphql-upload-minimal';
import http from 'http';
import morgan from 'morgan';

import {
  APP_NAME,
  APP_PORT,
  COOKIE_SECRET,
  ENABLE_SCHEDULER_JOBS,
  NODE_ENV,
} from './common/env.js';
import { accessControl, requestId, userInfoSync } from './middleware.js';
import prisma from './prisma/index.js';
import { getGqlServer } from './routes/apollo.js';
import { app as routes } from './routes/index.js';
import { sqsPollAsyncTask } from './scheduler/index.js';
import { logger } from './services/logger.js';

console.timeEnd('deps');

console.time('startup');

async function main(): Promise<void> {
  if (ENABLE_SCHEDULER_JOBS === 'true') {
    logger.info('Scheduler jobs enabled');
    sqsPollAsyncTask.start();
  }

  // Setup the express server
  const { app } = expressWebsockets(express());

  // Logging setup and middleware
  // TODO: Move to separate file
  app.use(
    morgan(`${chalk.green(APP_NAME)} :method :url :status - :response-time ms`)
  );
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(requestId);
  app.use(cookieParser());
  app.use(
    session({
      secret: COOKIE_SECRET,
    })
  );

  app.use(accessControl);
  app.use(userInfoSync);
  app.use(cors<cors.CorsRequest>({
    origin: 'http://localhost:5173',
    credentials: true
  }));
  // Client facing routes
  app.use(routes);

  const httpServer = http.createServer(app);

  // Graphql setup
  const gqlServer = await getGqlServer(httpServer);
  app.use(
    '/graphql',
    graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 1 }),
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
