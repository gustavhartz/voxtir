console.log('Starting server...');
console.time('deps');
import express from 'express';
import expressWebsockets from 'express-ws';
import { app as routes } from './routes/index.js';
import { expressMiddleware } from '@apollo/server/express4';
import morgan from 'morgan';
import chalk from 'chalk';
import bodyParser from 'body-parser';
import http from 'http';
import cors from 'cors';
import prisma from './prisma/index.js';
import { graphqlUploadExpress } from 'graphql-upload-minimal';
import { getGqlServer } from './routes/apollo.js';

console.timeEnd('deps');
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var { APP_PORT, NODE_ENV, APP_NAME } = process.env;
APP_NAME = APP_NAME || 'VOXTIR';

console.time('startup');

async function main() {
  // Setup the express server
  const { app } = expressWebsockets(express());

  // Logging setup and middleware
  // TODO: Move to separate file
  app.use(
    morgan(
      `${chalk.green(`[${APP_NAME}]`)} :method :url :status - :response-time ms`
    )
  );
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // ws and http routes
  app.use(routes);

  const httpServer = http.createServer(app);

  // Graphql setup
  const gqlServer = await getGqlServer(httpServer);
  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
    expressMiddleware(gqlServer, {
      context: async ({ req }) => ({ prisma: prisma }),
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
