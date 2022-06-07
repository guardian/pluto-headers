import React, { useEffect, useState } from "react";
import { red } from "@material-ui/core/colors";

interface OAuthContextData {
  clientId: string;
  resource?: string;
  scope?: string;
  oAuthUri: string;
  tokenUri: string;
  redirectUri: string;
  jwksUri?: string;
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
  const [resource, setResource] = useState(undefined);
  const [oAuthUri, setOAuthUri] = useState("");
  const [tokenUri, setTokenUri] = useState("");
  const [scope, setScope] = useState(undefined);
  const [haveData, setHaveData] = useState(false);
  const [jwksUri, setJwksUri] = useState<string|undefined>(undefined);

  const currentUri = new URL(window.location.href);
  const redirectUrl =
    currentUri.protocol + "//" + currentUri.host + "/oauth2/callback";

  const loadOauthData = async () => {
    const response = await fetch("/meta/oauth/config.json");
    switch (response.status) {
      case 200:
        const content = await response.json();

        setClientId(content.clientId);
        setResource(content.resource);
        setOAuthUri(content.oAuthUri);
        setTokenUri(content.tokenUri);
        setScope(content.scope);
        setJwksUri(content.jwksUri);
        setHaveData(true);
        if(props.onLoaded) {
          props.onLoaded(makeContext())
        }
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
        jwksUri: jwksUri
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
  console.log(oAuthContext.scope);
  console.log(encodeURIComponent(oAuthContext.scope ?? ""));

  if(oAuthContext.scope && oAuthContext.scope != "") {
    encoded.push(`scope=${encodeURIComponent(oAuthContext.scope)}`)
  }

  return oAuthContext.oAuthUri + "?" + encoded.join("&");
}

export type { OAuthContextData };

export {OAuthContext, OAuthContextProvider, makeLoginUrl, generateCodeChallenge};
