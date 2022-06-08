import {JwtData, JwtDataShape} from "./DecodedProfile";
import {OAuthContextData} from "../components/Context/OAuthContext";
import {createRemoteJWKSet, jwtVerify} from "jose";

/**
 * perform the validation of the token via jsonwebtoken library.
 * if validation fails then the returned promise is rejected
 * if validation succeeds, then the promise only completes once the decoded content has been set into the state.
 * @returns {Promise<object>} Decoded JWT content or rejects with an error
 *
 */
async function verifyJwt(oauthConfig:OAuthContextData, token: string, refreshToken?: string) {
     if(oauthConfig.jwksUri) {
       const JWKS = createRemoteJWKSet(new URL(oauthConfig.jwksUri));
       const {payload, protectedHeader} = await jwtVerify(token, JWKS);
       console.log("verification successful: ");
       console.log(payload);
       console.log(protectedHeader);
       window.localStorage.setItem("pluto:access-token", token); //it validates so save the token
       if(refreshToken) window.localStorage.setItem("pluto:refresh-token", refreshToken);
       return payload;

     } else {  //otherwise, fall back to a static signing key
       console.log("Falling back to static key verification. Either oauthConfig.jwksUri is not set, or the JWT has no 'kid' parameter")
       // const rawKey = await loadInSigningKey();
       // const {payload, protectedHeader} = await jwtVerify(token, rawKey)
       throw "not implemented"
     }
}

/**
 * gets the signing key from the server
 * @returns {Promise<string>} Raw content of the signing key in PEM format
 */
async function loadInSigningKey() {
  const result = await fetch("/meta/oauth/publickey.pem");
  switch (result.status) {
    case 200:
      return result.text();
    default:
      console.error(
          "could not retrieve signing key, server gave us ",
          result.status
      );
      throw "Could not retrieve signing key";
  }
}

/**
 * returns the raw JWT for passing to backend services
 * @returns {string} the JWT, or null if it is not set.
 */
function getRawToken() {
  return window.localStorage.getItem("pluto:access-token");
}

/**
 * helper function that validates and decodes into a user profile a token already existing in the localstorage
 */
async function verifyExistingLogin(oAuthData:OAuthContextData): Promise<JwtDataShape | undefined> {
  const token = getRawToken();
  if (token) {
    const jwtPayload = await verifyJwt(oAuthData, token);
    return jwtPayload ? JwtData(jwtPayload) : undefined;
  }
}



export { loadInSigningKey, getRawToken, verifyJwt, verifyExistingLogin };
