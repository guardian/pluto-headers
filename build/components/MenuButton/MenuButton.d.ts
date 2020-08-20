import React from "react";
import "./MenuButton.css";
interface MenuButtonProps {
    isAdmin: boolean;
    index: number;
    text: string;
    adminOnly: boolean | undefined;
    content: BaseMenuSettings[] | undefined;
}
export declare const MenuButton: React.FC<MenuButtonProps>;
export {};
