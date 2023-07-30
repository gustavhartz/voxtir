import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Auth0ManagementApiUser } from '../types/auth0';

// get environment variables
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN;

export class Auth0Client {
  auth0: AxiosInstance;
  constructor() {
    this.auth0 = axios.create({
      baseURL: `https://${AUTH0_DOMAIN}/`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * @throws {Error}
   */
  async getUserById(
    userId: string,
    userToken: String
  ): Promise<Auth0ManagementApiUser> {
    const response = await this.auth0.get(`/api/v2/users/${userId}`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    if (response.status !== 200) {
      throw new Error('Error getting user');
    } else {
      return response.data as Auth0ManagementApiUser;
    }
  }
}

let isRunningDirectly = false;
if (isRunningDirectly) {
  // When running the file standalone, you can create an instance of Auth0Client and call its methods here.
  const auth0Client = new Auth0Client();
  let fse = await auth0Client.getUserById(
    'auth0|64c035be0b7eb7c5797264ca',
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImNLRHdhcjhQa0NQTUJ6bGV2cFB0diJ9.eyJpc3MiOiJodHRwczovL2Rldi1jbXEwNXlvYnR1dmhia3JpLmV1LmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2NGMwMzViZTBiN2ViN2M1Nzk3MjY0Y2EiLCJhdWQiOlsiaHR0cHM6Ly9kZXYtY21xMDV5b2J0dXZoYmtyaS5ldS5hdXRoMC5jb20vYXBpL3YyLyIsImh0dHBzOi8vZGV2LWNtcTA1eW9idHV2aGJrcmkuZXUuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTY5MDUyNDA1OCwiZXhwIjoxNjkwNjEwNDU4LCJhenAiOiJrTlpvWkNCWlI2MWpialJpTHZCaHZuM3VZRVJTT053RyIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgcmVhZDpjdXJyZW50X3VzZXIifQ.ghZ_99FO2VM-muQukWIvO1XUGJtH4DLCKHSvcZMyHFBCnMwf1Hdrcq9dgwOhpUbLhrnsUlJ3mqANm7Dm_-WbuPMvFyERYpikRSWeYb_584l4K2Y_EXAyuMD2aL6vauL2gYP6QKdKooT0P3Xvhx5OKxW_5Qe2NA-GpflrUhi6K1bcjy27ovyEVOn6Sja4crgAUThuD1KkA_1U2jCwu2WtXVvs7qrC8yZCKUfC9qZyS2aDj52Cm9e-9UsvQ-uaTa2E4s50W9Eigll1sjHdB8lHDAZqJ1rSAyYBvFmRzDwgSFP_SIuCBzjdh8kSq2ES8CcZBAKytbmxMZfTLihIgY4B7A'
  );
  console.log(fse);
}
