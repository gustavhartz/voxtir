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
  FRONTEND_BASE_URL,
  NODE_ENV,
} from './common/env.js';
import { requestId, userInfoSync } from './middleware.js';
import prisma from './prisma/index.js';
import { getGqlServer } from './routes/graphql/index.js';
import wsRoutes from './routes/websocket/index.js';
import { sqsPollAsyncTask } from './scheduler/index.js';
import { auth0Middleware } from './services/auth0.js';
import { logger } from './services/logger.js';

console.timeEnd('deps');

console.time('startup');

async function main(): Promise<void> {
  if (ENABLE_SCHEDULER_JOBS === 'true') {
    logger.info('Scheduler jobs enabled');
    sqsPollAsyncTask.start();
  }

  const expressApp = express();
  const httpServer = http.createServer(expressApp);
  const app = expressWebsockets(expressApp, httpServer).app;

  // Common Middelware
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

  const corsOptions: { [key: string]: cors.CorsOptions } = {
    development: {
      origin: '*', // Allow all origins (not recommended for production)
      credentials: true,
      preflightContinue: true,
    },
    production: {
      // Add your production frontend URL here
      // Example: 'https://yourapp.com'
      origin: FRONTEND_BASE_URL,
      credentials: true,
      preflightContinue: true,
    },
  };

  // Set up CORS middleware based on NODE_ENV
  app.use(cors(corsOptions[process.env.NODE_ENV || 'development']));

  // allow pre-flight requests
  app.options('*', cors());

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

  // Socket related routes
  app.use(wsRoutes);
  app.use(auth0Middleware);
  app.use(userInfoSync);

  const gqlServer = await getGqlServer(httpServer);
  expressApp.use(
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
