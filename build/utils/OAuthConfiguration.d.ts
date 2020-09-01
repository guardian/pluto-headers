declare class OAuthConfiguration {
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
export default OAuthConfiguration;
