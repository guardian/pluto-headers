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
import OAuthConfiguration from "../../utils/OAuthConfiguration";
import { VError } from "ts-interface-checker";
import LoginComponent from "./LoginComponent";

interface AppSwitcherProps {
  onLoggedIn?: () => void;
  onLoggedOut?: () => void;
  onLoginValid?: (valid: boolean, jwtDataShape?: JwtDataShape) => void;
}

export const AppSwitcher: React.FC<AppSwitcherProps> = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loginData, setLoginData] = useState<JwtDataShape | null>(null);
  const [expired, setExpired] = useState<boolean>(false);

  // config
  const [menuSettings, setMenuSettings] = useState<AppSwitcherMenuSettings[]>(
    []
  );
  const [clientId, setClientId] = useState<string>("");
  const [resource, setResource] = useState<string>("");
  const [oAuthUri, setOAuthUri] = useState<string>("");
  const [adminClaimName, setAdminClaimName] = useState<string>("");
  const [tokenUri, setTokenUri] = useState<string>("");


  const loadConfig: () => Promise<OAuthConfiguration> = async () => {
    try {
      const response = await fetch("/meta/menu-config/menu.json");

      if (response.status === 200) {
        const data = await response.json();

        setMenuSettings(data);
      }
    } catch (error) {
      console.error(error);
    }

    const response = await fetch("/meta/oauth/config.json");
    if (response.status === 200) {
      const data = await response.json();
      const config = new OAuthConfiguration(data); //validates the configuration and throws a VError if it fails
      setClientId(config.clientId);
      setResource(config.resource);
      setOAuthUri(config.oAuthUri);
      setTokenUri(config.tokenUri);
      setAdminClaimName(config.adminClaimName);
      return config;
    } else {
      throw `Server returned ${response.status}`;
    }
  };

  const validateToken: (config: OAuthConfiguration) => Promise<void> = async (
    config: OAuthConfiguration
  ) => {
    const token = window.localStorage.getItem("pluto:access-token");
    if (!token) return;

    try {
      const signingKey = await loadInSigningKey();

      const decodedData = await validateAndDecode(token, signingKey);
      const loginData = JwtData(decodedData);
      setLoginData(loginData);

      // Login valid callback if provided
      if (props.onLoginValid) {
        props.onLoginValid(true, loginData);
      }

      setIsLoggedIn(true);

      setIsAdmin(config.isAdmin(loginData));
    } catch (error) {
      // Login valid callback if provided
      if (props.onLoginValid) {
        props.onLoginValid(false);
      }

      setIsLoggedIn(false);
      setIsAdmin(false);

      if (error.name === "TokenExpiredError") {
        console.error("Token has already expired");
        setExpired(true);
      } else {
        console.error("existing login token was not valid: ", error);
      }
    }
  };

  useEffect(() => {

    loadConfig()
      .then((config) => {
        validateToken(config);
      })
      .catch((err) => {
        if (err instanceof VError) {
          console.log("OAuth configuration was not valid: ", err);
        } else {
          console.log("Could not load oauth configuration: ", err);
        }
      });
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
      {isLoggedIn && loginData ? (
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
          <LoginComponent loginData={loginData}
                          onLoggedOut={props.onLoggedOut}
                          onLoginExpired={()=>{
                            setExpired(true);
                            setIsLoggedIn(false);
                          }}
                          tokenUri={tokenUri}
          />
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
