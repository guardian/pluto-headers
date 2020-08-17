interface JwtDataShape {
  aud: string;
  iss: string;
  iat: number;
  exp: number;
  sub?: string;
  email?: string;
  first_name?: string;
  family_name?: string;
  username?: string;
  location?: string;
  job_title?: string;
  authmethod?: string;
  auth_time?: string;
  ver?: string;
  appid?: string;
}
declare function JwtData(jwtData: object): JwtDataShape;
export type { JwtDataShape };
export { JwtData };
