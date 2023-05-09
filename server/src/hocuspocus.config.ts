import prisma from './prisma/index.js';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '@hocuspocus/extension-database';
import { Configuration } from '@hocuspocus/server';
import { Doc } from 'yjs';
// Ripped from
// docs-plus :) https://github.com/docs-plus/
const { APP_NAME } = process.env;

export default (): Partial<Configuration> => {
  const Serverconfigure: Pick<Configuration, 'name' | 'extensions'> &
    Partial<Configuration> = {
    name: `${APP_NAME}_${uuidv4().slice(0, 4)}`,
    extensions: [],
    async onConnect(data) {
      console.log('onConnect');
    },
    // Only works with the token specified from the frontend configuration. Do own logic before handler
    async onAuthenticate(data) {
      console.log('onAuthenticate');
      return {
        user: {
          id: 1234,
          name: 'John',
        },
      };
    },
  };

  const database = new Database({
    // Return a Promise to retrieve data …
    fetch: async ({ documentName }) => {
      console.log('fetch');
      const doc = await prisma.documents.findFirst({
        where: {
          documentId: documentName,
        },
      });
      // Return the document
      if (doc != null) {
        return doc.data;
      }
      // Return
      return null;
    },
    // … and a Promise to store data:
    store: async ({ documentName, state }) => {
      console.log('store');
      return prisma.documents.upsert({
        create: {
          data: state,
          documentId: documentName,
        },
        update: {
          data: state,
        },
        where: {
          documentId: documentName,
        },
      });
    },
  });

  Serverconfigure.extensions.push(database);

  return Serverconfigure;
};
