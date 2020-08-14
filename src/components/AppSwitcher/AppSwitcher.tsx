import React from "react";
import { Link } from "react-router-dom";
import "./AppSwitcher.css";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { Menu, MenuItem, Button } from "@material-ui/core";

type MenuType = "link" | "submenu";

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

export const AppSwitcher: React.FC<AppSwitcherProps> = (props) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const openSubmenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const menuSettings = props.menuSettings || [];

  const getLink = (
    text: string,
    href: string,
    adminOnly: boolean | undefined,
    index: number
  ) => (
    <li
      key={index}
      style={{
        display: adminOnly ? (props.isAdmin ? "inherit" : "none") : "inherit",
      }}
    >
      <Link to={href}>{text}</Link>
    </li>
  );

  return (
    <>
      {props.isLoggedIn ? (
        <div className="app-switcher-container">
          <ul className="app-switcher">
            {menuSettings.map(
              ({ type, text, href, adminOnly, content }, index) =>
                type === "link" ? (
                  getLink(text, href, adminOnly, index)
                ) : (
                  <li
                    key={`${index}-submenu`}
                    style={{
                      display: adminOnly
                        ? props.isAdmin
                          ? "inherit"
                          : "none"
                        : "inherit",
                    }}
                  >
                    <button
                      className="submenu-button"
                      aria-controls={`simple-menu-${index}`}
                      aria-haspopup="true"
                      onClick={openSubmenu}
                    >
                      {text}
                      <ArrowDropDownIcon
                        style={{ fontSize: "16px" }}
                      ></ArrowDropDownIcon>
                    </button>
                    <Menu
                      id={`simple-menu-${index}`}
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
                      keepMounted
                      open={Boolean(anchorEl)}
                      onClose={closeMenu}
                    >
                      {(content || []).map(
                        ({ type, text, href, adminOnly }, index) => {
                          if (type === "submenu") {
                            console.error(
                              "You have provided a submenu inside a submenu, nested submenus are not supported!"
                            );
                            return;
                          }
                          return (
                            <MenuItem
                              key={`${index}-menu-item`}
                              style={{
                                display: adminOnly
                                  ? props.isAdmin
                                    ? "inherit"
                                    : "none"
                                  : "inherit",
                              }}
                              component={Link}
                              to={href}
                              onClick={() => {
                                closeMenu();
                              }}
                            >
                              {text}
                            </MenuItem>
                          );
                        }
                      )}
                    </Menu>
                  </li>
                )
            )}
          </ul>
          <div>
            <span>
              You are logged in as{" "}
              <span className="username">{props.username}</span>
            </span>
            <span>
              <Button
                className="login-button"
                variant="outlined"
                size="small"
                onClick={() => {
                  if (props.onLoggedOut) {
                    props.onLoggedOut();
                  }
                }}
              >
                Logout
              </Button>
            </span>
          </div>
        </div>
      ) : (
        <div className="app-switcher-container">
          <span className="not-logged-in">
            You are not currently logged in
            <Button
              className="login-button"
              variant="outlined"
              size="small"
              onClick={() => {
                if (props.onLoggedIn) {
                  props.onLoggedIn();
                }
              }}
            >
              Login
            </Button>
          </span>
        </div>
      )}
    </>
  );
};
