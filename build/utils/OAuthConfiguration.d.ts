interface OAuthConfigurationIF {
    clientId: string;
    resource: string;
    oAuthUri: string;
    tokenUri: string;
    adminClaimName: string;
}
declare const OAuthConfigurationIF: import("ts-interface-checker").Checker;
declare class OAuthConfiguration implements OAuthConfigurationIF {
    clientId: string;
    resource: string;
    oAuthUri: string;
    tokenUri: string;
    adminClaimName: string;
    constructor(from: any, validate?: boolean);
    /**
     * returns a boolean indicating whether the frontend should treat this user as an admin or not
     * @param claimData
     */
    isAdmin(claimData: any): any;
}
export type { OAuthConfigurationIF };
export default OAuthConfiguration;
