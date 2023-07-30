import { Database } from '@hocuspocus/extension-database';
import { Configuration } from '@hocuspocus/server';
import { v4 as uuidv4 } from 'uuid';

import prisma from '../prisma/index.js';
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
      console.log(data);
    },
    // Only works with the token specified from the frontend configuration. Do own logic before handler
    async onAuthenticate(data) {
      console.log('onAuthenticate');
      console.log(data);
    },
  };

  const database = new Database({
    // Return a Promise to retrieve data …
    fetch: async (d) => {
      console.log('fetch');
      const doc = await prisma.document.findFirst({
        where: {
          id: d.documentName,
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
      return prisma.document.upsert({
        create: {
          data: state,
          id: documentName,
          projectId: '1',
          audioFileUrl: '',
          transcriptionType: 'AUTOMATIC',
          title: 'Document 2',
        },
        update: {
          data: state,
        },
        where: {
          id: documentName,
        },
      });
    },
  });

  Serverconfigure.extensions.push(database);

  return Serverconfigure;
};
