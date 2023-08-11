import jwt, { VerifyOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const envShareProjectTokenExpirationTime = parseInt(
  process.env.PROJECT_SHARING_EXPIRATION_TIME || ''
);

const projectTokenExpirationTime = Number.isInteger(
  envShareProjectTokenExpirationTime
)
  ? envShareProjectTokenExpirationTime
  : 604800;

export const generateProjectSharingToken = (projectId: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not defined');
  }
  return jwt.sign(
    {
      projectId,
    },
    process.env.JWT_SECRET,
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
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined!');
  }
  return jwt.verify(
    token,
    process.env.JWT_SECRET,
    verifyOptions
  ) as projectSharingJWTRes;
}

let isRunningDirectly = false;
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
