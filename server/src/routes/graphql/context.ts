import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

export interface Context {
  prisma: PrismaClient;
  req: Request;
  userId: string;
}
