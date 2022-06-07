import React, {useContext, useState} from "react";
import {Link} from "react-router-dom";
import "./AppSwitcher.css";
import {Button} from "@material-ui/core";
import {JwtDataShape} from "../../utils/DecodedProfile";
import {getDeploymentRootPathLink, hrefIsTheSameDeploymentRootPath,} from "../../utils/AppLinks";
import {MenuButton} from "../MenuButton/MenuButton";
import LoginComponent from "./LoginComponent";
import {makeLoginUrl, OAuthContext} from "../Context/OAuthContext";
import {SystemNotifcationKind, SystemNotification} from "../SystemNotification/SystemNotification";
import {UserContext} from "../Context/UserContext";

interface AppSwitcherProps {
  onLoggedIn?: () => void;
  onLoggedOut?: () => void;
  onLoginValid?: (valid: boolean, jwtDataShape?: JwtDataShape) => void;
}

export const AppSwitcher: React.FC<AppSwitcherProps> = (props) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [expired, setExpired] = useState<boolean>(false);

  // config
  const [menuSettings, setMenuSettings] = useState<AppSwitcherMenuSettings[]>(
    []
  );

  const oAuthContext = useContext(OAuthContext);
  const userContext = useContext(UserContext);

  const getLink = (
    text: string,
    href: string,
    adminOnly: boolean | undefined,
    index: number
  ) => (
    <li
      key={index}
      style={{
        display: adminOnly ? (userContext.profile ? "inherit" : "none") : "inherit",
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
                  text={text}
                  adminOnly={adminOnly}
                  content={content}
                />
              )
            )}
          </ul>
          <LoginComponent onLoggedOut={props.onLoggedOut}
                          onLoginExpired={()=>{
                            setExpired(true);
                            setIsLoggedIn(false);
                          }}
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

                if(oAuthContext) {
                  // Perform login
                  window.location.assign(makeLoginUrl(oAuthContext));
                } else {
                  SystemNotification.open(SystemNotifcationKind.Error, "Could not load authentication configuration")
                }
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
