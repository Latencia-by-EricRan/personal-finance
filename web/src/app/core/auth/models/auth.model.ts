export interface ICredentials {
  Email: string;
  Password: string;
}

export interface ILoginResponse {
  token: string;
  expiresIn: number;
}
