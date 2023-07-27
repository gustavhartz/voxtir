console.log('Starting server...');
console.time('deps');
import { expressMiddleware } from '@apollo/server/express4';
import bodyParser from 'body-parser';
import chalk from 'chalk';
import cors from 'cors';
import express from 'express';
import expressWebsockets from 'express-ws';
import { graphqlUploadExpress } from 'graphql-upload-minimal';
import http from 'http';
import morgan from 'morgan';
import { accessControl, requestId, userInfoSync } from './middleware.js';
import session from 'cookie-session';
import cookieParser from 'cookie-parser';

import prisma from './prisma/index.js';
import { getGqlServer } from './routes/apollo.js';
import { app as routes } from './routes/index.js';

console.timeEnd('deps');
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const { APP_PORT, NODE_ENV, APP_NAME, COOKIE_SECRET } = process.env;

console.time('startup');

async function main(): Promise<void> {
  if (!APP_PORT || !APP_NAME || !COOKIE_SECRET || !NODE_ENV) {
    throw new Error('Missing env - not defined');
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

  // Client facing routes
  app.use(routes);

  const httpServer = http.createServer(app);

  // Graphql setup
  const gqlServer = await getGqlServer(httpServer);
  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
    expressMiddleware(gqlServer, {
      context: async () => ({ prisma: prisma }),
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
  });
}

await main();
