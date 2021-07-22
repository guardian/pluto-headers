import React from "react";
interface OAuthContextData {
    clientId: string;
    resource: string;
    oAuthUri: string;
    tokenUri: string;
    redirectUri: string;
}
declare const OAuthContext: React.Context<OAuthContextData | undefined>;
declare const OAuthContextProvider: React.FC<{
    children: React.ReactFragment;
    onError?: (desc: string) => void;
}>;
declare function makeLoginUrl(oAuthContext: OAuthContextData): string;
export type { OAuthContextData };
export { OAuthContext, OAuthContextProvider, makeLoginUrl };
