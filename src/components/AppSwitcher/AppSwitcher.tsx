import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./AppSwitcher.css";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { Menu, MenuItem, Button } from "@material-ui/core";
import { loadInSigningKey, validateAndDecode } from "../../utils/JwtHelpers";
import { JwtData } from "../../utils/DecodedProfile";
import {
  hrefIsTheSameDeploymentRootPath,
  getDeploymentRootPathLink,
} from "../../utils/AppLinks";

type MenuType = "link" | "submenu";

interface BaseMenuSettings {
  type: MenuType;
  text: string;
  href: string;
  adminOnly?: boolean;
}

interface AppSwitcherMenuSettings extends BaseMenuSettings {
  content?: BaseMenuSettings[];
}

interface AppSwitcherProps {
  onLoggedIn?: () => void;
  onLoggedOut?: () => void;
}

export const AppSwitcher: React.FC<AppSwitcherProps> = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [menuSettings, setMenuSettings] = useState<AppSwitcherMenuSettings[]>(
    []
  );
  const [clientId, setClientId] = useState<string>("");
  const [resource, setResource] = useState<string>("");
  const [oAuthUri, setOAuthUri] = useState<string>("");
  const [adminClaimName, setAdminClaimName] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch("/meta/menu-config/menu.json");

        if (response.status === 200) {
          const data = await response.json();

          setMenuSettings(data);
        }
      } catch (error) {
        console.error(error);
      }

      try {
        const response = await fetch("/meta/oauth/config.json");
        if (response.status === 200) {
          const data = await response.json();
          setClientId(data.clientId);
          setResource(data.resource);
          setOAuthUri(data.oAuthUri);
          setAdminClaimName(data.adminClaimName);
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadConfig();

    const validateToken = async () => {
      const token = sessionStorage.getItem("pluto:access-token");
      if (!token) return;

      try {
        let signingKey = sessionStorage.getItem("adfs-test:signing-key");
        if (!signingKey) signingKey = await loadInSigningKey();

        const decodedData = await validateAndDecode(token, signingKey);
        const loginData = JwtData(decodedData);

        if (!loginData) {
          setIsLoggedIn(false);
          setUsername("");
          setIsAdmin(false);
          console.error("Could not get jwt token data");
          return;
        }

        setIsLoggedIn(true);
        setUsername(loginData ? (loginData.username as string) : "");
        setIsAdmin((loginData as any)[adminClaimName]);
      } catch (error) {
        setIsLoggedIn(false);
        setUsername("");
        setIsAdmin(false);
        console.error("existing login token was not valid: ", error);
      }
    };

    validateToken();
  }, []);

  const openSubmenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const makeLoginUrl = () => {
    const currentUri = new URL(window.location.href);
    const redirectUri =
      currentUri.protocol + "//" + currentUri.host + "/oauth2/callback";

    const args: Record<string, string> = {
      response_type: "code",
      client_id: clientId,
      resource: resource,
      redirect_uri: redirectUri,
      state: currentUri.pathname,
    };

    const encoded = Object.entries(args).map(
      ([k, v]) => `${k}=${encodeURIComponent(v)}`
    );

    return oAuthUri + "?" + encoded.join("&");
  };

  const getLink = (
    text: string,
    href: string,
    adminOnly: boolean | undefined,
    index: number
  ) => (
    <li
      key={index}
      style={{
        display: adminOnly ? (isAdmin ? "inherit" : "none") : "inherit",
      }}
    >
      {hrefIsTheSameDeploymentRootPath(href) ? (
        <Link to={getDeploymentRootPathLink(href)}>{text}</Link>
      ) : (
        <a href={href}>{text}</a>
      )}
    </li>
  );

  return (
    <>
      {isLoggedIn ? (
        <div className="app-switcher-container">
          <ul className="app-switcher">
            {(menuSettings || []).map(
              ({ type, text, href, adminOnly, content }, index) =>
                type === "link" ? (
                  getLink(text, href, adminOnly, index)
                ) : (
                  <li
                    key={`${index}-submenu`}
                    style={{
                      display: adminOnly
                        ? isAdmin
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
                                display: adminOnly
                                  ? isAdmin
                                    ? "inherit"
                                    : "none"
                                  : "inherit",
                              }}
                              onClick={() => {
                                closeMenu();
                                window.location.assign(href);
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
              You are logged in as <span className="username">{username}</span>
            </span>
            <span>
              <Button
                className="login-button"
                variant="outlined"
                size="small"
                onClick={() => {
                  if (props.onLoggedOut) {
                    props.onLoggedOut();
                    return;
                  }

                  window.location.assign("/logout");
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
                  return;
                }

                // Perform login
                window.location.assign(makeLoginUrl());
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
