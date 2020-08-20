import React, { useState } from "react";
import { Link } from "react-router-dom";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { Menu, MenuItem } from "@material-ui/core";
import {
  hrefIsTheSameDeploymentRootPath,
  getDeploymentRootPathLink,
} from "../../utils/AppLinks";
import "./MenuButton.css";

interface MenuButtonProps {
  isAdmin: boolean;
  index: number;
  text: string;
  adminOnly: boolean | undefined;
  content: BaseMenuSettings[] | undefined;
}

export const MenuButton: React.FC<MenuButtonProps> = (props) => {
  const { index, isAdmin, text, adminOnly, content } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const openSubmenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  return (
    <li
      key={index}
      style={{
        display: adminOnly ? (isAdmin ? "inherit" : "none") : "inherit",
      }}
    >
      <button
        className="submenu-button"
        aria-controls={`pluto-menu-button-${index}`}
        aria-haspopup="true"
        onClick={openSubmenu}
      >
        {text}
        <ArrowDropDownIcon style={{ fontSize: "16px" }}></ArrowDropDownIcon>
      </button>
      <Menu
        id={`pluto-menu-button-${index}`}
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        open={Boolean(anchorEl)}
        onClose={closeMenu}
      >
        {(content || []).map(({ type, text, href, adminOnly }, index) => {
          if (type === "submenu") {
            console.error(
              "You have provided a submenu inside a submenu, nested submenus are not supported!"
            );
            return;
          }

          if (hrefIsTheSameDeploymentRootPath(href)) {
            return (
              <MenuItem
                key={`${index}-menu-item`}
                style={{
                  display: adminOnly
                    ? isAdmin
                      ? "inherit"
                      : "none"
                    : "inherit",
                }}
                component={Link}
                to={getDeploymentRootPathLink(href)}
                onClick={() => {
                  closeMenu();
                }}
              >
                {text}
              </MenuItem>
            );
          }

          return (
            <MenuItem
              key={`${index}-menu-item`}
              style={{
                display: adminOnly ? (isAdmin ? "inherit" : "none") : "inherit",
              }}
              onClick={() => {
                closeMenu();
                window.location.assign(href);
              }}
            >
              {text}
            </MenuItem>
          );
        })}
      </Menu>
    </li>
  );
};
