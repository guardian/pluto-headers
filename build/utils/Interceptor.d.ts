import { AxiosResponse } from "axios";
interface RefreshTokenResponse {
    access_token: string;
    refresh_token: string;
}
interface PlutoConfig {
    tokenUri: string;
    clientId: string;
}
/**
 * Refreshes a token e.g. an expired token and returns an active token.
 */
export declare const refreshToken: (plutoConfig: PlutoConfig) => Promise<RefreshTokenResponse>;
/**
 * Retries the API call with a refresh token on 401 Unauthorized.
 */
export declare const handleUnauthorized: (plutoConfig: PlutoConfig, error: any, failureCallback: () => void) => Promise<AxiosResponse | void>;
export {};
