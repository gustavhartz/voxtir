import { GraphQLUpload } from 'graphql-upload-minimal';
import type { Readable } from 'stream';
import prisma from '../../../prisma/index.js';

import { Resolvers, Project } from '../generated/graphql';
import { TranscriptionProcessStatus, ProjectRole } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { Auth0ManagementApiUser } from '../../../types/auth0.js';

export const resolvers: Resolvers = {
  Upload: GraphQLUpload,

  Query: {
    status: async () => {
      return { success: true, message: 'ok' };
    },
    me: async (_, __, context) => {
      let user = await prisma.user.findFirst({
        where: {
          id: context.userId,
        },
      });
      if (!user) {
        throw new GraphQLError('User not known');
      }
      let aut0Details: Auth0ManagementApiUser = JSON.parse(
        user?.auth0ManagementApiUserDetails as string
      );

      return {
        id: context.userId,
        name: aut0Details.name,
        email: aut0Details.email,
      };
    },
    projects: async (_, __, context) => {
      // Replace with your logic to fetch projects from the database
      let projects = await prisma.project.findMany({
        where: {
          UsersOnProjects: {
            every: {
              userId: context.userId,
            },
          },
        },
        include: {
          Documents: {},
        },
      });
      const projectResponse: Project[] = [];
      // for loop to iterate through projects and create output format
      for (const projectEle of projects) {
        var projectResponseObj: Project = {
          id: projectEle.id,
          name: projectEle.name,
          description: projectEle.description,
          documents: projectEle.Documents.map((doc) => {
            return {
              id: doc.id,
              title: doc.title,
              projectId: doc.projectId,
              isTrashed: doc.isTrashed,
              lastModified: doc.updatedAt.toISOString(),
              transcriptionMetadata: {
                language: doc.language,
                speakersCount: doc.speakerCount,
                dialects: [doc.dialect],
              },
              transcriptionStatus:
                doc.transcriptionStatus as TranscriptionProcessStatus,
              transcriptionType: doc.transcriptionType,
            };
          }),
        };
        projectResponse.push(projectResponseObj);
      }
      return projectResponse;
    },
    project: async (_, args, context) => {
      // Replace with your logic to fetch a specific project by ID from the database
      let project = await prisma.project.findFirst({
        where: {
          UsersOnProjects: {
            every: {
              userId: context.userId,
            },
          },
          id: args.id,
        },
        include: {
          Documents: {},
        },
      });
      if (!project) {
        return null;
      }
      return {
        id: project.id,
        name: project.name,
        description: project.description,
        documents: project.Documents.map((doc) => {
          return {
            id: doc.id,
            title: doc.title,
            projectId: doc.projectId,
            isTrashed: doc.isTrashed,
            lastModified: doc.updatedAt.toISOString(),
            transcriptionMetadata: {
              language: doc.language,
              speakersCount: doc.speakerCount,
              dialects: [doc.dialect],
            },
            transcriptionStatus:
              doc.transcriptionStatus as TranscriptionProcessStatus,
            transcriptionType: doc.transcriptionType,
          };
        }),
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
      return { success: true };
    },
    trashDocument: async (_, args, context) => {
      const { documentId, projectId } = args;
      let userRights = await prisma.userOnProject.findFirst({
        where: {
          userId: context.userId,
        },
      });
      if (!userRights) {
        return {
          success: false,
          message: 'Projectid not found or related to user',
        };
      }
      if (userRights.role != ProjectRole.ADMIN) {
        return {
          success: false,
          message: 'User not allowed to perform action',
        };
      }
      let doc = prisma.document.update({
        where: {
          projectId: projectId,
          id: documentId,
        },
        data: {
          isTrashed: true,
        },
      });
      if (!doc) {
        return {
          success: false,
          message: 'Document project combination not found',
        };
      }

      return { success: true };
    },
    createProject: async (_, args, context) => {
      const { name, description } = args;
      await prisma.project.create({
        data: {
          name: name,
          description: description,
          UsersOnProjects: {
            create: {
              userId: context.userId,
              role: 'ADMIN',
            },
          },
        },
      });
      return { success: true };
    },
    deleteProject: async (parent, args, context) => {
      let userId = context.userId;
      let projectId = args.id;
      let userRelation = await prisma.userOnProject.findFirst({
        where: {
          projectId: projectId,
          userId: userId,
        },
      });
      if (!userRelation) {
        return {
          success: false,
          message: 'Projectid not found or related to user',
        };
      }
      if (userRelation.role != ProjectRole.ADMIN) {
        return {
          success: false,
          message: 'User not allowed to perform action',
        };
      }
      console.log(`Deleting project: ${projectId}`);
      await prisma.document.deleteMany({
        where: {
          projectId: projectId,
        },
      });
      await prisma.project.delete({
        where: {
          id: projectId,
        },
      });
      return { success: true };
    },
    shareProject: async (parent, args) => {
      const { id, userEmail, role } = args;
      // TODO: implement
      /*
      1. Create invitation link with code to accept
      2. Send email with invitation that can be accepted through the sharing resolver
      */
      return { success: true };
    },
    acceptProjectInvitation: async (_, args, context) => {
      const { id, token } = args;
      const userId = context.userId;
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
