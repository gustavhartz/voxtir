import {
  ProjectRole,
  TranscriptionProcessStatus,
  TranscriptionType,
} from '@prisma/client';
import { ReadStream } from 'fs';
import { GraphQLError } from 'graphql';

import {
  generateProjectSharingToken,
  projectSharingJWTRes,
  verifyProjectSharingToken,
} from '../../../common/jwt.js';
import prisma from '../../../prisma/index.js';
import { Auth0Client } from '../../../services/auth0.js';
import { logger } from '../../../services/logger.js';
import { sendProjectShareEmail } from '../../../services/resend.js';
import {
  getPresignedUrlForDocumentAudioFile,
  uploadRawAudioFile,
} from '../../../transcription/index.js';
import { MutationResolvers } from '../generated/graphql';
import {
  assertUserCreditsGreaterThan,
  checkUserRightsOnProject,
  subtractCreditsFromUser,
} from './database-helpers.js';
import { dumpReadStream } from './helpers.js';

const mutations: MutationResolvers = {
  updateDocument: async (_, args, context) => {
    const { documentId, title } = args;
    const userId = context.userId;
    const doc = await prisma.document.findFirst({
      where: {
        id: documentId,
      },
    });

    if (!doc) {
      throw new GraphQLError('Document not found');
    }

    checkUserRightsOnProject(doc.projectId, userId);

    await prisma.document.update({
      where: {
        id: documentId,
      },
      data: {
        title: title,
      },
    });

    return { success: true };
  },
  createDocument: async (_, args, context) => {
    const {
      projectId,
      title,
      language,
      dialect,
      speakerCount,
      transcriptionType,
      fileInput: { file: file, fileContentLength },
    } = args;
    logger.info(
      `Creating document for project: ${projectId} of type ${transcriptionType}`
    );

    const { createReadStream, filename, mimetype } = await file;
    const stream: ReadStream = createReadStream();
    let documentId = '';

    // This is to ensure the stream is dumped in case of failure because gql upload sucks
    try {
      // assert user has permission
      await checkUserRightsOnProject(projectId, context.userId);

      if (transcriptionType === TranscriptionType.AUTOMATIC) {
        await assertUserCreditsGreaterThan(context.userId, 0);
      }

      logger.debug(`User ${context.userId} has permission to create document`);

      const doc = await prisma.document.create({
        data: {
          title: title,
          projectId: projectId,
          language: language,
          dialect: dialect,
          speakerCount: speakerCount,
          transcription: {
            create: {
              type: transcriptionType,
              status: TranscriptionProcessStatus.AUDIO_PREPROCESSOR_JOB_PENDING,
            },
          },
        },
      });
      const result = await uploadRawAudioFile(
        doc.id,
        stream,
        fileContentLength,
        filename,
        mimetype
      );

      await prisma.document.update({
        where: {
          id: doc.id,
        },
        data: {
          audioFileURL: result.rawAudioKey,
          rawAudioFileExtension: result.fileExtension,
        },
      });
      documentId = doc.id;

      if (transcriptionType === TranscriptionType.AUTOMATIC) {
        await subtractCreditsFromUser(context.userId, 1);
      }
    } catch (err) {
      logger.error(`Error in document creation`, err);
      // Ensure multipart can terminate
      await dumpReadStream(stream);
      throw new GraphQLError('Error in document creation');
    }
    logger.info(`Created document: ${documentId} for project: ${projectId}`);
    return documentId;
  },
  trashDocument: async (_, args, context) => {
    const { documentId, projectId } = args;

    await checkUserRightsOnProject(
      projectId,
      context.userId,
      ProjectRole.ADMIN
    );

    const doc = await prisma.document.update({
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
  updateProject: async (_, args, context) => {
    const { id, name, description } = args;
    const userId = context.userId;

    await checkUserRightsOnProject(id, userId, ProjectRole.ADMIN);

    if (name !== null) {
      await prisma.project.update({
        where: {
          id: id,
        },
        data: {
          name: name,
          description: description,
        },
      });
    } else {
      await prisma.project.update({
        where: {
          id: id,
        },
        data: {
          description: description,
        },
      });
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
    /*
    If user is admin we delete the project and all documents
    if user is not admin we delete the user from the project
    */
    const userId = context.userId;
    const projectId = args.id;

    await checkUserRightsOnProject(projectId, userId, ProjectRole.ADMIN);

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

    const project = await checkUserRightsOnProject(
      id,
      userId,
      ProjectRole.ADMIN
    );

    const senderDetails = await Auth0Client.getUserById(userId);

    const token = generateProjectSharingToken(id);

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

    const response = await sendProjectShareEmail(
      userEmail,
      senderDetails.name || 'A user',
      token,
      project.name
    );
    logger.info(
      { messageId: response.id, email: userEmail, projectId: id },
      'Sent project share email'
    );
    return { success: true };
  },
  unshareProject: async (_, args, context) => {
    const { id, userEmail } = args;
    const userId = context.userId;

    await checkUserRightsOnProject(id, userId, ProjectRole.ADMIN);

    // If not accepted, delete invitation
    const invitation = await prisma.projectInvitation.findFirst({
      where: {
        projectId: id,
        email: userEmail,
      },
    });
    if (!invitation) {
      return {
        success: false,
        message: 'Invitation not found',
      };
    }
    await prisma.projectInvitation.deleteMany({
      where: {
        projectId: id,
        email: userEmail,
      },
    });
    logger.info(`Deleted project invitation for ${userEmail} on project ${id}`);
    if (invitation.usedById) {
      await prisma.userOnProject.deleteMany({
        where: {
          projectId: id,
          userId: invitation.usedById,
        },
      });
    }
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

    const invitation = await prisma.projectInvitation.findFirst({
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
    const id = invitation.projectId;
    logger.info(
      `User ${userId} attempting to accept invitation for project ${id}`
    );
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

    const project = await prisma.userOnProject.findFirst({
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
        usedById: userId,
      },
    });
    return { success: true };
  },
  getPresignedUrlForAudioFile: async (_, args, context) => {
    const { documentId } = args;

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
      },
    });

    if (!document) {
      throw new GraphQLError('Document not found');
    }

    checkUserRightsOnProject(document.projectId, context.userId);

    const signedUrlResponse = await getPresignedUrlForDocumentAudioFile(
      `${documentId}`
    );
    return signedUrlResponse;
  },
  pinnedProject: async (_, args, context) => {
    const { projectId, pin } = args;
    const userId = context.userId;

    await checkUserRightsOnProject(projectId, userId);

    await prisma.pinnedProjects.upsert({
      where: {
        projectId_userId: {
          projectId: projectId,
          userId: userId,
        },
      },
      update: {
        pinned: pin,
      },
      create: {
        pinned: pin,
        userId: userId,
        projectId: projectId,
      },
    });
    return { success: true };
  },
};

export default mutations;
