import { Resend } from 'resend';
import { CreateEmailResponse } from 'resend/build/src/emails/interfaces';

import {
  FRONTEND_BASE_URL,
  RESEND_API_KEY,
  RESEND_DOMAIN,
} from '../common/env.js';

const resend = new Resend(RESEND_API_KEY);

export const sendProjectShareEmail = async (
  emailTo: string,
  token: string,
  projectName: string
): Promise<CreateEmailResponse> => {
  const invitationLink = `https://${FRONTEND_BASE_URL}/accept-invitation?token=${token}`;

  return resend.emails.send({
    from: `Voxtir <no-reply@${RESEND_DOMAIN}>`,
    to: emailTo,
    subject: `Inviation to join project: ${projectName}`,
    html: `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Voxtir Transcription Project ${projectName}!</title>
      <style>
        /* Reset styles */
        body, p {
          margin: 0;
          padding: 0;
        }
    
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #1F1E1E;
        }
    
        /* Container */
        .container {
          margin: 0 auto;
          padding: 20px;
          text-align: center;
          background-color: #3D57DF;
        }
    
        /* Main Content */
        .content {
          padding: 20px;
          background-color: #fff;
          border: 1px solid #ddd;
        }
    
        .content p {
          font-size: 16px;
        }
    
        .content a {
          display: block;
          margin-top: 20px;
          background-color: #3D57DF;
          color: #fff;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 4px;
        }
    
        /* Footer */
        .footer {
          text-align: center;
          padding: 10px;
        }
    
        .footer p {
          font-size: 14px;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 colo>Welcome to Voxtir Transcription Project ${projectName}!</h1>
      </div>
      <div class="content">
        <p>You have been invited to join a Voxtir Transcription Project!</p>
        <p>Press the link below to sign up/login and accept the invitation:</p>
        <a href="${invitationLink}">Join Voxtir Transcription Project</a>
        <p>Voxtir is a leading collaborative voice-to-text and insights company.</p>
      </div>
      <div class="footer">
        <p>If you have any questions or need assistance, please contact us at support@voxtir.com</p>
      </div>
    </body>
    </html>
    `,
  });
};

const isRunningDirectly = false;
if (isRunningDirectly) {
  sendProjectShareEmail('gsh@voxtir.com', 'testtoken', 'testproject')
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
}
