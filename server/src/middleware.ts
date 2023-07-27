import { auth } from 'express-oauth2-jwt-bearer';
const { AUTH0_DOMAIN } = process.env;
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction, Handler } from 'express';
import prisma from './prisma/index.js';

const VOXTIR_SEEN_USER_COOKIE = 'voxtir_seen_user';
const NODE_ENV = process.env.NODE_ENV || 'development';

/*
Standard auth0 logic except for in development where the user can be defined as a header on the request
HEADER: x_voxtir_user = [AUTH0 user_id]
*/
export const accessControl: Handler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (NODE_ENV === 'development' && req.headers?.x_voxtir_user) {
    // In development we allow for setting a user header to bypass auth0
    req.auth = {
      payload: {
        iss: `https://${AUTH0_DOMAIN}/`,
        sub: req.headers?.x_voxtir_user[0],
        aud: [
          `https://${AUTH0_DOMAIN}/api/v2/`,
          `https://${AUTH0_DOMAIN}/userinfo`,
        ],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
        azp: 'DEVELOPMENT',
        scope: 'openid profile email read:current_user',
      },
      header: { alg: 'RS256', typ: 'JWT', kid: 'DEVELOPMENT' },
      token: 'DEVELOPMENT',
    };
    return next();
  }
  auth({
    audience: [
      `https://${AUTH0_DOMAIN}/api/v2/`,
      `https://${AUTH0_DOMAIN}/userinfo`,
    ],
    issuerBaseURL: `https://${AUTH0_DOMAIN}/`,
    tokenSigningAlg: 'RS256',
  })(req, res, next);
};

/*
This is a middleware that will check if the user has an active session. 
The purpose is to determine if we should fetch user data from auth0 and update it in the database or not. If the user has a 
session we will not update the user data in the database. If the user does not have we will. Additionally it will serve as a way of 
determining if the user has been seen before. We don't get webhooks etc. on signup
*/
export const userInfoSync = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!(req.cookies[VOXTIR_SEEN_USER_COOKIE] === 'seen')) {
    if (!req.auth?.payload?.sub) {
      throw new Error('Sub found on request');
    }
    res.cookie(VOXTIR_SEEN_USER_COOKIE, 'seen', {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      secure: true,
      sameSite: 'none',
    });
    prisma.user.upsert({
      create: {
        authProviderId: req.auth.payload.sub,
      },
      update: {},
      where: {
        authProviderId: req.auth.payload.sub,
      },
    });
  }
  next();
};

export const requestId = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = uuidv4();
  return next();
};
