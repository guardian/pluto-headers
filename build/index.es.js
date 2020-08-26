import React, { useState, useEffect, createElement } from 'react';
import { Link } from 'react-router-dom';
import { Menu, MenuItem, Button } from '@material-ui/core';
import jwt from 'jsonwebtoken';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
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

var css_248z = ".app-switcher-container {\n  display: flex;\n  background-color: #dee2e3;\n  height: 30px;\n  padding: 6px;\n  border-bottom: 1px solid #d2d2d2;\n  font-size: 14px;\n}\n\n.app-switcher-container .username {\n  font-weight: 700;\n  font-size: 16px;\n}\n\n.app-switcher-container .not-logged-in {\n  width: 100%;\n  display: flex;\n  justify-content: flex-end;\n  align-items: center;\n}\n\n.app-switcher-container .login-button,\n.app-switcher-container .not-logged-in .logout-button {\n  margin-left: 10px;\n}\n\nul.app-switcher {\n  display: flex;\n  align-items: center;\n  list-style-type: none;\n  margin: 0;\n  padding: 0;\n  flex-grow: 1;\n}\n\nul.app-switcher li {\n  padding: 0 10px;\n  margin-bottom: 0;\n}\n\nul.app-switcher li a {\n  color: #5d5d5d;\n  text-decoration: none;\n}\n\nul.app-switcher li a:hover {\n  color: #181818;\n}\n\nul.app-switcher li a:focus {\n  color: #181818;\n  outline: none;\n}\n";
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

var css_248z$1 = "ul.app-switcher li button.submenu-button {\n  color: #5d5d5d;\n}\n\nul.app-switcher li button.submenu-button:hover {\n  color: #181818;\n}\n\nul.app-switcher li button.submenu-button:focus {\n  color: #181818;\n  outline: none;\n}\n\nul.app-switcher li button.submenu-button {\n  display: flex;\n  align-items: center;\n  background-color: transparent;\n  border: none;\n  box-sizing: content-box;\n  cursor: pointer;\n  font: inherit;\n  height: auto;\n  padding: 0;\n  text-transform: none;\n  letter-spacing: unset;\n  margin-bottom: 0;\n}\n";
styleInject(css_248z$1);

const MenuButton = (props) => {
    const { index, isAdmin, text, adminOnly, content } = props;
    const [anchorEl, setAnchorEl] = useState(null);
    const openSubmenu = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const closeMenu = () => {
        setAnchorEl(null);
    };
    return (React.createElement("li", { style: {
            display: adminOnly ? (isAdmin ? "inherit" : "none") : "inherit",
        } },
        React.createElement("button", { className: "submenu-button", "aria-controls": `pluto-menu-button-${index}`, "aria-haspopup": "true", onClick: openSubmenu },
            text,
            React.createElement(ArrowDropDownIcon, { style: { fontSize: "16px" } })),
        React.createElement(Menu, { id: `pluto-menu-button-${index}`, anchorEl: anchorEl, getContentAnchorEl: null, anchorOrigin: {
                vertical: "bottom",
                horizontal: "center",
            }, transformOrigin: {
                vertical: "top",
                horizontal: "center",
            }, open: Boolean(anchorEl), onClose: closeMenu }, (content || []).map(({ type, text, href, adminOnly }, index) => {
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
                    display: adminOnly ? (isAdmin ? "inherit" : "none") : "inherit",
                }, onClick: () => {
                    closeMenu();
                    window.location.assign(href);
                } }, text));
        }))));
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
        React.createElement("ul", { className: "app-switcher" }, (menuSettings || []).map(({ type, text, href, adminOnly, content }, index) => type === "link" ? (getLink(text, href, adminOnly, index)) : (React.createElement(MenuButton, { key: index, index: index, isAdmin: isAdmin, text: text, adminOnly: adminOnly, content: content })))),
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

var css_248z$2 = ".header {\n  display: flex;\n  width: 100%;\n  background-color: #052962;\n}\n\n.content {\n  padding: 10px;\n  width: 100%;\n  height: 60px;\n}\n";
styleInject(css_248z$2);

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
    if (!originalRequest._retry && error.response.status === 401) {
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

var css_248z$3 = "@font-face {\n    font-family: \"gnm-font-sans-reg\";\n    src: url(\"/static/Guardian-Ag-Sans-1-Web-Reg.woff\") format('woff');\n}\n\n@font-face {\n    font-family: \"gnm-font-sans-bold\";\n    src: url(\"/static/Guardian-Ag-Sans-1-Web-Bold.woff\") format('woff');\n}\n\n@font-face {\n    font-family: \"gnm-font-egyp-reg\";\n    src: url(\"/static/Guardian-Egyp-Web-Regular.woff\") format('woff');\n}\n\n@font-face {\n    font-family: \"gnm-font-egyp-bold\";\n    src: url(\"/static/Guardian-Egyp-Web-Semibold.woff\") format('woff');\n}\n\ndiv.breadcrumb-container {\n    display: flex;\n    flex-direction: row;\n    justify-content: flex-start;\n    align-items: center;\n    align-content: flex-start;\n}\n\ndiv.breadcrumb {\n    font-family: \"gnm-font-egyp-bold\", Georgia, serif !important;\n    font-size: 1.8rem;\n    display: flex;\n    flex: 1;\n    align-items: center;\n    flex-direction: row;\n    max-width: 400px;\n    min-width: 150px;\n    margin-right: 0.6em;\n}\n\n.breadcrumb-icon {\n    width: 40px;\n    height: 40px;\n    padding-right: 0.2em;\n}\n\n.breadcrumb img.breadcrumb-arrow {\n    margin-left: auto;\n    width: 12px;\n    height: 20px;\n}\n\n.breadcrumb-text {\n    font-weight: 400;\n    margin-bottom: 0;\n    line-height: 1em;\n\n}";
styleInject(css_248z$3);

const img = "data:image/png;base64,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";

const img$1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA3XAAAN1wFCKJt4AAAAB3RJTUUH3gkXBiU7eUuf2QAABbFJREFUWMPNWWtMk1cYfs7H15ZSoBeQRgpMdAoEgkEQAx1TdM65ITEaQM3IEuZtiYtK5kY244/FbWzObWYmw+vUZRtCdIuwzem2BoltYKhEuckUlItY7sVC7z37ATKwlX601Oz50+ac857z5LznvO95n49QSuEO7rT10j80zaipb0dX9xD6BocxMGQAAEgDhQiSiDA7JBBJseFYmRqFeeFBxJ11yHQI9vTra46fq0osU9Whd2AYLMvAaLJOaeMrYGG12jFL5o/M9DjkrUu+NkvmnzSjBIcNZhw5q6FHS9UAALPF5tau83k+AICtWanYlpNCREK+5wR/q2ykBV+Uw2KxwWi2YibgK+CBxzIozM/A6rQY4hZBSoEvT1fQIyVqWKw2eAMsy2B7thK731hKCJkGQYPJgrf3n6fq2nswmizwJgR8FsqESHy9dx0RCniuCdopRd4HxbTq5n2YZsilXEguiX8OJz/aQJgntpJ5cvCBEypafavtmZEDAJPZiupbbThwQuXgzkkEy1T19OT5Kq+71RmMJgtOnq9CmaqeOnWxfsSElI2H6LDB/NRJpIFCLIxWQBEiRmhI4Njv6P/CY3+ivKIBSxfPw4bVCVgYrYBM7IcH3To03+/B0RINrjd0uCQqEvKh+XEn8fcTjF6kxx1FxWpqs9unNE5fMh+f78l02rcgMgSHlFFYsyx2UvschQxzFDK8lLIAp36qxv6iy1OuYbPbUVSspu/kpZNxF49lCJdZYSrs2PSCA7lJZ4kQ5K1bgjXpsS5cbcXxc1Xo6dfXjBM8c6EmkXDIlJXXWrC/6BKqbt532v+gW4fL6mZc+KsOrR39TscUbF4BZ+Fk0rkjo5zGz+CLuYdph3aQ826lJc7F6U82TWpTVd3B5n3FeBy1CAH25C3H9pxUB/v3Dpaj9PfaKdcIk0tw5bsdhGnt6KddPTqPb+GI0YyJIZVS4OC3KjzsHXIYuzgu3OV8XT06tHb0U+aS+jZ4Y0l8pmGzU/x6pcmhPSJU6tKWx/PBJfVtMLVNnR5dDlfQ9jnuYIBIwCEuWlHb1AmmU6vzagDuGxxxaPNhGE62nVodmN4BvVcJ8ljH4zOkN3Ky7R3Qg+nXGbxKMEji52ThYU62/ToDGHgZ8qAAh7bapk7O9oxMLPQaOR8fBi8ro5wGfC6QiYVggqX+XiP4+ppEhx3U1N5DY4uWk32w1B+sQi5G3T9dHpNZlvw83n1zORpbtGAIQXJ8BDa+usghdLh6LEyEQi4GuygmDBXVdzwuiERCvtO0NvFRmv/Zz5x3z5fPYlFMGJhVyiivFUUT3Zq16xQuVjZxtrFYbViljAIbESolCrmEtnUNeESiqaUb6tpWiAOEYAiBTm9ES3sf1Dda0dLRN+35FHIJIkKlhAWAtSvicKRE41Edcre9d1rny1URtXZF3H81SW5m0qf4n+ExJ2Y02osKtmWnwFfAcgueDHH6+pgZ1YHFtuwUBElEBZOKphGDGSmbDtFHw6anGsdHhaJwdwbmPxcMHx/HJKTTG1HX3IXcgu/dJhggEkDzw07iN6bbjK/iJ+SjMD8DLPv07Bci80f03BCn5ABA7O+L5PgIj6SQwvwM+E0QlSb5dHVaDGm8202PlqqdKlgPex+hvKJh6keqze628rU1K9VBTHKQPigFtuw7S6/eaH2m0ocyIRLHPsxxEJEYZxXV4b3riTIhEgI++8zIHd673qnC5VJ+Kyq5CqvV7hVybstvE3Gxsom+/9UvMJotM1a7+ApY+PJ5+HjXa3glLdo9AfNJvfBYiYZ+c1Y9nvjddScAvJWTii3ZKcRVAc+Z4ISnesmZC39nlanq0d41CAGfhcGFEiYU8GAyWxE+W4LM9DjkZiaVBktF2VzXJO5+hmh/OEgvq5txvaEdHVodtH2PMDBW30jFQsiDAhAmFyMxNhwrUxcgTC5x6zPEv9APWR8wdXaqAAAAAElFTkSuQmCC";

const img$2 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gcJCSoVJq9XKQAABVVJREFUWMPNmVtsVFUUhv+9z2XmnM6lnbZSKy0WpKChtWUoI2IDITGAgq2W2qqNIAImPvigAUkjYIhgRImG4ANEhPCAQlQQ8Ub0QRCl5VKohBBsuUittS0D0+nczm37ABan57SlY1tmJfMwOXvO/vZae/17rzWEMYZBGzOgXD7JYud+gnLxGPTOizC6/WBqBABABAnUkQ4uMw9iXgnsE2dCyC0iIHTQU5HBAOr+Kyz08w5E6veAKSGAUDA12v8Egh1gBojNAdlXBXn6InBp95AhBTSCHce79q3xRk9/A3AcmBpDIkYEO6BrsBfNh6v8zXeoI33l/waMNHzJAnuWA7oOpiUGZpqUtwG8gNSqjbA/+DhJCJDpKgK7l7Now34wXcFwGOFESFMr4a5YR0D52wdksRD8W2qY2nIaTBseuB7jBIh5XniW7CRElE2PTWnFNAVXt9YwpaVx+OEAQFehXjoF/0cLGdPVgQEDu15hWstvwBDtt9tSLS0K9XIDunavYP0Chn/dxaJnDg4oHcMCqUYRadiHyLHPmCWgEew4Hti3emTC2hekriLweS2MkH+ZCbBr/1ovmIE7boaO4IH1W+KyWGtvZp0bZoEZes84/u4JEEYXgkvNjvtQVyaubq6A1t4Ee8EcSMXlEMZMBnWkA1oMautZhA5vR/T0gRsecGRA9lXBNnEW+FHjQKVUGJEAlKZfEDz4PrS282ZpoTwyaw+B8+QSwhhD1xerWPjorjghdle9C9n3jOUiu/auhuSrhpD9QJ+OCB5YDyK5kDJjGQgvWodUCePqpnKorWdNQp5S+gKc898ghGkq2lZNYizaHTeoP8ChtGjjt7i2Y6nZi7IbWWsbCa/8cZIxzaw/oR8/hPbXOUhTqyFk32+Wr2t/QutoBhEkCLlFIJxg4SIGrb0JeqAN1JFh+R7xXq81uRKB2nLG4JXzR0AYQ28B0jovQTu0DdQ1yvTi4HfvofvgB7f2a1Y+Ml773gTZuakM6uWTPd/lqVVwV2+M95Tk6tO7saYjoMql44M+a1k4EL+YtvOWmx299DRyM3F6ZUQf4q1AuVBPqNbeNDQaFg1aTE5MZzz+oxQDnoJ//w5qdPuRrKaH/KBsBM/cQZsSAUUyGyGghLclL6BgB6UOT9LycSnpoPyo+5IXMGs8qDjWd6PaSrrwShDzShi1jX8EVtcsIacQrrI1kIrmm55JJZVImfkSwPHg0nPhnFcLPmuCaZxj9quw3/y9MGYy3BXrTMJMOAGpNZsheZ/sde3SYMsvBS/kFhMiuRgLdsZDFJchZcZS68XlFELIKUSk7hOIYx+CY9bLluPsk2aD8+QgeuoryN6nIE9faJmp0uRyiGOKETmx91Z4HRkQRhdQCkIgT1mApMpmXoRUsuDWhVW/3so63noYzNCSQ/54AXetqj9BnZlTKABwqdlEKqkEEcQ7DyfYIE+rAXVmTomrSZzzah8FFZIgvHY4564gpqKJpqT94H56Q5/X85EKbWr1RhC707oulorLiOStAO4AJBFskH3PwV4wh/TfmzE0+Lc+z2IX6wA1NkKes0HML4Vn8TYCyvXf+gDlkbZkO7Hl+UAEaUQuBGL+dKQt2mqCswa8uSLP0p1EKn5iWPWR8CLkkkp4Fm8nfe39gRuYp/azwJ7XAS02ZG0RwouAYL/RwCycm1gDM25bhq+PDX79dnOk7lMwygEJghJeBAwD8rRn4XhsJaH9VHSDAuypEa63svDhjxGu2514E730RXDurKFtoptLOAPqlUZDaT4K5UI9UdvOwQh2Av++ixBwrkzwWRMhjvMxMc8HIaeAJvI3xD/McB4leLuGsAAAAABJRU5ErkJggg==";

const img$3 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAUCAYAAAC58NwRAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gcJCCAXM4y0uAAAAU9JREFUKM+Nkz+KIkEUh79nN4UeoBH8m0nnYp3AE5gLbeI5Zm7gATQ22GQPoCBl1l5ADHZZMNVATAqx30Y2M2O3Mw8KquD73qMe/LherzqbzXS73aqq8t0Joih6u1wuHI9HROSt0+m886Iq/X4fYwzee5xzOOf0lSCqSpqmul6v8d5jjMFay3A4lCIhBLDWCpBLaZoCaJEUPi4/lcKPD2utiIiuVqtSKfw6cjAYCFAqiWrxUna7XS6JCN1ulyRJpFQAcM7pZrMhyzIAWq3Wv0oZfLvd2O/3PBqKCL1e70/hBO89i8VCT6cT9/sdYwyj0Yg4jqXyHVyr1ZhOp7/iOH7+dBGcJAn1ej1fa6UMrlarT3AuFMGTyeQJBgi998zncz2fzy87Pypot9ufOo/HYxqNhpTmIYoigiDI4WazKa/yQJZlv5fL5d/D4bD5SUT/A3usFchwG8zQAAAAAElFTkSuQmCC";

class Breadcrumb extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            loading: false,
            projectName: "",
            commissionName: "",
            masterName: "",
        };
    }
    /**
     * implement an error boundary so we can't break the rest of the UI
     * @param error
     */
    static getDerivedStateFromError(error) {
        return { loading: false, hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        console.error("An uncaught error happened in the Breadcrumb component ", error, errorInfo);
    }
    /**
     * return a promise that completes when state change is complete
     */
    setStatePromise(newState) {
        return new Promise((resolve, reject) => this.setState(newState, () => resolve()));
    }
    /**
     * generic function to load in data from either project or commission endpoints in pluto-core
     * @param url url to load
     */
    plutoCoreLoad(url) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios.get(url);
                if (response.data && response.data.result && response.data.result.title) {
                    return {
                        title: response.data.result.title,
                        workingGroupId: response.data.workingGroupId,
                        commissionId: response.data.id,
                    };
                }
                else {
                    return {
                        title: "(none)",
                    };
                }
            }
            catch (err) {
                if (err.response) {
                    switch (err.response.status) {
                        case 404:
                            console.info("No data existed for the url ", url);
                            return {
                                title: "(none)",
                            };
                        case 503 | 504:
                            console.info("pluto-core is not responding, retrying...");
                            return new Promise((resolve, reject) => {
                                window.setTimeout(() => {
                                    this.plutoCoreLoad(url)
                                        .then((result) => resolve(result))
                                        .catch((err) => reject(err));
                                }, 2000);
                            });
                    }
                    throw "Could not load pluto-core data";
                }
            }
            return {
                title: "(none)",
            }; //we shouldn't get here but the compiler wants a return
        });
    }
    loadCommissionData() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setStatePromise({ loading: true });
            //I could do the whole type-registration thing and validate it for the data, but really we are only interested
            //in a field or two so I might as well do it manually.
            const url = `/pluto-core/api/pluto/commission/${this.props.commissionId}`;
            try {
                const serverContent = yield this.plutoCoreLoad(url);
                return this.setStatePromise({
                    loading: false,
                    commissionName: serverContent.title,
                });
            }
            catch (err) {
                return this.setStatePromise({ loading: false, hasError: true });
            }
        });
    }
    loadProjectData() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setStatePromise({ loading: true });
            const url = `/pluto-core/api/project/${this.props.commissionId}`;
            try {
                const serverContentProject = yield this.plutoCoreLoad(url);
                if (serverContentProject.commissionId) {
                    const commissionUrl = `/pluto-core/api/pluto/commission/${serverContentProject.commissionId}`;
                    const serverContentComm = yield this.plutoCoreLoad(commissionUrl);
                    return this.setStatePromise({
                        loading: false,
                        commissionName: serverContentComm.title,
                        projectName: serverContentProject.title,
                    });
                }
                else {
                    return this.setStatePromise({
                        loading: false,
                        projectName: serverContentProject.title,
                    });
                }
            }
            catch (err) {
                console.error("Could not load project data: ", err);
                return this.setStatePromise({ loading: false, hasError: true });
            }
        });
    }
    loadMasterData() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setStatePromise({ loading: true });
            const url = `/deliverables/api/asset/${this.props.masterId}`;
            console.log("loadMasterData not implemented yet");
            return this.setStatePromise({ loading: false, hasError: true });
        });
    }
    /**
     * master load function that hands off to specific ones
     */
    loadData() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.props.masterId) {
                return this.loadMasterData();
            }
            else if (this.props.projectId) {
                return this.loadProjectData();
            }
            else if (this.props.commissionId) {
                return this.loadCommissionData();
            }
            else {
                console.error("Breadcrumb component has no master, project nor commission id.");
            }
        });
    }
    componentDidMount() {
        this.loadData();
    }
    render() {
        if (this.state.hasError) {
            return (React.createElement("div", { className: "breadcrumb-container" },
                React.createElement("p", null, "Could not load location data")));
        }
        else {
            return (React.createElement("div", { className: "breadcrumb-container" },
                this.state.commissionName == "" ? null : (React.createElement("div", { className: "breadcrumb" },
                    React.createElement("img", { className: "breadcrumb-icon", src: img, alt: "Commission" }),
                    React.createElement("p", { className: "breadcrumb-text" }, this.state.commissionName),
                    this.state.projectName == "" ? null : React.createElement("img", { className: "breadcrumb-arrow", src: img$3, alt: ">" }))),
                this.state.projectName == "" ? null : (React.createElement("div", { className: "breadcrumb" },
                    React.createElement("img", { className: "breadcrumb-icon", src: img$1, alt: "Project" }),
                    React.createElement("p", { className: "breadcrumb-text" }, this.state.projectName),
                    this.state.masterName == "" ? null : React.createElement("img", { className: "breadcrumb-arrow", src: img$3, alt: ">" }))),
                this.state.masterName == "" ? null : (React.createElement("div", { className: "breadcrumb" },
                    React.createElement("img", { className: "breadcrumb-icon", src: img$2, alt: "Master" }),
                    React.createElement("p", { className: "breadcrumb-text" }, this.state.masterName)))));
        }
    }
}

export { AppSwitcher, Breadcrumb, Header, handleUnauthorized };
//# sourceMappingURL=index.es.js.map
