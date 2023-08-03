import { GraphQLUpload } from 'graphql-upload-minimal';
import prisma from '../../../prisma/index.js';

import { Resolvers, Project } from '../generated/graphql';
import { TranscriptionProcessStatus, ProjectRole } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { Auth0ManagementApiUser } from '../../../types/auth0.js';
import {
  generateProjectSharingToken,
  projectSharingJWTRes,
  verifyProjectSharingToken,
} from '../../../helpers/jwt.js';
import { sendProjectShareEmail } from '../../../services/resend.js';
import { logger } from '../../../services/logger.js';
import {
  uploadAudioFile,
  getPresignedUrlForDocumentAudioFile,
} from '../../../transcription/index.js';
import { FileAlreadyExistsError } from '../../../types/customErrors.js';
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
        logger.error('User query for unknown user');
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
        let projectResponseObj: Project = {
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
    createDocument: async (_, args, context) => {
      const {
        projectId,
        title,
        language,
        dialect,
        speakerCount,
        transcriptionType,
      } = args;
      let userRights = await prisma.userOnProject.findFirst({
        where: {
          userId: context.userId,
          projectId: projectId,
        },
      });

      if (!userRights) {
        return {
          success: false,
          message: 'Projectid not found or related to user',
        };
      }
      await prisma.document.create({
        data: {
          title: title,
          projectId: projectId,
          language: language,
          dialect: dialect,
          speakerCount: speakerCount,
          transcriptionType: transcriptionType,
        },
      });

      return { success: true };
    },
    trashDocument: async (_, args, context) => {
      const { documentId, projectId } = args;
      let userRights = await prisma.userOnProject.findFirst({
        where: {
          userId: context.userId,
          projectId: projectId,
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
      let doc = await prisma.document.update({
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
    deleteProject: async (_, args, context) => {
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
      logger.info(`Deleting project: ${projectId}`);
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
    shareProject: async (_, args, context) => {
      const { id, userEmail, role } = args;
      const userId = context.userId;
      // Assert user has permission
      let userRelation = await prisma.userOnProject.findFirst({
        where: {
          projectId: id,
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
      let token = generateProjectSharingToken(id);

      await prisma.projectInvitation.create({
        data: {
          email: userEmail,
          // expires in 7 days
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          role: role,
          token: token,
          projectId: id,
        },
      });

      let response = await sendProjectShareEmail(userEmail, token, id);
      logger.info(
        { messageId: response.id, email: userEmail, projectId: id },
        'Sent project share email'
      );
      return { success: true };
    },
    acceptProjectInvitation: async (_, args, context) => {
      const { token } = args;
      const userId = context.userId;

      let tokenVerificationRes: projectSharingJWTRes;
      try {
        tokenVerificationRes = verifyProjectSharingToken(token);
      } catch (error) {
        logger.info({ token: token }, 'User tried to use invalid token');
        throw new GraphQLError('Token invalid or expired');
      }

      let invitation = await prisma.projectInvitation.findFirst({
        where: {
          token: token,
        },
      });

      if (!invitation) {
        return {
          success: false,
          message: 'Invitation not found',
        };
      }
      let id = invitation.projectId;

      if (id != tokenVerificationRes.projectId) {
        logger.error(
          'Mismatch between token in database and project sharing validation'
        );
      }

      if (invitation.used) {
        return {
          success: false,
          message: 'Invitation already used',
        };
      }

      let project = await prisma.userOnProject.findFirst({
        where: {
          projectId: id,
          userId: userId,
        },
      });

      if (project && project.role == ProjectRole.ADMIN) {
        return {
          success: false,
          message: 'User already admin of project',
        };
      } else if (project && invitation.role == ProjectRole.ADMIN) {
        await prisma.userOnProject.update({
          where: {
            id: project.id,
          },
          data: {
            role: ProjectRole.ADMIN,
          },
        });
      } else {
        await prisma.userOnProject.create({
          data: {
            projectId: id,
            userId: userId,
            role: invitation.role,
          },
        });
      }
      // Invalidate token
      await prisma.projectInvitation.update({
        where: {
          token: token,
        },
        data: {
          used: true,
        },
      });
      return { success: true };
    },
    uploadAudioFile: async (_, args, context) => {
      logger.info('Uploading file');
      const { doc, documentId, projectId } = args;
      const { createReadStream, filename } = await doc.file;
      // assert user has permission
      let userRelation = await prisma.userOnProject.findFirst({
        where: {
          projectId: projectId,
          userId: context.userId,
        },
      });
      if (!userRelation) {
        return {
          success: false,
          message: 'Projectid not found or related to user',
        };
      }
      // Document is on project
      let docRelation = await prisma.document.findFirst({
        where: {
          projectId: projectId,
          id: documentId,
        },
      });

      if (!docRelation) {
        return {
          success: false,
          message: 'Document project combination not found',
        };
      }

      logger.info('Uploading file', doc.docType, filename, documentId);
      logger.info(doc);
      const stream: Buffer = createReadStream();
      try {
        await uploadAudioFile(documentId, stream, filename, doc.docType);
      } catch (error) {
        if (error instanceof FileAlreadyExistsError) {
          return {
            success: false,
            message: 'File already exists',
          };
        }
        logger.error('error in raw fileupload to S3', error);
        return {
          success: false,
          message: 'Error uploading file',
        };
      }
      return { success: true };
    },
    getPresignedUrlForAudioFile: async (_, args, context) => {
      const { documentId, projectId } = args;
      // assert user has permission
      let userRelation = await prisma.userOnProject.findFirst({
        where: {
          projectId: projectId,
          userId: context.userId,
        },
      });
      if (!userRelation) {
        return {
          success: false,
          message: 'Projectid not found or related to user',
        };
      }
      // Document is on project
      let docRelation = await prisma.document.findFirst({
        where: {
          projectId: projectId,
          id: documentId,
        },
      });
      if (!docRelation) {
        return {
          success: false,
          message: 'Document project combination not found',
        };
      }
      let signedUrlResponse = await getPresignedUrlForDocumentAudioFile(
        `${documentId}`
      );
      return signedUrlResponse;
    },
  },
};
