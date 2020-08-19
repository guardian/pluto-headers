import React, { useState, useEffect, createElement } from 'react';
import { Link } from 'react-router-dom';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { Menu, MenuItem, Button } from '@material-ui/core';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import qs from 'query-string';

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = ".app-switcher-container {\n  display: flex;\n  background-color: #dee2e3;\n  height: 30px;\n  padding: 6px;\n  border-bottom: 1px solid #d2d2d2;\n  font-size: 14px;\n}\n\n.app-switcher-container .username {\n  font-weight: 700;\n  font-size: 16px;\n}\n\n.app-switcher-container .not-logged-in {\n  width: 100%;\n  display: flex;\n  justify-content: flex-end;\n  align-items: center;\n}\n\n.app-switcher-container .login-button,\n.app-switcher-container .not-logged-in .logout-button {\n  margin-left: 10px;\n}\n\nul.app-switcher {\n  display: flex;\n  align-items: center;\n  list-style-type: none;\n  margin: 0;\n  padding: 0;\n  flex-grow: 1;\n}\n\nul.app-switcher li {\n  padding: 0 10px;\n  margin-bottom: 0;\n}\n\nul.app-switcher li button.submenu-button,\nul.app-switcher li a {\n  color: #5d5d5d;\n}\n\nul.app-switcher li a {\n  text-decoration: none;\n}\n\nul.app-switcher li button.submenu-button:hover,\nul.app-switcher li a:hover {\n  color: #181818;\n}\n\nul.app-switcher li button.submenu-button:focus,\nul.app-switcher li a:focus {\n  color: #181818;\n  outline: none;\n}\n\nul.app-switcher li button.submenu-button {\n  display: flex;\n  align-items: center;\n  background-color: transparent;\n  border: none;\n  box-sizing: content-box;\n  cursor: pointer;\n  font: inherit;\n  height: auto;\n  padding: 0;\n  text-transform: none;\n  letter-spacing: unset;\n  margin-bottom: 0;\n}\n";
styleInject(css_248z);

/**
 * perform the validation of the token via jsonwebtoken library.
 * if validation fails then the returned promise is rejected
 * if validation succeeds, then the promise only completes once the decoded content has been set into the state.
 * @returns {Promise<object>} Decoded JWT content or rejects with an error
 */
function validateAndDecode(token, signingKey, refreshToken) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, signingKey, (err, decoded) => {
      if (err) {
        console.log("token: ", token);
        console.log("signingKey: ", signingKey);
        console.error("could not verify JWT: ", err);
        reject(err);
      }
      // console.log("decoded JWT");
      sessionStorage.setItem("pluto:access-token", token); //it validates so save the token
      if (refreshToken)
        sessionStorage.setItem("pluto:refresh-token", refreshToken);
      resolve(decoded);
    });
  });
}

/**
 * gets the signing key from the server
 * @returns {Promise<string>} Raw content of the signing key in PEM format
 */
async function loadInSigningKey() {
  const result = await fetch("/meta/oauth/publickey.pem");
  switch (result.status) {
    case 200:
      return result.text();
    default:
      console.error(
        "could not retrieve signing key, server gave us ",
        result.status
      );
      throw "Could not retrieve signing key";
  }
}

function JwtData(jwtData) {
    return new Proxy(jwtData, {
        get(target, prop) {
            var _a;
            switch (prop) {
                default:
                    return (_a = target[prop]) !== null && _a !== void 0 ? _a : null;
            }
        },
    });
}

const hrefIsTheSameDeploymentRootPath = (href) => {
    let deployment = "";
    try {
        deployment = deploymentRootPath;
    }
    catch (_a) {
        deployment = "";
    }
    if (!deployment) {
        return false;
    }
    return href !== "/" && href.includes(deployment);
};
const getDeploymentRootPathLink = (href) => {
    const link = href.split(deploymentRootPath)[1];
    return link.startsWith("/") ? link : `/${link}`;
};

const AppSwitcher = (props) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [username, setUsername] = useState("");
    const [loginData, setLoginData] = useState(null);
    const [expired, setExpired] = useState(false);
    const [checkExpiryTimer, setCheckExpiryTimer] = useState(undefined);
    // config
    const [menuSettings, setMenuSettings] = useState([]);
    const [clientId, setClientId] = useState("");
    const [resource, setResource] = useState("");
    const [oAuthUri, setOAuthUri] = useState("");
    const [adminClaimName, setAdminClaimName] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);
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
        }
        else {
            console.log("no login data present for expiry check");
        }
    };
    useEffect(() => {
        setCheckExpiryTimer(window.setInterval(checkExpiryHandler, 60000));
        const loadConfig = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const response = yield fetch("/meta/menu-config/menu.json");
                if (response.status === 200) {
                    const data = yield response.json();
                    setMenuSettings(data);
                }
            }
            catch (error) {
                console.error(error);
            }
            try {
                const response = yield fetch("/meta/oauth/config.json");
                if (response.status === 200) {
                    const data = yield response.json();
                    setClientId(data.clientId);
                    setResource(data.resource);
                    setOAuthUri(data.oAuthUri);
                    setAdminClaimName(data.adminClaimName);
                }
            }
            catch (error) {
                console.error(error);
            }
        });
        loadConfig();
        const validateToken = () => __awaiter(void 0, void 0, void 0, function* () {
            const token = sessionStorage.getItem("pluto:access-token");
            if (!token)
                return;
            try {
                let signingKey = sessionStorage.getItem("adfs-test:signing-key");
                if (!signingKey)
                    signingKey = yield loadInSigningKey();
                const decodedData = yield validateAndDecode(token, signingKey);
                const loginData = JwtData(decodedData);
                setLoginData(loginData);
                // Login valid callback if provided
                if (props.onLoginValid) {
                    props.onLoginValid(true, loginData);
                }
                setIsLoggedIn(true);
                setUsername(loginData ? loginData.username : "");
                setIsAdmin(loginData[adminClaimName]);
            }
            catch (error) {
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
                }
                else {
                    console.error("existing login token was not valid: ", error);
                }
            }
        });
        validateToken();
        return () => {
            if (checkExpiryTimer) {
                window.clearInterval(checkExpiryTimer);
            }
        };
    }, []);
    const openSubmenu = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const closeMenu = () => {
        setAnchorEl(null);
    };
    const makeLoginUrl = () => {
        const currentUri = new URL(window.location.href);
        const redirectUri = currentUri.protocol + "//" + currentUri.host + "/oauth2/callback";
        const args = {
            response_type: "code",
            client_id: clientId,
            resource: resource,
            redirect_uri: redirectUri,
            state: currentUri.pathname,
        };
        const encoded = Object.entries(args).map(([k, v]) => `${k}=${encodeURIComponent(v)}`);
        return oAuthUri + "?" + encoded.join("&");
    };
    const getLink = (text, href, adminOnly, index) => (React.createElement("li", { key: index, style: {
            display: adminOnly ? (isAdmin ? "inherit" : "none") : "inherit",
        } }, hrefIsTheSameDeploymentRootPath(href) ? (React.createElement(Link, { to: getDeploymentRootPathLink(href) }, text)) : (React.createElement("a", { href: href }, text))));
    return (React.createElement(React.Fragment, null, isLoggedIn ? (React.createElement("div", { className: "app-switcher-container" },
        React.createElement("ul", { className: "app-switcher" }, (menuSettings || []).map(({ type, text, href, adminOnly, content }, index) => type === "link" ? (getLink(text, href, adminOnly, index)) : (React.createElement("li", { key: `${index}-submenu`, style: {
                display: adminOnly
                    ? isAdmin
                        ? "inherit"
                        : "none"
                    : "inherit",
            } },
            React.createElement("button", { className: "submenu-button", "aria-controls": `simple-menu-${index}`, "aria-haspopup": "true", onClick: openSubmenu },
                text,
                React.createElement(ArrowDropDownIcon, { style: { fontSize: "16px" } })),
            React.createElement(Menu, { id: `simple-menu-${index}`, anchorEl: anchorEl, getContentAnchorEl: null, anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "center",
                }, transformOrigin: {
                    vertical: "top",
                    horizontal: "center",
                }, keepMounted: true, open: Boolean(anchorEl), onClose: closeMenu }, (content || []).map(({ type, text, href, adminOnly }, index) => {
                if (type === "submenu") {
                    console.error("You have provided a submenu inside a submenu, nested submenus are not supported!");
                    return;
                }
                if (hrefIsTheSameDeploymentRootPath(href)) {
                    return (React.createElement(MenuItem, { key: `${index}-menu-item`, style: {
                            display: adminOnly
                                ? isAdmin
                                    ? "inherit"
                                    : "none"
                                : "inherit",
                        }, component: Link, to: getDeploymentRootPathLink(href), onClick: () => {
                            closeMenu();
                        } }, text));
                }
                return (React.createElement(MenuItem, { key: `${index}-menu-item`, style: {
                        display: adminOnly
                            ? isAdmin
                                ? "inherit"
                                : "none"
                            : "inherit",
                    }, onClick: () => {
                        closeMenu();
                        window.location.assign(href);
                    } }, text));
            })))))),
        React.createElement("div", null,
            React.createElement("span", null,
                "You are logged in as ",
                React.createElement("span", { className: "username" }, username)),
            React.createElement("span", null,
                React.createElement(Button, { className: "login-button", variant: "outlined", size: "small", onClick: () => {
                        if (props.onLoggedOut) {
                            props.onLoggedOut();
                            return;
                        }
                        window.location.assign("/logout");
                    } }, "Logout"))))) : (React.createElement("div", { className: "app-switcher-container" },
        React.createElement("span", { className: "not-logged-in" },
            expired
                ? "Your login has expired"
                : "You are not currently logged in",
            React.createElement(Button, { className: "login-button", variant: "outlined", size: "small", onClick: () => {
                    if (props.onLoggedIn) {
                        props.onLoggedIn();
                        return;
                    }
                    // Perform login
                    window.location.assign(makeLoginUrl());
                } },
                "Login ",
                expired ? "again" : ""))))));
};

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var _ref = /*#__PURE__*/createElement("path", {
  d: "M67.412 54.496l5.15-2.681V11.507H68.7L59.227 24.08h-1.011l.551-14.052h40.926l.552 14.052h-1.104l-9.196-12.573H85.99v40.215l5.058 2.682v1.386H67.412v-1.294zM104.935 52.646V7.992l-3.954-1.571v-.832L115.236 3h1.471v21.171l.368-.37c3.127-2.773 7.726-4.622 12.232-4.622 6.254 0 9.013 3.513 9.013 10.17v23.297l3.311 1.849v1.386h-18.762v-1.386l3.403-1.85V29.349c0-3.605-1.563-5.084-4.598-5.084-2.024 0-3.679.647-4.967 1.664V52.83l3.311 1.85v1.294h-18.761V54.68l3.678-2.034zM153.679 38.964c.368 7.396 3.679 13.128 11.496 13.128 3.771 0 6.438-1.757 8.921-3.051v1.479c-1.931 2.681-6.898 6.471-13.795 6.471-12.048 0-18.302-6.748-18.302-18.49 0-11.463 6.714-18.582 17.658-18.582 10.3 0 15.634 5.177 15.634 18.767v.37h-21.612v-.092zm-.184-1.664l10.668-.647c0-9.153-1.563-15.255-4.69-15.255-3.311 0-5.978 7.026-5.978 15.902zM0 73.63c0-19.415 12.784-26.35 27.039-26.35 6.07 0 11.771 1.018 14.99 2.312l.276 13.59h-1.38l-8.368-13.128c-1.472-.647-2.76-.832-5.335-.832-7.54 0-11.496 8.783-11.312 23.205.184 17.288 3.127 25.147 10.117 25.147 1.84 0 3.219-.278 4.139-.74v-18.49l-4.599-2.68v-1.48h22.256v1.664l-4.598 2.496v18.213c-3.77 1.479-10.117 2.866-16.738 2.866C10.3 99.515 0 91.934 0 73.629zM47.547 64.57v-1.11l14.991-2.588 1.656.092v29.584c0 3.606 1.747 4.623 4.598 4.623 1.84 0 3.495-.74 4.874-2.312V66.42l-4.046-1.757V63.46l14.898-2.68 1.472.092V94.8l4.047 1.664v1.11l-14.715 1.848-1.472-.092v-4.438h-.368c-2.759 2.496-6.53 4.715-11.22 4.715-7.173 0-10.392-4.252-10.392-10.724V66.42l-4.323-1.85zM143.011 60.78l1.195.092V71.78h.368c1.564-8.043 5.151-11.002 9.381-11.002.644 0 1.472.093 1.839.278v11.279c-.643-.185-1.931-.278-3.035-.278-3.402 0-5.885.647-8.093 1.664v21.634l3.403 1.849v1.386h-19.313v-1.386l3.495-1.942V65.772l-4.047-1.202v-1.017l14.807-2.774z",
  fill: "#fff"
});

var _ref2 = /*#__PURE__*/createElement("path", {
  d: "M180.442 61.702V50.146l-4.046-1.479v-.925l15.082-2.773 1.472.185v49.553l4.138 1.48v1.294l-14.899 2.033-1.195-.092v-4.068h-.368c-2.207 2.219-5.15 4.16-9.841 4.16-8.093 0-14.071-6.194-14.071-18.952 0-13.405 6.898-20.061 17.29-20.061 3.035 0 5.334.554 6.438 1.201zm0 31.71V63.83c-.92-.647-1.655-1.387-4.138-1.294-4.047.184-6.53 6.286-6.53 17.195 0 9.8 1.747 15.254 7.173 15.07 1.564-.093 2.759-.648 3.495-1.387zM213.55 60.778l1.287.092v34.392l3.403 1.849v1.386h-19.313v-1.386l3.495-1.942V66.325l-4.139-1.664v-1.11l15.267-2.773zm1.379-9.337c0 3.605-3.035 6.378-6.621 6.378-3.679 0-6.53-2.773-6.53-6.379 0-3.605 2.851-6.471 6.53-6.471 3.586 0 6.621 2.866 6.621 6.471zM261.741 95.264V65.958l-4.046-1.48v-1.386l14.899-2.774 1.471.093v4.345h.368c3.219-2.866 8.001-4.715 12.691-4.715 6.438 0 9.381 3.05 9.381 9.892v25.146L300 97.021v1.386h-19.313v-1.386l3.494-1.942V70.765c0-3.79-1.655-5.27-4.69-5.27-1.931 0-3.587.463-5.15 1.664v28.198l3.403 1.941v1.387H258.43v-1.387l3.311-2.034zM240.313 76.866v-4.9c0-7.396-1.564-9.8-6.162-9.8-.552 0-1.012.093-1.564.093l-8.093 11.001h-1.103V63.09c3.494-1.109 7.817-2.31 13.611-2.31 9.932 0 15.634 2.773 15.634 11.093v23.945l3.587.924v.925c-1.379.832-4.23 1.664-7.265 1.664-4.875 0-7.266-1.572-8.277-4.345h-.368c-2.116 2.866-5.059 4.437-9.657 4.437-5.886 0-9.933-3.698-9.933-10.077 0-6.194 3.771-9.522 11.588-11.001l8.002-1.48zm0 16.548V78.622l-2.483.185c-3.863.37-5.335 2.866-5.335 8.32 0 6.01 1.932 7.582 4.691 7.582 1.563 0 2.391-.463 3.127-1.295zM110.729 76.866v-4.9c0-7.396-1.563-9.8-6.162-9.8-.551 0-1.011.093-1.563.093L94.911 73.26h-1.104V63.09c3.495-1.109 7.817-2.31 13.611-2.31 9.933 0 15.635 2.773 15.635 11.093v23.945l3.587.924v.925c-1.38.832-4.231 1.664-7.266 1.664-4.874 0-7.265-1.572-8.277-4.345h-.368c-2.115 2.866-5.058 4.437-9.656 4.437-5.886 0-9.933-3.698-9.933-10.077 0-6.194 3.77-9.522 11.588-11.001l8.001-1.48zm0 16.548V78.622l-2.483.185c-3.863.37-5.334 2.866-5.334 8.32 0 6.01 1.931 7.582 4.69 7.582 1.656 0 2.483-.463 3.127-1.295z",
  fill: "#fff"
});

function SvgGuardianWhite(props) {
  return /*#__PURE__*/createElement("svg", _extends({
    width: 300,
    height: 100,
    fill: "none"
  }, props), _ref, _ref2);
}

var css_248z$1 = ".header {\n  display: flex;\n  width: 100%;\n  background-color: #052962;\n}\n\n.content {\n  padding: 10px;\n  width: 100%;\n  height: 60px;\n}\n";
styleInject(css_248z$1);

const Header = () => {
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "header" },
            React.createElement("div", { className: "content" },
                React.createElement("a", { href: "/", style: { display: "inline-block", maxHeight: "60px" } },
                    React.createElement(SvgGuardianWhite, { width: "180px", height: "60px", viewBox: "0 0 300 100" }))))));
};

/**
 * Refreshes a token e.g. an expired token and returns an active token.
 */
const refreshToken = (plutoConfig) => __awaiter(void 0, void 0, void 0, function* () {
    const { tokenUri, clientId } = plutoConfig;
    const postdata = {
        grant_type: "refresh_token",
        client_id: clientId,
        refresh_token: sessionStorage.getItem("pluto:refresh-token"),
    };
    try {
        const response = yield axios.post(tokenUri, qs.stringify(postdata), {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        if (response.status === 200) {
            const data = yield response.data;
            return data;
        }
        throw new Error(`Could not fetch refresh token`);
    }
    catch (error) {
        return Promise.reject(error);
    }
});
let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        }
        else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};
/**
 * Retries the API call with a refresh token on 401 Unauthorized.
 */
const handleUnauthorized = (plutoConfig, error, failureCallback) => __awaiter(void 0, void 0, void 0, function* () {
    const originalRequest = error.config;
    // (Backend returns 403 Forbidden when a token is expired instead of 401 Unauthorized
    // therefore the check of 403 Forbidden)
    if (!originalRequest._retry &&
        (error.response.status === 401 || error.response.status === 403)) {
        // Handle several incoming http requests that fails on 401 Unauthorized
        // Therefore create a queue of the failing requests
        // and resolve them when refresh token is fetched
        // or reject them if failed to fetch the request token.
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return axios(originalRequest);
            })
                .catch((error) => {
                return Promise.reject(error);
            });
        }
        originalRequest._retry = true;
        isRefreshing = true;
        try {
            const data = yield refreshToken(plutoConfig);
            sessionStorage.setItem("pluto:access-token", data.access_token);
            sessionStorage.setItem("pluto:refresh-token", data.refresh_token);
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
            processQueue(null, data.access_token);
            return axios(originalRequest);
        }
        catch (error) {
            if (failureCallback) {
                failureCallback();
            }
            processQueue(error, null);
            return Promise.reject(error);
        }
        finally {
            isRefreshing = false;
        }
    }
});

export { AppSwitcher, Header, handleUnauthorized };
//# sourceMappingURL=index.es.js.map
