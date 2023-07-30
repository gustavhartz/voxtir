export interface Auth0ManagementUserIdentity {
  connection: string;
  provider: string;
  user_id: string;
  isSocial: boolean;
}

export interface Auth0ManagementApiUser {
  user_id: string;
  email: string;
  email_verified: boolean;
  username?: string;
  phone_number?: string;
  phone_verified?: boolean;
  created_at: string;
  updated_at: string;
  identities: Auth0ManagementUserIdentity[];
  app_metadata?: object; // You may replace `object` with a more specific type for app_metadata
  user_metadata?: object; // You may replace `object` with a more specific type for user_metadata
  picture: string;
  name: string;
  nickname: string;
  last_ip: string;
  last_login: string;
  logins_count: number;
  blocked?: boolean;
  given_name?: string;
  family_name?: string;
}
