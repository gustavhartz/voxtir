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
      authProviderId: '123456', // Replace with the desired Auth0 ID for user1
    },
  });

  const user2 = await prisma.user.create({
    data: {
      authProviderId: '789012', // Replace with the desired Auth0 ID for user2
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
      documentUUID: uuidv4(),
      audioFileUrl: 'https://example.com/audio1.mp3',
      projectId: project1.id,
    },
  });

  const document2: Document = await prisma.document.create({
    data: {
      data: Buffer.from('Sample data for document 2'),
      documentUUID: uuidv4(),
      audioFileUrl: 'https://example.com/audio2.mp3',
      projectId: project2.id,
    },
  });

  // Create transcription processes
  await prisma.transcriptionProcess.createMany({
    data: [
      {
        status: TranscriptionProcessStatus.DONE,
        doSpeakerDiarization: true,
        documentId: document1.id,
        rawAudioFileURL: 'https://example.com/raw1.wav',
        transcriptionAudioFileURL: 'https://example.com/transcription1.wav',
        speakerDiarizationFileURL: 'https://example.com/speaker1.txt',
        whisperTranscriptionFileURL: 'https://example.com/whisper1.txt',
      },
      {
        status: TranscriptionProcessStatus.PROCESSING,
        doSpeakerDiarization: false,
        documentId: document2.id,
        rawAudioFileURL: 'https://example.com/raw2.wav',
        transcriptionAudioFileURL: 'https://example.com/transcription2.wav',
        speakerDiarizationFileURL: 'https://example.com/speaker2.txt',
        whisperTranscriptionFileURL: 'https://example.com/whisper2.txt',
      },
    ],
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
