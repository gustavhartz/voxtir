import { Resolvers } from '../generated/graphql';
import { Context } from '../context.js';

import { GraphQLUpload } from 'graphql-upload-minimal';
import type { Readable } from 'stream';

export const resolvers: Resolvers = {
  Upload: GraphQLUpload,

  Query: {
    status: async (parent, args, context: Context, info) => {
      return { message: 'ok' };
    },
  },

  Mutation: {
    uploadDocuments: async (parent, args, context: Context, info) => {
      const { docs } = args;
      try {
        for (const doc of docs) {
          const { createReadStream, filename } = await doc.file;
          console.info(doc.docType, filename);
          const stream: Readable = createReadStream();
        }

        return { success: true };
      } catch (error: any) {
        console.log('File upload failed', error);
        return { success: false, message: error.message };
      }
    },
  },
};
