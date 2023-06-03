import { Server } from '@hocuspocus/server';
import express, { Request } from 'express';
import expressWebsockets from 'express-ws';
import type WebSocket from 'ws';

import HocuspocusConfig from './hocuspocus.config.js';

// Configure Hocuspocus backend
export const { app } = expressWebsockets(express());

const hocusPocusServer = Server.configure(HocuspocusConfig());

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
  console.log(' endpoint hit');

  hocusPocusServer.handleConnection(websocket, req, context);
});

app.get('/', (_request, response) => {
  response.send({ message: 'Hello World!' });
});
