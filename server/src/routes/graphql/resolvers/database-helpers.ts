import { ProjectRole } from '@prisma/client';
import { GraphQLError } from 'graphql';

import prisma from '../../../prisma/index.js';

export const checkUserRightsOnProject = async (
  projectId: string,
  userId: string,
  requireRole?: ProjectRole
): Promise<void> => {
  const relation = await prisma.userOnProject.findFirst({
    where: {
      userId: userId,
      projectId: projectId,
    },
  });
  if (!relation) {
    throw new GraphQLError('User is not on project');
  }
  if (requireRole && relation.role !== requireRole) {
    throw new GraphQLError(
      `User does not have the required ${requireRole} role on project`
    );
  }
};

export const assertUserCreditsGreaterThan = async (
  userId: string,
  credits: number
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new GraphQLError('User not found');
  }
  if (user.credits < credits) {
    throw new GraphQLError('User does not have enough credits');
  }
};

export const subtractCreditsFromUser = async (
  userId: string,
  credits: number
): Promise<void> => {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      credits: {
        decrement: credits,
      },
    },
  });
};
