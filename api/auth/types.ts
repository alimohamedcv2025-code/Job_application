export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  id_token: string;
};

export type SessionPayload = {
  userId: number;
  email: string;
};

export type GoogleUserProfile = {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
};
