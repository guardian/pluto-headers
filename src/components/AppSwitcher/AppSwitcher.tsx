import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./AppSwitcher.css";
import { Button } from "@material-ui/core";
import { loadInSigningKey, validateAndDecode } from "../../utils/JwtHelpers";
import { JwtData, JwtDataShape } from "../../utils/DecodedProfile";
import {
  hrefIsTheSameDeploymentRootPath,
  getDeploymentRootPathLink,
} from "../../utils/AppLinks";
import { MenuButton } from "../MenuButton/MenuButton";

interface AppSwitcherProps {
  onLoggedIn?: () => void;
  onLoggedOut?: () => void;
  onLoginValid?: (valid: boolean, jwtDataShape?: JwtDataShape) => void;
}

export const AppSwitcher: React.FC<AppSwitcherProps> = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [loginData, setLoginData] = useState<JwtDataShape | null>(null);
  const [expired, setExpired] = useState<boolean>(false);
  const [checkExpiryTimer, setCheckExpiryTimer] = useState<number | undefined>(
    undefined
  );

  // config
  const [menuSettings, setMenuSettings] = useState<AppSwitcherMenuSettings[]>(
    []
  );
  const [clientId, setClientId] = useState<string>("");
  const [resource, setResource] = useState<string>("");
  const [oAuthUri, setOAuthUri] = useState<string>("");
  const [adminClaimName, setAdminClaimName] = useState<string>("");

  /**
   * lightweight function that is called every minute to verify the state of the token
   * it returns a promise that resolves when the component state has been updated. In normal usage this
   * is ignored but it is used in testing to ensure that the component state is only checked after it has been set.
   */
  const checkExpiryHandler = () => {
    if (loginData) {
      const nowTime = new Date().getTime() / 1000; //assume time is in seconds
      //we know that it is not null due to above check
      const expiry = loginData.exp;
      const timeToGo = expiry ? expiry - nowTime : null;

      if ((timeToGo && timeToGo <= 0) || !timeToGo) {
        console.log("login has expired already");
        setExpired(true);
      }
    } else {
      console.log("no login data present for expiry check");
    }
  };

  useEffect(() => {
    setCheckExpiryTimer(window.setInterval(checkExpiryHandler, 60000));

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
        setLoginData(loginData);

        // Login valid callback if provided
        if (props.onLoginValid) {
          props.onLoginValid(true, loginData);
        }

        setIsLoggedIn(true);
        setUsername(loginData ? (loginData.username as string) : "");
        setIsAdmin((loginData as any)[adminClaimName]);
      } catch (error) {
        // Login valid callback if provided
        if (props.onLoginValid) {
          props.onLoginValid(false);
        }

        setIsLoggedIn(false);
        setUsername("");
        setIsAdmin(false);

        if (error.name === "TokenExpiredError") {
          console.error("Token has already expired");
          setExpired(true);
        } else {
          console.error("existing login token was not valid: ", error);
        }
      }
    };

    validateToken();

    return () => {
      if (checkExpiryTimer) {
        window.clearInterval(checkExpiryTimer);
      }
    };
  }, []);

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
            {(
              menuSettings || []
            ).map(({ type, text, href, adminOnly, content }, index) =>
              type === "link" ? (
                getLink(text, href, adminOnly, index)
              ) : (
                <MenuButton
                  key={index}
                  index={index}
                  isAdmin={isAdmin}
                  text={text}
                  adminOnly={adminOnly}
                  content={content}
                />
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
            {expired
              ? "Your login has expired"
              : "You are not currently logged in"}
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
              Login {expired ? "again" : ""}
            </Button>
          </span>
        </div>
      )}
    </>
  );
};
