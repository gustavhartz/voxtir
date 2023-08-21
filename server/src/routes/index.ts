import { Server } from '@hocuspocus/server';
import express, { Request } from 'express';
import expressWebsockets from 'express-ws';
import type WebSocket from 'ws';

import HocuspocusConfig from './hocuspocus.config.js';

// Configure Hocuspocus backend
const { app } = expressWebsockets(express());

const hocusPocusServer = Server.configure(HocuspocusConfig());

// Add a websocket route for hocuspocus
// Note: make sure to include a parameter for the document name.
// You can set any contextual data like in the onConnect hook
// and pass it to the handleConnection method.
app.ws('/document', (websocket: WebSocket, req: Request) => {
  hocusPocusServer.handleConnection(websocket, req);
});

app.get('/', (_request, response) => {
  response.send({ message: 'Hello World!' });
});

export default app;
