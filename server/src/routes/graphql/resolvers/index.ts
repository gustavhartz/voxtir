import { GraphQLUpload } from 'graphql-upload-minimal';
import type { Readable } from 'stream';

import { Resolvers } from '../generated/graphql';

export const resolvers: Resolvers = {
  Upload: GraphQLUpload,

  Query: {
    status: async () => {
      return { success: true, message: 'ok' };
    },
    me: async () => {
      return { id: '1234', name: 'Jane', email: 'fes@tes.dk' };
    },
    projects: async () => {
      // Replace with your logic to fetch projects from the database
      return [
        {
          id: '1',
          name: 'Project 1',
          description: 'Project 1 description',
          sharedWith: [
            {
              id: '2',
              name: 'User 2',
              email: 'user2@example.com',
              role: 'ADMIN',
            },
            {
              id: '3',
              name: 'User 3',
              email: 'user3@example.com',
              role: 'ADMIN',
            },
          ],
          documents: [
            {
              id: '1',
              title: 'Document 1',
              projectId: '234',
              sharedWith: [
                {
                  id: '2',
                  name: 'User 2',
                  email: 'user2@example.com',
                  role: 'ADMIN',
                },
                {
                  id: '3',
                  name: 'User 3',
                  email: 'user3@example.com',
                  role: 'ADMIN',
                },
              ],
              isTrashed: false,
              lastModified: '2023-06-01',
              description: 'Document 1 description',
              transcriptionMetadata: {
                speakersCount: 2,
                dialects: ['Dialect 1', 'Dialect 2'],
                language: 'English',
              },
              transcriptionStatus: 'COMPLETED',
              transcriptionType: 'MANUAL',
            },
          ],
        },
      ];
    },
    project: async () => {
      // Replace with your logic to fetch a specific project by ID from the database
      return {
        id: '1',
        name: 'Project 1',
        description: 'Project 1 description',
        sharedWith: [
          {
            id: '2',
            name: 'User 2',
            email: 'user2@example.com',
            role: 'ADMIN',
          },
          {
            id: '3',
            name: 'User 3',
            email: 'user3@example.com',
            role: 'ADMIN',
          },
        ],
        documents: [
          {
            id: '1',
            title: 'Document 1',
            projectId: '234',
            sharedWith: [
              {
                id: '2',
                name: 'User 2',
                email: 'user2@example.com',
                role: 'ADMIN',
              },
              {
                id: '3',
                name: 'User 3',
                email: 'user3@example.com',
                role: 'ADMIN',
              },
            ],
            isTrashed: false,
            lastModified: '2023-06-01',
            description: 'Document 1 description',
            transcriptionMetadata: {
              speakersCount: 2,
              dialects: ['Dialect 1', 'Dialect 2'],
              language: 'English',
            },
            transcriptionStatus: 'COMPLETED',
            transcriptionType: 'MANUAL',
          },
        ],
      };
    },
  },

  Mutation: {
    uploadDocuments: async (parent, args) => {
      const { docs } = args;
      for (const doc of docs) {
        const { createReadStream, filename } = await doc.file;
        console.info(doc.docType, filename);
        const stream: Readable = createReadStream();
        stream.on('error', function (err) {
          console.log(err);
          stream.destroy();
          return { success: false, message: err.message };
        });
      }
      return { success: true };
    },
    createDocument: async () => {
      return {
        id: '1',
        title: 'Document 1',
        projectId: '234',
        sharedWith: [
          {
            id: '2',
            name: 'User 2',
            email: 'user2@example.com',
            role: 'ADMIN',
          },
          {
            id: '3',
            name: 'User 3',
            email: 'user3@example.com',
            role: 'ADMIN',
          },
        ],
        isTrashed: false,
        lastModified: '2023-06-01',
        description: 'Document 1 description',
        transcriptionMetadata: {
          speakersCount: 2,
          dialects: ['Dialect 1', 'Dialect 2'],
          language: 'English',
        },
        transcriptionStatus: 'COMPLETED',
        transcriptionType: 'MANUAL',
      };
    },
    unshareDocument: async (parent, args) => {
      const { documentId, userEmail } = args;
      console.info(documentId, userEmail);
      return { success: true };
    },
    deleteDocument: async (parent, args) => {
      const { documentId } = args;
      console.info(documentId);
      return { success: true };
    },
    createProject: async (parent, args) => {
      const { name, description } = args;
      console.info(name, description);
      return {
        id: '1',
        name: 'Project 1',
        description: 'Project 1 description',
        sharedWith: [
          {
            id: '2',
            name: 'User 2',
            email: 'user2@example.com',
            role: 'ADMIN',
          },
          {
            id: '3',
            name: 'User 3',
            email: 'user3@example.com',
            role: 'ADMIN',
          },
        ],
        documents: [
          {
            id: '1',
            title: 'Document 1',
            projectId: '234',
            sharedWith: [
              {
                id: '2',
                name: 'User 2',
                email: 'user2@example.com',
                role: 'ADMIN',
              },
              {
                id: '3',
                name: 'User 3',
                email: 'user3@example.com',
                role: 'ADMIN',
              },
            ],
            isTrashed: false,
            lastModified: '2023-06-01',
            description: 'Document 1 description',
            transcriptionMetadata: {
              speakersCount: 2,
              dialects: ['Dialect 1', 'Dialect 2'],
              language: 'English',
            },
            transcriptionStatus: 'COMPLETED',
            transcriptionType: 'MANUAL',
          },
        ],
      };
    },
    deleteProject: async (parent, args) => {
      const { id } = args;
      console.info(id);
      return { success: true };
    },
    shareDocument: async (parent, args) => {
      const { documentId, userEmail, role } = args;
      console.info(documentId, userEmail, role);
      return { success: true };
    },
    shareProject: async (parent, args) => {
      const { id, userEmail, role } = args;
      console.info(id, userEmail, role);
      return { success: true };
    },
    updateDocument: async (parent, args) => {
      const { documentId, title, description } = args;
      console.info(documentId, title, description);
      return { success: true };
    },
    uploadAudioFile: async (parent, args) => {
      const { doc, documentId } = args;
      const { createReadStream, filename } = await doc.file;
      console.info(doc.docType, filename, documentId);
      const stream: Readable = createReadStream();
      stream.on('error', function (err) {
        console.log(err);
        stream.destroy();
        return { success: false, message: err.message };
      });
      return { success: true };
    },
  },
};
