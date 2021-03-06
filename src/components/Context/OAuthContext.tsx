import React, { useEffect, useState } from "react";
import { red } from "@material-ui/core/colors";
import OAuthConfiguration from "../../utils/OAuthConfiguration";
import {UserContext} from "./UserContext";

interface OAuthContextData {
  clientId: string;
  resource?: string;
  scope?: string;
  oAuthUri: string;
  tokenUri: string;
  redirectUri: string;
  jwksUri?: string;
  adminClaimName?: string;
  logoutUri?: string;
}

const OAuthContext = React.createContext<OAuthContextData | undefined>(
  undefined
);

/**
 * Creates an OAuthContextProvider. This will load in the configuration from the expected path /meta/oauth/config.json
 * and propagate that data to all child components.
 * Properties:
 *  - onError - takes a string description of the error and returns nothing
 *  - onLoaded - called when the data has been successfully loaded. Passed a copy of the context data and returns nothing. Use this
 *              to verify a pre-existing token on initial load.
 *  - children - use this as a child container
 * @param props
 * @constructor
 */
const OAuthContextProvider: React.FC<{
  children: React.ReactFragment;
  onError?: (desc: string) => void;
  onLoaded?: (config:OAuthContextData) => void;
}> = (props) => {
  const [clientId, setClientId] = useState("");
  const [resource, setResource] = useState<string|undefined>(undefined);
  const [oAuthUri, setOAuthUri] = useState("");
  const [tokenUri, setTokenUri] = useState("");
  const [scope, setScope] = useState<string|undefined>(undefined);
  const [adminClaimName, setAdminClaimName] = useState<string>("");
  const [haveData, setHaveData] = useState(false);
  const [jwksUri, setJwksUri] = useState<string|undefined>(undefined);
  const [logoutUri, setLogoutUri] = useState<string|undefined>(undefined);

  const currentUri = new URL(window.location.href);
  const redirectUrl =
    currentUri.protocol + "//" + currentUri.host + "/oauth2/callback";

  const loadOauthData = async () => {
    const response = await fetch("/meta/oauth/config.json");
    switch (response.status) {
      case 200:
        const data = await response.json();
        const config = new OAuthConfiguration(data); //validates the configuration and throws a VError if it fails

        setClientId(config.clientId);
        setResource(config.resource);
        setOAuthUri(config.oAuthUri);
        setTokenUri(config.tokenUri);
        setScope(config.scope);
        setJwksUri(config.jwksUri);
        setAdminClaimName(config.adminClaimName);
        setLogoutUri(config.logoutUri);
        setHaveData(true);
        break;
      case 404:
        await response.text(); //consume body and discard it
        if (props.onError)
          props.onError(
            "Metadata not found on server, please contact administrator"
          ); //temporary until we have global snackbar
        break;
      default:
        await response.text(); //consume body and discard it
        if (props.onError)
          props.onError(
            `Server returned a ${response.status} error trying to access meetadata`
          );
        break;
    }
  };

  useEffect(()=> {
    if(haveData && props.onLoaded) props.onLoaded(makeContext());
  }, [haveData]);

  useEffect(() => {
    loadOauthData();
  }, []);

  const makeContext = () => ({
    clientId: clientId,
        resource: resource,
        oAuthUri: oAuthUri,
        tokenUri: tokenUri,
        redirectUri: redirectUrl,
        scope: scope,
        jwksUri: jwksUri,
    adminClaimName: adminClaimName,
    logoutUri: logoutUri,
  })

  return (
    <OAuthContext.Provider
      value={
        haveData
          ? makeContext()
          : undefined
      }
    >
      {props.children}
    </OAuthContext.Provider>
  );
};

/*
Generates a cryptographic random string and stores it in the session storage.
This is called by makeLoginUrl, you should not need to call it directly.
 */
function generateCodeChallenge() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const str = array.reduce<string>((acc:string, x) => acc + x.toString(16).padStart(2, '0'), "");
  sessionStorage.setItem("cx", str);
  return str;
}

function makeLoginUrl(oAuthContext: OAuthContextData) {
  const args = {
    response_type: "code",
    client_id: oAuthContext.clientId,
    redirect_uri: oAuthContext.redirectUri,
    state: "/",
    code_challenge: generateCodeChallenge()
  };

  let encoded = Object.entries(args).map(
      ([k, v]) => `${k}=${encodeURIComponent(v)}`
  );

  if(oAuthContext.resource && oAuthContext.resource != "") {
    encoded.push(`resource=${encodeURIComponent(oAuthContext.resource)}`);
  }

  if(oAuthContext.scope && oAuthContext.scope != "") {
    encoded.push(`scope=${encodeURIComponent(oAuthContext.scope)}`)
  }

  return oAuthContext.oAuthUri + "?" + encoded.join("&");
}

function isAdmin(oAuthContext:OAuthContextData|undefined, userProfile:UserContext) {
  if(userProfile.profile && userProfile.profile.roles && oAuthContext?.adminClaimName) { //new style - use the "roles" list
    const matches = userProfile.profile.roles.filter(r=>r===oAuthContext.adminClaimName);
    if(matches.length>0) {
      console.log(`User is an admin, roles ${userProfile.profile.roles} match admin claim ${oAuthContext.adminClaimName}`);
      return true;
    } else {
      console.log(`User is not an admin, roles ${userProfile.profile.roles} do not match admin claim ${oAuthContext.adminClaimName}`);
      return false;
    }
  }

  if(userProfile.profile && oAuthContext?.adminClaimName) { //old style - existence of group claim
    const maybeValue = userProfile.profile.hasOwnProperty(oAuthContext.adminClaimName);
    return maybeValue && userProfile.profile[oAuthContext.adminClaimName].toLowerCase() == "true"
  } else {
    console.warn("Can't check admin status because user profile is not loaded or oAuth config incomplete");
    return false;
  }
}

export type { OAuthContextData };

export {OAuthContext, OAuthContextProvider, makeLoginUrl, generateCodeChallenge, isAdmin};
