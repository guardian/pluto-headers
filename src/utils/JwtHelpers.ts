import {JwtData, JwtDataShape} from "./DecodedProfile";
import {OAuthContextData} from "../components/Context/OAuthContext";
import {createRemoteJWKSet, jwtVerify, JWTVerifyGetKey} from "jose";
import {jwksFromUri} from "./jwks";

/**
 * perform the validation of the token via jsonwebtoken library.
 * if validation fails then the returned promise is rejected
 * if validation succeeds, then the promise only completes once the decoded content has been set into the state.
 * @returns {Promise<object>} Decoded JWT content or rejects with an error
 */
// function verifyJwt(oauthConfig: OAuthContextData, token: string, refreshToken?: string) {
//   /**
//    * "insert" function for the JWT library to obtain a signing key for verification.
//    *  Either gets the contents of the configurations `jwksUri` for JWKS verification or loads a static signing key
//    * as given by the configuration
//    * @param header JwtHeader provided by the library
//    * @param callback callback function provided by the library
//    */
//   const getKey:jwt.GetPublicKeyOrSecret = (header, callback) => {
//     console.log(oauthConfig);
//     console.log(header);
//     if(oauthConfig.jwksUri && header.kid) { //if we have a jwksUri, then use that
//       // const client = jwksRSA({
//       //   jwksUri: oauthConfig.jwksUri,
//       // });
//       // client.getSigningKey(header.kid, (err:Error, key: { getPublicKey: () => string | Buffer | { key: string | Buffer; passphrase: string; } | undefined; }) => {
//       //   callback(err, key?.getPublicKey())
//       // })
//
//       jwksFromUri(header.kid, header.alg, oauthConfig.jwksUri)
//           .then(rawKey=>{
//             callback(null, new Buffer(rawKey))
//           })
//           .catch(err=>callback(err, undefined))
//
//     } else {  //otherwise, fall back to a static signing key
//       console.log("Falling back to static key verification. Either oauthConfig.jwksUri is not set, or the JWT has no 'kid' parameter")
//       loadInSigningKey()
//           .then(key=>callback(null, key))
//           .catch(err=>callback(err, ""))
//     }
//   }
//
//   return new Promise<JwtPayload | undefined>((resolve, reject) => {
//     jwt.verify(token, getKey, (err, decoded) => {
//       if (err) {
//         console.log("token: ", token);
//         console.error("could not verify JWT: ", err);
//         reject(err);
//       } else {
//         window.localStorage.setItem("pluto:access-token", token); //it validates so save the token
//         if (refreshToken)
//           window.localStorage.setItem("pluto:refresh-token", refreshToken);
//         resolve(decoded);
//       }
//     });
//   });
// }
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
 * perform the validation of the token via jsonwebtoken library.
 * if validation fails then the returned promise is rejected
 * if validation succeeds, then the promise only completes once the decoded content has been set into the state.
 * @returns {Promise<object>} Decoded JWT content or rejects with an error
 */
// function validateAndDecode(token:string, signingKey:string, refreshToken?:string):Promise<JwtPayload|undefined> {
//   return new Promise((resolve, reject) => {
//     jwt.verify(token, signingKey, (err, decoded) => {
//       if (err) {
//         console.log("token: ", token);
//         console.log("signingKey: ", signingKey);
//         console.error("could not verify JWT: ", err);
//         reject(err);
//       }
//
//       window.localStorage.setItem("pluto:access-token", token); //it validates so save the token
//       if (refreshToken)
//         window.localStorage.setItem("pluto:refresh-token", refreshToken);
//       resolve(decoded);
//     });
//   });
// }

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
