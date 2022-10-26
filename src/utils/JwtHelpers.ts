import {JwtData, JwtDataShape} from "./DecodedProfile";
import {OAuthContextData} from "../components/Context/OAuthContext";
import {createRemoteJWKSet, jwtVerify, importX509, importSPKI, KeyLike, ResolvedKey, JWTVerifyResult} from "jose";

async function decodeSigningKey(rawKey:string):Promise<KeyLike|null> {
  if(rawKey.includes("CERTIFICATE")) { //load as an x509
    return importX509(rawKey, "RS256"); //assume 256 bit RSA key
  } else if(rawKey.includes("PUBLIC KEY")) {
    return importSPKI(rawKey, "RS256");
  } else {
    console.log("signingKey does not have either a certificate or public key header, assuming HMAC key");
    return null;
  }
}

/**
 * perform the validation of the token via jsonwebtoken library.
 * if validation fails then the returned promise is rejected
 * if validation succeeds, then the promise only completes once the decoded content has been set into the state.
 * @returns {Promise<object>} Decoded JWT content or rejects with an error
 *
 */
async function verifyJwt(oauthConfig:OAuthContextData, token: string, refreshToken?: string) {
  async function loadAndVerify(): Promise<JWTVerifyResult> {
    if (oauthConfig.jwksUri) {
      const JWKS = createRemoteJWKSet(new URL(oauthConfig.jwksUri));
      return jwtVerify(token, JWKS);

    } else {  //otherwise, fall back to a static signing key
      console.log("Falling back to static key verification. Either oauthConfig.jwksUri is not set, or the JWT has no 'kid' parameter")
      const rawKey = await loadInSigningKey();
      //signing key could be either a public key or a cert. Need different loading functions for each of them.
      const key = await decodeSigningKey(rawKey);
      return jwtVerify(token, (protectedHeader)=>{
        if(protectedHeader.alg=="HS256") {  //if it's an HMAC signature then the "signing key" is actually a passphrase
          const decoder = new TextEncoder();
          return Uint8Array.from(decoder.encode(rawKey));  //need raw bytes
        } else {
          if(key) {
            return key;
          } else {
            throw `Cannot use HMAC verification on ${protectedHeader.alg}`
          }
        }
      });
    }
  }

  const {payload, protectedHeader} = await loadAndVerify();

  window.localStorage.setItem("pluto:access-token", token); //it validates so save the token
  if(refreshToken) window.localStorage.setItem("pluto:refresh-token", refreshToken);
  return payload;
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
