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

function JwtData(jwtData: object) {
  return new Proxy(<JwtDataShape>jwtData, {
    get(target, prop) {
      switch (prop) {
        default:
          return (<any>target)[prop] ?? null;
      }
    },
  });
}

export type { JwtDataShape };
export { JwtData };