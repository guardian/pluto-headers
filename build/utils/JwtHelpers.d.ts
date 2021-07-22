import jwt, { JwtPayload } from "jsonwebtoken";
import { JwtDataShape } from "./DecodedProfile";
/**
 * perform the validation of the token via jsonwebtoken library.
 * if validation fails then the returned promise is rejected
 * if validation succeeds, then the promise only completes once the decoded content has been set into the state.
 * @returns {Promise<object>} Decoded JWT content or rejects with an error
 */
declare function verifyJwt(token: string, signingKey: string, refreshToken?: string): Promise<jwt.JwtPayload | undefined>;
/**
 * perform the validation of the token via jsonwebtoken library.
 * if validation fails then the returned promise is rejected
 * if validation succeeds, then the promise only completes once the decoded content has been set into the state.
 * @returns {Promise<object>} Decoded JWT content or rejects with an error
 */
declare function validateAndDecode(token: string, signingKey: string, refreshToken?: string): Promise<JwtPayload | undefined>;
/**
 * gets the signing key from the server
 * @returns {Promise<string>} Raw content of the signing key in PEM format
 */
declare function loadInSigningKey(): Promise<string>;
/**
 * returns the raw JWT for passing to backend services
 * @returns {string} the JWT, or null if it is not set.
 */
declare function getRawToken(): string | null;
/**
 * helper function that validates and decodes into a user profile a token already existing in the localstorage
 */
declare function verifyExistingLogin(): Promise<JwtDataShape | undefined>;
export { validateAndDecode, loadInSigningKey, getRawToken, verifyJwt, verifyExistingLogin };
