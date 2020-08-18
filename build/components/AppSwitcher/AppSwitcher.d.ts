import React from "react";
import "./AppSwitcher.css";
import { JwtDataShape } from "../../utils/DecodedProfile";
interface AppSwitcherProps {
    onLoggedIn?: () => void;
    onLoggedOut?: () => void;
    onLoginValid?: (valid: boolean, jwtDataShape?: JwtDataShape) => void;
}
export declare const AppSwitcher: React.FC<AppSwitcherProps>;
export {};
