import { Database } from '@hocuspocus/extension-database';
import { Configuration } from '@hocuspocus/server';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../services/logger.js';

// Ripped from
// docs-plus :) https://github.com/docs-plus/
import { APP_NAME } from '../common/env.js';
import prisma from '../prisma/index.js';

export default (): Partial<Configuration> => {
  const Serverconfigure: Pick<Configuration, 'name' | 'extensions'> &
    Partial<Configuration> = {
    name: `${APP_NAME}_${uuidv4().slice(0, 4)}`,
    extensions: [
      new Database({
        // Return a Promise to retrieve data …
        fetch: async (d) => {
          const doc = await prisma.document.findFirst({
            where: {
              id: d.context.documentId,
            },
          });
          return doc?.data || null;
        },
        // … and a Promise to store data:
        store: async (d) => {
          return prisma.document.update({
            where: {
              id: d.context.documentId,
            },
            data: {
              data: d.state,
            },
          });
        },
      }),
    ],
  };
  return Serverconfigure;
};
