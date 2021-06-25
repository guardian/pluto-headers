interface JwtDataShape {
    aud: string;
    iss: string;
    iat: number;
    iat_moment: Date;
    exp: number;
    exp_moment: Date;
    sub?: string;
    email?: string;
    first_name?: string;
    given_name?: string;
    family_name?: string;
    username?: string;
    preferred_username?: string;
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
