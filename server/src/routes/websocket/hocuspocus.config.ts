import { Database } from '@hocuspocus/extension-database';
import { Configuration } from '@hocuspocus/server';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../services/logger.js';
import { verifyToken } from '../../services/auth0.js';

// Ripped from
// docs-plus :) https://github.com/docs-plus/
import { APP_NAME } from '../../common/env.js';
import prisma from '../../prisma/index.js';
import { TranscriptionProcessStatus, TranscriptionType } from '@prisma/client';
import { HocuspocusContext } from '../../types/hocuspocus.js';

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
          await prisma.document.update({
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
    async onAuthenticate(data) {
      //@ts-ignore - The context is not typed in the hocuspocus server
      let context = data.context as HocuspocusContext;
      let token = data.token;
      let documentId = context.documentId;

      if (!documentId) {
        throw new Error('Document not specified');
      }
      if (!token) {
        throw new Error('Token not specified');
      }
      let jwtPayload = await verifyToken(token);
      let userId = jwtPayload.sub;

      let doc = await prisma.document.findFirst({
        where: {
          id: documentId,
        },
        include: {
          project: {
            include: {
              UsersOnProjects: {},
            },
          },
        },
      });
      if (!doc) {
        throw new Error('Document not found');
      }
      if (
        doc.transcriptionType === TranscriptionType.AUTOMATIC &&
        doc.transcriptionStatus !== TranscriptionProcessStatus.DONE
      ) {
        logger.debug(
          `Attempting to access to transcription that is not done for document ${documentId}`
        );
        throw new Error('Transcription not done');
      }

      let access = doc.project.UsersOnProjects.some(
        (userOnProject) => userOnProject.userId === userId
      );

      if (!access) {
        logger.debug(
          `User ${userId} not authorized for document ${documentId} and tried to access it`
        );
        throw new Error('User not authorized');
      }
    },
  };
  return Serverconfigure;
};
