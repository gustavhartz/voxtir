import jwt, { VerifyOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { JWT_SECRET, PROJECT_SHARING_EXPIRATION_TIME } from './env.js';

const envShareProjectTokenExpirationTime = parseInt(
  PROJECT_SHARING_EXPIRATION_TIME
);

const projectTokenExpirationTime = Number.isInteger(
  envShareProjectTokenExpirationTime
)
  ? envShareProjectTokenExpirationTime
  : 604800;

export const generateProjectSharingToken = (projectId: string) => {
  return jwt.sign(
    {
      projectId,
    },
    JWT_SECRET,
    { expiresIn: projectTokenExpirationTime }
  );
};

export interface projectSharingJWTRes {
  projectId: string;
  iat: number;
  exp: number;
}

export function verifyProjectSharingToken(
  token: string,
  verifyOptions?: VerifyOptions
): projectSharingJWTRes {
  return jwt.verify(token, JWT_SECRET, verifyOptions) as projectSharingJWTRes;
}

const isRunningDirectly = false;
if (isRunningDirectly) {
  const token = generateProjectSharingToken(uuidv4());
  console.log(token);
  const verifyRes = verifyProjectSharingToken(token);
  console.log(verifyRes);
  // convert times to human readable
  const iat = new Date(verifyRes.iat * 1000);
  const exp = new Date(verifyRes.exp * 1000);
  console.log(iat, exp);
}
