import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { FIFOSet } from './common/data-structures.js';
import prisma from './prisma/index.js';
import { Auth0Client } from './services/auth0.js';
import { logger } from './services/logger.js';

const seenUsers = new FIFOSet<string>(1000);

/**
 * This is a middleware that will check if the user has an active session. 
The purpose is to determine if we should fetch user data from auth0 and update it in the database or not. If the user has a 
session we will not update the user data in the database. If the user does not have we will. Additionally it will serve as a way of 
determining if the user has been seen before. We don't get webhooks etc. on signup
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
export const userInfoSync = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.auth?.payload?.sub) {
    logger.error('Sub not found on request that passed auth0 middleware');
    return res.status(500).send('Auth not found on request');
  }
  if (!seenUsers.has(req.auth.payload.sub)) {
    seenUsers.add(req.auth.payload.sub);
    const auth0UserData = await Auth0Client.getUserById(req.auth.payload.sub);
    await prisma.user.upsert({
      create: {
        id: req.auth.payload.sub,
        auth0ManagementApiUserDetails:
          auth0UserData as unknown as Prisma.JsonObject,
      },
      update: {
        auth0ManagementApiUserDetails:
          auth0UserData as unknown as Prisma.JsonObject,
      },
      where: {
        id: req.auth.payload.sub,
      },
    });
  }
  next();
};

/**
 * A simple middleware that will add a unique id to the request object
 * @param req
 * @param res
 * @param next
 * @returns
 */
export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  req.requestId = uuidv4();
  return next();
};
