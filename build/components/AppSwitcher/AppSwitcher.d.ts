import React from "react";
import "./AppSwitcher.css";
declare type MenuType = "link" | "submenu";
interface BaseMenuSettings {
  type: MenuType;
  text: string;
  href: string;
  adminOnly?: boolean;
}
export interface AppSwitcherMenuSettings extends BaseMenuSettings {
  content?: BaseMenuSettings[];
}
interface AppSwitcherProps {
  menuSettings: AppSwitcherMenuSettings[];
  isAdmin: boolean;
  isLoggedIn: boolean;
  username: string;
  onLoggedIn: () => void;
  onLoggedOut: () => void;
}
export declare const AppSwitcher: React.FC<AppSwitcherProps>;
export {};
