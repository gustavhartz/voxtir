import { QueryResolvers, Project } from '../generated/graphql';
import prisma from '../../../prisma/index.js';
import { logger } from '../../../services/logger.js';
import { TranscriptionProcessStatus } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { Auth0ManagementApiUser } from '../../../types/auth0.js';
import { LanguageCodePairs } from '../../../transcription/common.js';

// Use the generated `QueryResolvers`
// type to type check our queries!
const queries: QueryResolvers = {
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
    let aut0Details =
      user?.auth0ManagementApiUserDetails as any as Auth0ManagementApiUser;
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
  supportedLanguages: () => {
    return Object.keys(LanguageCodePairs);
  },
};

export default queries;
