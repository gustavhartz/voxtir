import { Resend } from 'resend';
import { CreateEmailResponse } from 'resend/build/src/emails/interfaces';

import {
  FRONTEND_BASE_URL,
  RESEND_API_KEY,
  RESEND_DOMAIN,
} from '../common/env.js';
import Invitiation from '../emails/Invitiation.js';
import TranscriptionStatusEmail from '../emails/TranscriptionFinished.js';

const resend = new Resend(RESEND_API_KEY);

export const sendProjectShareEmail = async (
  emailTo: string,
  senderName: string,
  token: string,
  projectName: string
): Promise<CreateEmailResponse> => {
  const invitationLink = `${FRONTEND_BASE_URL}/accept-invitation?token=${token}`;

  return resend.emails.send({
    from: `Voxtir <no-reply@${RESEND_DOMAIN}>`,
    to: emailTo,
    subject: `Invitation to join project: ${projectName}`,
    react: Invitiation({
      projectName: projectName,
      senderName: senderName,
      invitation: invitationLink,
    }),
  });
};

export const sendTranscriptionStatusEmail = async (
  emailTo: string,
  documentName: string,
  transcriptionStatus: 'DONE' | 'FAILED',
  documentLink: string
): Promise<CreateEmailResponse> => {
  const subject = `Your transcription "${documentName}" - has ${
    transcriptionStatus === 'DONE' ? 'completed' : 'failed'
  } its transcription`;
  return resend.emails.send({
    from: `Voxtir <no-reply@${RESEND_DOMAIN}>`,
    to: emailTo,
    subject: subject,
    react: TranscriptionStatusEmail({
      documentName: documentName,
      documentLink: documentLink,
      transcriptionStatus: transcriptionStatus,
    }),
  });
};
