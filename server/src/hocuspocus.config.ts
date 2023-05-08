import { prisma } from './prisma/index';
import { v4 as uuidv4 } from 'uuid';
import { Database } from '@hocuspocus/extension-database';
import { Configuration } from '@hocuspocus/server';

// Ripped from
// docs-plus :) https://github.com/docs-plus/
const { APP_NAME } = process.env;

export default (): Partial<Configuration> => {
  const Serverconfigure: Pick<Configuration, 'name' | 'extensions'> &
    Partial<Configuration> = {
    name: `${APP_NAME}_${uuidv4().slice(0, 4)}`,
    extensions: [],
  };

  const database = new Database({
    // Return a Promise to retrieve data …
    fetch: async ({ documentName }) => {
      const doc = await prisma.documents
        .findFirst({
          where: {
            documentId: documentName,
          },
        })
        .catch(async (err) => {
          console.log('error', err);
          // process.exit(1)
        });
      if (doc == null) {
        return new Uint8Array();
      }

      return doc.data;
    },
    // … and a Promise to store data:
    store: async ({ documentName, state }) => {
      return prisma.documents
        .upsert({
          where: {
            documentId: documentName,
          },
          create: {
            documentId: documentName,
            data: state,
          },
          update: {
            data: state,
          },
        })
        .catch(async (_err) => {
          console.log('error', _err);
          // process.exit(1)
        });
    },
  });

  Serverconfigure.extensions.push(database);

  return Serverconfigure;
};
