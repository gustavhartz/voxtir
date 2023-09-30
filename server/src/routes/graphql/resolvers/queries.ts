import { TranscriptionProcessStatus } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { v4 as uuidv4 } from 'uuid';

import { AWS_AUDIO_BUCKET_NAME } from '../../../common/env.js';
import prisma from '../../../prisma/index.js';
import { logger } from '../../../services/logger.js';
import { S3StorageHandler } from '../../../services/storageHandler.js';
import {
  TipTapJSONToHTML,
  yjsStateToTipTapJSON,
} from '../../../tiptap-editor/index.js';
import { LanguageCodePairs } from '../../../transcription/common.js';
import { Auth0ManagementApiUser } from '../../../types/auth0.js';
import { generateWordFileFromHTML } from '../../../utilities/tiptap-word-exporter.js';
import {
  Project,
  QueryResolvers,
  TranscriptionStatus,
  UserSharing,
} from '../generated/graphql.js';
import { checkUserAccessToDocument } from './database-helpers.js';

// Use the generated `QueryResolvers`
// type to type check our queries!
const queries: QueryResolvers = {
  documentJSON: async (_, args, context) => {
    const documentId = args.documentId;
    const userId = context.userId;
    const document = await checkUserAccessToDocument(documentId, userId);
    if (!document?.data) {
      throw new GraphQLError('Document empty');
    }
    return JSON.stringify(yjsStateToTipTapJSON(document.data));
  },
  status: async () => {
    return { success: true, message: 'ok' };
  },
  me: async (_, __, context) => {
    const user = await prisma.user.findFirst({
      where: {
        id: context.userId,
      },
    });
    if (!user) {
      logger.error('User query for unknown user');
      throw new GraphQLError('User not known');
    }
    const aut0Details =
      user?.auth0ManagementApiUserDetails as any as Auth0ManagementApiUser;
    return {
      id: context.userId,
      credits: user.credits,
      name: aut0Details.name,
      email: aut0Details.email,
    };
  },
  projects: async (_, __, context) => {
    // Replace with your logic to fetch projects from the database
    const projects = await prisma.project.findMany({
      where: {
        UsersOnProjects: {
          every: {
            userId: context.userId,
          },
        },
      },
      include: {
        Documents: {
          include: {
            transcription: true,
          },
        },
      },
    });
    const projectResponse: Project[] = [];
    // for loop to iterate through projects and create output format
    for (const projectEle of projects) {
      const projectResponseObj: Project = {
        id: projectEle.id,
        name: projectEle.name,
        description: projectEle.description,
        updatedAt: projectEle.updatedAt.toISOString(),
        documents: projectEle.Documents.filter((doc) => doc.transcription).map(
          (doc) => {
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
                convertTranscriptionStatusToTranscriptionProcessStatus(
                  doc.transcription!.status
                ),
              transcriptionType: doc.transcription!.type,
            };
          }
        ),
      };
      projectResponse.push(projectResponseObj);
    }
    return projectResponse;
  },
  project: async (_, args, context) => {
    // Replace with your logic to fetch a specific project by ID from the database
    const project = await prisma.project.findFirst({
      where: {
        UsersOnProjects: {
          every: {
            userId: context.userId,
          },
        },
        id: args.id,
      },
      include: {
        Documents: {
          include: {
            transcription: true,
          },
        },
      },
    });
    if (!project) {
      return null;
    }
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      updatedAt: project.updatedAt.toISOString(),
      documents: project.Documents.filter((doc) => doc.transcription).map(
        (doc) => {
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
              convertTranscriptionStatusToTranscriptionProcessStatus(
                doc.transcription!.status
              ),
            transcriptionType: doc.transcription!.type,
          };
        }
      ),
    };
  },
  supportedLanguages: () => {
    const languagePairs = Object.keys(LanguageCodePairs).map((key) => ({
      languageCode: LanguageCodePairs[key as keyof typeof LanguageCodePairs],
      languageName: key,
    }));
    languagePairs.sort((a, b) => a.languageName.localeCompare(b.languageName));
    return languagePairs;
  },
  document: async (_, args, context) => {
    const documentId = args.id;
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
      },
      include: {
        project: {
          include: {
            UsersOnProjects: true,
          },
        },
        transcription: true,
      },
    });
    if (!document) {
      throw new GraphQLError('Document not found');
    }
    if (!document.transcription) {
      logger.error(`Document ${documentId} has no transcription`);
      throw new GraphQLError('Document has error in transcription');
    }
    if (
      document.project.UsersOnProjects.some(
        (userOnProject) => userOnProject.userId === context.userId
      )
    ) {
      throw new GraphQLError('User not on project');
    }
    return {
      id: document.id,
      isTrashed: document.isTrashed,
      lastModified: document.updatedAt.toISOString(),
      projectId: document.projectId,
      title: document.title,
      transcriptionMetadata: {
        speakersCount: document.speakerCount,
        language: document.language,
        dialects: [document.dialect],
      },
      transcriptionStatus:
        convertTranscriptionStatusToTranscriptionProcessStatus(
          document.transcription?.status
        ),
      transcriptionType: document.transcription?.type,
    };
  },
  /**
   * The purpose of this query is to convert an HTML representation of the tiptap editor to a word file.
   * This file is then placed in S3 and a presigned url is returned to the user. The HTML is generated from the TipTap editor
   * and thus adheres to a strict schema. Thus there a multiple preprocessing steps that need to be done to give a nice word file.
   * @param _
   * @param args
   * @param context
   * @returns
   */
  generateWordExport: async (_, args, context) => {
    const documentId = args.documentId;
    logger.info(`Generating word file from HTML for user ${context.userId}`);
    const document = await checkUserAccessToDocument(
      documentId,
      context.userId
    );

    if (!document?.data) {
      throw new GraphQLError('Document empty');
    }

    const htmlString = TipTapJSONToHTML(
      yjsStateToTipTapJSON(document.data).default
    );
    const wordDoc = await generateWordFileFromHTML(htmlString);
    // Should be a separate bucket
    const s3 = new S3StorageHandler(AWS_AUDIO_BUCKET_NAME);

    const key = `wordexport/${uuidv4() + '-' + context.userId}.docx`;
    await s3.putObject(
      key,
      wordDoc,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );

    const expiration = new Date();
    const accessPeriodSeconds = 60 * 5; // 5 minutes

    expiration.setTime(expiration.getTime() + accessPeriodSeconds * 1000);

    const presignedUrl = await s3.generatePresignedUrlForObject(
      key,
      accessPeriodSeconds
    );

    return {
      url: presignedUrl,
      expiresAtUnixSeconds: Math.floor(expiration.getTime() / 1000),
    };
  },

  pinnedProjects: async (_, __, context) => {
    const userId = context.userId;
    const pinnedProjects = await prisma.pinnedProjects.findMany({
      where: {
        userId: userId,
        pinned: true,
      },
      include: {
        project: {
          include: {
            Documents: {
              include: {
                transcription: true,
              },
            },
          },
        },
      },
    });
    const projectList = pinnedProjects.map(
      (pinnedProject) => pinnedProject.project
    );

    const projectResponse: Project[] = [];
    // for loop to iterate through projects and create output format
    for (const projectEle of projectList) {
      const projectResponseObj: Project = {
        id: projectEle.id,
        name: projectEle.name,
        description: projectEle.description,
        updatedAt: projectEle.updatedAt.toISOString(),
        documents: projectEle.Documents.filter((doc) => doc.transcription).map(
          (doc) => {
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
                convertTranscriptionStatusToTranscriptionProcessStatus(
                  doc.transcription?.status
                ),
              transcriptionType: doc.transcription!.type,
            };
          }
        ),
      };
      projectResponse.push(projectResponseObj);
    }
    return projectResponse;
  },
  projectSharedWith: async (_, args, context) => {
    const project = await prisma.project.findFirst({
      where: {
        id: args.id,
      },
      include: {
        UsersOnProjects: true,
      },
    });
    if (!project) {
      throw new GraphQLError('Project not found');
    }
    if (
      !project.UsersOnProjects.some(
        (userOnProject) =>
          userOnProject.userId === context.userId &&
          userOnProject.role === 'ADMIN'
      )
    ) {
      throw new GraphQLError('User not on project or not admin');
    }

    const sharingList = await prisma.projectInvitation.findMany({
      where: {
        projectId: args.id,
      },
    });
    return sharingList.map((sharing) => {
      return {
        email: sharing.email,
        role: sharing.role,
        used: sharing.used,
      } as UserSharing;
    });
  },
};

export default queries;

// TranscriptionProcessStatus to TranscriptionStatus
const convertTranscriptionStatusToTranscriptionProcessStatus = (
  status: TranscriptionProcessStatus | null | undefined
): TranscriptionStatus => {
  switch (status) {
    case TranscriptionProcessStatus.DONE:
      return TranscriptionStatus.Done;
    case TranscriptionProcessStatus.FAILED:
      return TranscriptionStatus.Failed;
    case TranscriptionProcessStatus.TRANSCRIPTION_JOB_RUNNING:
      return TranscriptionStatus.Processing;
    case TranscriptionProcessStatus.TRANSCRIPTION_JOB_COMPLETED:
      return TranscriptionStatus.Processing;
    case TranscriptionProcessStatus.QUEUED:
      return TranscriptionStatus.Queued;
    default:
      return TranscriptionStatus.Created;
  }
};
