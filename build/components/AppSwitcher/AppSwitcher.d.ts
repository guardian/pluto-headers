import React from "react";
import "./AppSwitcher.css";
interface AppSwitcherProps {
    onLoggedIn?: () => void;
    onLoggedOut?: () => void;
}
export declare const AppSwitcher: React.FC<AppSwitcherProps>;
export {};
