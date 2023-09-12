import { Resend } from 'resend';
import { CreateEmailResponse } from 'resend/build/src/emails/interfaces';

import {
  FRONTEND_BASE_URL,
  RESEND_API_KEY,
  RESEND_DOMAIN,
} from '../common/env.js';
import Invitiation from "../email/emails/Invitiation.js";

const resend = new Resend(RESEND_API_KEY);

/*
userEmail,
      user.auth0ManagementApiUserDetails,
      token,
      project.name,
*/

export interface Auth0User {
  name: string
  email: string
  last_ip: string
  picture: string
  user_id: string
  nickname: string
  created_at: string
  identities: Identity[]
  last_login: string
  updated_at: string
  logins_count: number
  email_verified: boolean
  last_password_reset: string
}

export interface Identity {
  user_id: string
  isSocial: boolean
  provider: string
  connection: string
}

export const sendProjectShareEmail = async (
  emailTo: string,
  user: Auth0User,
  token: string,
  projectName: string
): Promise<CreateEmailResponse> => {
  const invitationLink = `${FRONTEND_BASE_URL}/accept-invitation/${token}`;

  return resend.emails.send({
    from: `Voxtir <no-reply@${RESEND_DOMAIN}>`,
    to: emailTo,
    subject: `Invitation to join project: ${projectName}`,
    react: Invitiation({
      projectName: projectName,
      user: user.name ?? "A user",
      invitation: invitationLink,
    })
  });
};