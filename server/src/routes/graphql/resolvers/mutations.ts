import { ProjectRole } from '@prisma/client';
import { GraphQLError } from 'graphql';

import {
  generateProjectSharingToken,
  projectSharingJWTRes,
  verifyProjectSharingToken,
} from '../../../common/jwt.js';
import prisma from '../../../prisma/index.js';
import { logger } from '../../../services/logger.js';
import { sendProjectShareEmail } from '../../../services/resend.js';
import {
  getPresignedUrlForDocumentAudioFile,
  uploadAudioFile,
} from '../../../transcription/index.js';
import { FileAlreadyExistsError } from '../../../types/customErrors.js';
import { MutationResolvers } from '../generated/graphql';

// Use the generated `MutationResolvers` type
// to type check our mutations!
const mutations: MutationResolvers = {
  updateDocument: async (_, args, context) => {
    const { documentId, title } = args;
    const userId = context.userId;
    const doc = await prisma.document.findFirst({
      where: {
        id: documentId,
      },
      include: {
        project: {
          include: {
            UsersOnProjects: true,
          },
        },
      },
    });

    if (!doc?.project.UsersOnProjects.some((user) => user.userId === userId)) {
      return {
        success: false,
        message: 'User not allowed to perform action',
      };
    }

    if (!doc) {
      return {
        success: false,
        message: 'Document not found',
      };
    }

    if (doc) {
      await prisma.document.update({
        where: {
          id: documentId,
        },
        data: {
          title: title,
        },
      });
    }

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
    } = args;
    const userRights = await prisma.userOnProject.findFirst({
      where: {
        userId: context.userId,
        projectId: projectId,
      },
    });

    if (!userRights) {
      throw new GraphQLError('Projectid not found or related to user');
    }
    const doc = await prisma.document.create({
      data: {
        title: title,
        projectId: projectId,
        language: language,
        dialect: dialect,
        speakerCount: speakerCount,
        transcriptionType: transcriptionType,
        transcriptionStatus:
          transcriptionType === 'MANUAL' ? 'DONE' : 'CREATED',
      },
    });
    logger.debug(
      `Created document: ${doc.id} for project: ${projectId}. User by ${context.userId}`
    );
    return doc.id;
  },
  trashDocument: async (_, args, context) => {
    const { documentId, projectId } = args;
    const userRights = await prisma.userOnProject.findFirst({
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
    const userRelation = await prisma.userOnProject.findFirst({
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
    const userRelation = await prisma.userOnProject.findFirst({
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
      await prisma.userOnProject.deleteMany({
        where: {
          projectId: projectId,
          userId: userId,
        },
      });
    } else {
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
    }
    return { success: true };
  },
  shareProject: async (_, args, context) => {
    const { id, userEmail, role } = args;
    const userId = context.userId;
    // Assert user has permission
    const userRelation = await prisma.userOnProject.findFirst({
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

    const response = await sendProjectShareEmail(userEmail, token, id);
    logger.info(
      { messageId: response.id, email: userEmail, projectId: id },
      'Sent project share email'
    );
    return { success: true };
  },
  unshareProject: async (_, args, context) => {
    const { id, userEmail } = args;
    const userId = context.userId;

    const userRelation = await prisma.userOnProject.findFirst({
      where: {
        projectId: id,
        userId: userId,
      },
    });
    if (!userRelation || userRelation.role != ProjectRole.ADMIN) {
      return {
        success: false,
        message: 'Projectid not found or related to user',
      };
    }
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
  uploadAudioFile: async (_, args, context) => {
    logger.info('Uploading file');
    const { doc, documentId, projectId, contentLength } = args;
    const { createReadStream, filename } = await doc.file;
    // assert user has permission
    const userRelation = await prisma.userOnProject.findFirst({
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
    const docRelation = await prisma.document.findFirst({
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
    if (docRelation.audioFileURL) {
      return {
        success: false,
        message: 'Audio file already uploaded',
      };
    }

    logger.info('Uploading file', doc.docType, filename, documentId);
    logger.info(doc);
    const stream: Buffer = createReadStream();
    try {
      const key = await uploadAudioFile(
        documentId,
        stream,
        contentLength,
        filename,
        doc.docType
      );

      prisma.document.update({
        where: {
          id: documentId,
        },
        data: {
          audioFileURL: key,
        },
      });
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
    const userRelation = await prisma.userOnProject.findFirst({
      where: {
        projectId: projectId,
        userId: context.userId,
      },
    });
    if (!userRelation) {
      throw new GraphQLError('Projectid not found or related to user');
    }
    // Document is on project
    const docRelation = await prisma.document.findFirst({
      where: {
        projectId: projectId,
        id: documentId,
      },
    });
    if (!docRelation) {
      throw new GraphQLError('Document project combination not found');
    }
    const signedUrlResponse = await getPresignedUrlForDocumentAudioFile(
      `${documentId}`
    );
    return signedUrlResponse;
  },
  pinnedProject: async (_, args, context) => {
    const { projectId, pin } = args;
    const userId = context.userId;
    const userRelation = await prisma.userOnProject.findFirst({
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
