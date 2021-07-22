import React from "react";
import { JwtDataShape } from "../../utils/DecodedProfile";
interface LoginComponentProps {
    refreshToken?: string;
    checkInterval?: number;
    loginData: JwtDataShape;
    onLoginRefreshed?: () => void;
    onLoginCantRefresh?: (reason: string) => void;
    onLoginExpired: () => void;
    onLoggedOut?: () => void;
    overrideRefreshLogin?: (tokenUri: string) => Promise<void>;
    tokenUri: string;
}
declare const LoginComponent: React.FC<LoginComponentProps>;
export default LoginComponent;
