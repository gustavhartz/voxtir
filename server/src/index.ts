console.log('Starting server...');
console.time('deps');
import express, { Request, Response } from 'express';
import expressWebsockets from 'express-ws';
import { Configuration, Server } from '@hocuspocus/server';
import HocuspocusConfig from './hocuspocus.config';
import morgan from 'morgan';
import chalk from 'chalk';
import WebSocket from 'ws';
import bodyParser from 'body-parser';

console.timeEnd('deps');
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const { APP_PORT, NODE_ENV } = process.env;

console.time('startup');
// Configure Hocuspocus backend
const server = Server.configure(HocuspocusConfig as Partial<Configuration>);

// Setup the express server
const { app } = expressWebsockets(express());

// Logging setup and middleware
// TODO: Move to separate file
app.use(
  morgan(
    `${chalk.green(
      `[${HocuspocusConfig.name}]`
    )} :method :url :status - :response-time ms`
  )
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Add API routes
app.get('/', (_request, response) => {
  response.send({ message: 'Hello World!' });
});

// ws routes

// Add a websocket route for hocuspocus
// Note: make sure to include a parameter for the document name.
// You can set any contextual data like in the onConnect hook
// and pass it to the handleConnection method.
app.ws('/collaboration/:documentId', (websocket: WebSocket, req: Request) => {
  const context = {
    params: req.query,
    documentId: req.params.documentId,
    user: {
      id: 1234,
      name: 'Jane',
    },
  };

  console.log({ context, params: req.params });

  server.handleConnection(websocket, req, context);
});

app.listen(APP_PORT, () => {
  console.info(`
      Server "${chalk.magentaBright(
        HocuspocusConfig.name
      )}" started. Port: ${chalk.blue.bold(
    APP_PORT
  )} , NODE_ENV: ${chalk.blue.bold(NODE_ENV)}
      Open Project: ${chalk.bold.underline.yellow(
        `http://localhost:${APP_PORT}`
      )} (ctrl+click)
    `);
});
