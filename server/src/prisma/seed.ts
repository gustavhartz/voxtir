import {
  PrismaClient,
  Document,
  TranscriptionProcessStatus,
  ProjectRole,
} from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  // Create users
  const user1 = await prisma.user.create({
    data: {
      id: '123456', // Replace with the desired Auth0 ID for user1
    },
  });

  const user2 = await prisma.user.create({
    data: {
      id: '789012', // Replace with the desired Auth0 ID for user2
    },
  });

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Project 1',
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Project 2',
    },
  });

  // Create user-project relationships
  await prisma.userOnProject.createMany({
    data: [
      {
        projectId: project1.id,
        userId: user1.id,
        role: ProjectRole.ADMIN,
      },
      {
        projectId: project1.id,
        userId: user2.id,
        role: ProjectRole.USER,
      },
      {
        projectId: project2.id,
        userId: user1.id,
        role: ProjectRole.ADMIN,
      },
    ],
  });

  // Create documents
  const document1: Document = await prisma.document.create({
    data: {
      data: Buffer.from('Sample data for document 1'),
      id: uuidv4(),
      audioFileUrl: 'https://example.com/audio1.mp3',
      projectId: project1.id,
      doTranscription: true,
    },
  });

  const document2: Document = await prisma.document.create({
    data: {
      data: Buffer.from('Sample data for document 2'),
      id: uuidv4(),
      audioFileUrl: 'https://example.com/audio2.mp3',
      projectId: project2.id,
      doTranscription: true,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
