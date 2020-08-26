'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var reactRouterDom = require('react-router-dom');
var core = require('@material-ui/core');
var jwt = require('jsonwebtoken');
var ArrowDropDownIcon = require('@material-ui/icons/ArrowDropDown');
var axios = require('axios');
var qs = require('query-string');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var React__default = /*#__PURE__*/_interopDefaultLegacy(React);
var jwt__default = /*#__PURE__*/_interopDefaultLegacy(jwt);
var ArrowDropDownIcon__default = /*#__PURE__*/_interopDefaultLegacy(ArrowDropDownIcon);
var axios__default = /*#__PURE__*/_interopDefaultLegacy(axios);
var qs__default = /*#__PURE__*/_interopDefaultLegacy(qs);

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
    jwt__default['default'].verify(token, signingKey, (err, decoded) => {
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
    const [anchorEl, setAnchorEl] = React.useState(null);
    const openSubmenu = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const closeMenu = () => {
        setAnchorEl(null);
    };
    return (React__default['default'].createElement("li", { style: {
            display: adminOnly ? (isAdmin ? "inherit" : "none") : "inherit",
        } },
        React__default['default'].createElement("button", { className: "submenu-button", "aria-controls": `pluto-menu-button-${index}`, "aria-haspopup": "true", onClick: openSubmenu },
            text,
            React__default['default'].createElement(ArrowDropDownIcon__default['default'], { style: { fontSize: "16px" } })),
        React__default['default'].createElement(core.Menu, { id: `pluto-menu-button-${index}`, anchorEl: anchorEl, getContentAnchorEl: null, anchorOrigin: {
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
                return (React__default['default'].createElement(core.MenuItem, { key: `${index}-menu-item`, style: {
                        display: adminOnly
                            ? isAdmin
                                ? "inherit"
                                : "none"
                            : "inherit",
                    }, component: reactRouterDom.Link, to: getDeploymentRootPathLink(href), onClick: () => {
                        closeMenu();
                    } }, text));
            }
            return (React__default['default'].createElement(core.MenuItem, { key: `${index}-menu-item`, style: {
                    display: adminOnly ? (isAdmin ? "inherit" : "none") : "inherit",
                }, onClick: () => {
                    closeMenu();
                    window.location.assign(href);
                } }, text));
        }))));
};

const AppSwitcher = (props) => {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [username, setUsername] = React.useState("");
    const [loginData, setLoginData] = React.useState(null);
    const [expired, setExpired] = React.useState(false);
    const [checkExpiryTimer, setCheckExpiryTimer] = React.useState(undefined);
    // config
    const [menuSettings, setMenuSettings] = React.useState([]);
    const [clientId, setClientId] = React.useState("");
    const [resource, setResource] = React.useState("");
    const [oAuthUri, setOAuthUri] = React.useState("");
    const [adminClaimName, setAdminClaimName] = React.useState("");
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
    React.useEffect(() => {
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
    const getLink = (text, href, adminOnly, index) => (React__default['default'].createElement("li", { key: index, style: {
            display: adminOnly ? (isAdmin ? "inherit" : "none") : "inherit",
        } }, hrefIsTheSameDeploymentRootPath(href) ? (React__default['default'].createElement(reactRouterDom.Link, { to: getDeploymentRootPathLink(href) }, text)) : (React__default['default'].createElement("a", { href: href }, text))));
    return (React__default['default'].createElement(React__default['default'].Fragment, null, isLoggedIn ? (React__default['default'].createElement("div", { className: "app-switcher-container" },
        React__default['default'].createElement("ul", { className: "app-switcher" }, (menuSettings || []).map(({ type, text, href, adminOnly, content }, index) => type === "link" ? (getLink(text, href, adminOnly, index)) : (React__default['default'].createElement(MenuButton, { key: index, index: index, isAdmin: isAdmin, text: text, adminOnly: adminOnly, content: content })))),
        React__default['default'].createElement("div", null,
            React__default['default'].createElement("span", null,
                "You are logged in as ",
                React__default['default'].createElement("span", { className: "username" }, username)),
            React__default['default'].createElement("span", null,
                React__default['default'].createElement(core.Button, { className: "login-button", variant: "outlined", size: "small", onClick: () => {
                        if (props.onLoggedOut) {
                            props.onLoggedOut();
                            return;
                        }
                        window.location.assign("/logout");
                    } }, "Logout"))))) : (React__default['default'].createElement("div", { className: "app-switcher-container" },
        React__default['default'].createElement("span", { className: "not-logged-in" },
            expired
                ? "Your login has expired"
                : "You are not currently logged in",
            React__default['default'].createElement(core.Button, { className: "login-button", variant: "outlined", size: "small", onClick: () => {
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

var img = "data:image/svg+xml,%3csvg width='300' height='100' viewBox='0 0 300 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M67.4124 54.496L72.5626 51.815V11.5068H68.6999L59.2272 24.08H58.2156L58.7674 10.0276H99.6932L100.245 24.08H99.1414L89.9446 11.5068H85.9899V51.7225L91.0482 54.4036V55.7903H67.4124V54.496Z' fill='white'/%3e%3cpath d='M104.935 52.6456V7.99229L100.981 6.42064V5.5886L115.236 3H116.707V24.171L117.075 23.8012C120.202 21.0277 124.801 19.1787 129.307 19.1787C135.561 19.1787 138.32 22.6918 138.32 29.3482V52.6456L141.631 54.4946V55.8813H122.869V54.4946L126.272 52.6456V29.3482C126.272 25.7427 124.709 24.2635 121.674 24.2635C119.65 24.2635 117.995 24.9106 116.707 25.9276V52.8305L120.018 54.6795V55.9738H101.257V54.6795L104.935 52.6456Z' fill='white'/%3e%3cpath d='M153.679 38.9637C154.047 46.3597 157.358 52.0916 165.175 52.0916C168.946 52.0916 171.613 50.3351 174.096 49.0408V50.52C172.165 53.201 167.198 56.9915 160.301 56.9915C148.253 56.9915 141.999 50.2426 141.999 38.5015C141.999 27.0377 148.713 19.9191 159.657 19.9191C169.957 19.9191 175.291 25.0963 175.291 38.6864V39.0562H153.679V38.9637ZM153.495 37.2996L164.163 36.6525C164.163 27.5 162.6 21.3983 159.473 21.3983C156.162 21.3983 153.495 28.4245 153.495 37.2996Z' fill='white'/%3e%3cpath d='M0 73.6292C0 54.2147 12.7836 47.2809 27.0386 47.2809C33.1085 47.2809 38.8105 48.2979 42.0294 49.5922L42.3053 63.1823H40.9258L32.5567 50.0544C31.0852 49.4073 29.7977 49.2224 27.2225 49.2224C19.6812 49.2224 15.7265 58.0051 15.9105 72.4273C16.0944 89.7154 19.0374 97.5737 26.027 97.5737C27.8663 97.5737 29.2458 97.2963 30.1655 96.8341V78.3441L25.5671 75.6631V74.1839H47.8234V75.848L43.225 78.3441V96.5567C39.4543 98.0359 33.1085 99.4227 26.4868 99.4227C10.3004 99.5151 0 91.9342 0 73.6292Z' fill='white'/%3e%3cpath d='M47.5473 64.5698V63.4604L62.5381 60.8718L64.1935 60.9643V90.5482C64.1935 94.1538 65.9409 95.1707 68.7919 95.1707C70.6313 95.1707 72.2867 94.4311 73.6662 92.8595V66.4188L69.6196 64.6622V63.4604L84.5185 60.7794L85.9899 60.8718V94.8009L90.0365 96.465V97.5744L75.3217 99.4234L73.8502 99.3309V94.8934H73.4823C70.7232 97.3895 66.9526 99.6083 62.2622 99.6083C55.0887 99.6083 51.8698 95.3556 51.8698 88.8841V66.4188L47.5473 64.5698Z' fill='white'/%3e%3cpath d='M143.011 60.7794L144.206 60.8718V71.7809H144.574C146.138 63.7377 149.725 60.7794 153.955 60.7794C154.599 60.7794 155.427 60.8718 155.794 61.0567V72.3356C155.151 72.1507 153.863 72.0582 152.759 72.0582C149.357 72.0582 146.874 72.7054 144.666 73.7223V95.3556L148.069 97.2046V98.5914H128.756V97.2046L132.251 95.2632V65.7716L128.204 64.5698V63.5528L143.011 60.7794Z' fill='white'/%3e%3cpath d='M180.442 61.7024V50.1462L176.396 48.667V47.7425L191.478 44.969L192.95 45.1539V94.707L197.088 96.1862V97.4805L182.189 99.5144L180.994 99.422V95.3542H180.626C178.419 97.573 175.476 99.5144 170.785 99.5144C162.692 99.5144 156.714 93.3203 156.714 80.5622C156.714 67.157 163.612 60.5006 174.004 60.5006C177.039 60.5006 179.338 61.0553 180.442 61.7024ZM180.442 93.4127V63.8288C179.522 63.1816 178.787 62.442 176.304 62.5345C172.257 62.7194 169.774 68.8211 169.774 79.7301C169.774 89.5298 171.521 94.9844 176.947 94.7995C178.511 94.707 179.706 94.1523 180.442 93.4127Z' fill='white'/%3e%3cpath d='M213.55 60.7779L214.837 60.8704V95.2617L218.24 97.1107V98.4975H198.927V97.1107L202.422 95.1693V66.3249L198.283 64.6608V63.5514L213.55 60.7779ZM214.929 51.4405C214.929 55.046 211.894 57.8195 208.308 57.8195C204.629 57.8195 201.778 55.046 201.778 51.4405C201.778 47.8349 204.629 44.969 208.308 44.969C211.894 44.969 214.929 47.8349 214.929 51.4405Z' fill='white'/%3e%3cpath d='M261.741 95.2643V65.9576L257.695 64.4785V63.0917L272.594 60.3182L274.065 60.4107V64.7558H274.433C277.652 61.8899 282.434 60.0409 287.124 60.0409C293.562 60.0409 296.505 63.0917 296.505 69.933V95.0794L300 97.0208V98.4075H280.687V97.0208L284.181 95.0794V70.765C284.181 66.9746 282.526 65.4954 279.491 65.4954C277.56 65.4954 275.904 65.9576 274.341 67.1595V95.3567L277.744 97.2982V98.6849H258.43V97.2982L261.741 95.2643Z' fill='white'/%3e%3cpath d='M240.313 76.8656V71.9658C240.313 64.5698 238.749 62.1661 234.151 62.1661C233.599 62.1661 233.139 62.2585 232.587 62.2585L224.494 73.2601H223.391V63.0906C226.885 61.9812 231.208 60.7794 237.002 60.7794C246.934 60.7794 252.636 63.5528 252.636 71.8733V95.8179L256.223 96.7424V97.6669C254.844 98.4989 251.993 99.3309 248.958 99.3309C244.083 99.3309 241.692 97.7593 240.681 94.9858H240.313C238.197 97.8518 235.254 99.4234 230.656 99.4234C224.77 99.4234 220.723 95.7254 220.723 89.3464C220.723 83.1522 224.494 79.824 232.311 78.3448L240.313 76.8656ZM240.313 93.4142V78.6222L237.83 78.8071C233.967 79.1769 232.495 81.673 232.495 87.1276C232.495 93.1368 234.427 94.7085 237.186 94.7085C238.749 94.7085 239.577 94.2462 240.313 93.4142Z' fill='white'/%3e%3cpath d='M110.729 76.8656V71.9658C110.729 64.5698 109.166 62.1661 104.567 62.1661C104.016 62.1661 103.556 62.2585 103.004 62.2585L94.9107 73.2601H93.8071V63.0906C97.3019 61.9812 101.624 60.7794 107.418 60.7794C117.351 60.7794 123.053 63.5528 123.053 71.8733V95.8179L126.64 96.7424V97.6669C125.26 98.4989 122.409 99.3309 119.374 99.3309C114.5 99.3309 112.109 97.7593 111.097 94.9858H110.729C108.614 97.8518 105.671 99.4234 101.073 99.4234C95.1866 99.4234 91.14 95.7254 91.14 89.3464C91.14 83.1522 94.9107 79.824 102.728 78.3448L110.729 76.8656ZM110.729 93.4142V78.6222L108.246 78.8071C104.383 79.1769 102.912 81.673 102.912 87.1276C102.912 93.1368 104.843 94.7085 107.602 94.7085C109.258 94.7085 110.085 94.2462 110.729 93.4142Z' fill='white'/%3e%3c/svg%3e";

var css_248z$2 = ".header {\n  display: flex;\n  width: 100%;\n  background-color: #052962;\n}\n\n.content {\n  padding: 10px;\n  width: 100%;\n  height: 60px;\n}\n";
styleInject(css_248z$2);

const Header = () => {
    return (React__default['default'].createElement(React__default['default'].Fragment, null,
        React__default['default'].createElement("div", { className: "header" },
            React__default['default'].createElement("div", { className: "content" },
                React__default['default'].createElement("a", { href: "/", style: { display: "inline-block", maxHeight: "60px" } },
                    React__default['default'].createElement(img, { width: "180px", height: "60px", viewBox: "0 0 300 100" }))))));
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
        const response = yield axios__default['default'].post(tokenUri, qs__default['default'].stringify(postdata), {
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
                return axios__default['default'](originalRequest);
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
            return axios__default['default'](originalRequest);
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

var css_248z$3 = "div.breadcrumb-container {\n    display: flex;\n    flex-direction: row;\n    justify-content: flex-start;\n    align-items: center;\n    align-content: flex-start;\n}\n\ndiv.breadcrumb {\n    flex: 1;\n}\n\n.breadcrumb-icon {\n    width: 40px;\n    height: 40px;\n}";
styleInject(css_248z$3);

const img$1 = "data:image/png;base64,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";

class Breadcrumb extends React__default['default'].Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            loading: false,
            projectName: "",
            commissionName: "",
            masterName: ""
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
                const response = yield axios__default['default'].get(url);
                if (response.data && response.data.result && response.data.result.title) {
                    return {
                        title: response.data.result.title,
                        workingGroupId: response.data.workingGroupId,
                        commissionId: response.data.id
                    };
                }
                else {
                    return {
                        title: "(none)"
                    };
                }
            }
            catch (err) {
                if (err.response) {
                    switch (err.response.status) {
                        case 404:
                            console.info("No data existed for the url ", url);
                            return {
                                title: "(none)"
                            };
                        case 503 | 504:
                            console.info("pluto-core is not responding, retrying...");
                            return new Promise((resolve, reject) => {
                                window.setTimeout(() => {
                                    this.plutoCoreLoad(url)
                                        .then((result) => resolve(result))
                                        .catch(err => reject(err));
                                }, 2000);
                            });
                    }
                    throw "Could not load pluto-core data";
                }
            }
            return {
                title: "(none)"
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
                return this.setStatePromise({ loading: false, commissionName: serverContent.title });
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
                    return this.setStatePromise({ loading: false,
                        commissionName: serverContentComm.title,
                        projectName: serverContentProject.title });
                }
                else {
                    return this.setStatePromise({
                        loading: false,
                        projectName: serverContentProject.title
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
            return (React__default['default'].createElement("div", { className: "breadcrumb-container" },
                React__default['default'].createElement(core.Typography, null, "Could not load location data")));
        }
        else {
            return (React__default['default'].createElement("div", { className: "breadcrumb-container" },
                this.state.commissionName == "" ? null : React__default['default'].createElement("div", { className: "breadcrumb" },
                    React__default['default'].createElement("img", { className: "breadcrumb-icon", src: `data:image.png;base64/${img$1}`, alt: "Commission" }),
                    React__default['default'].createElement(core.Typography, null, this.state.commissionName)),
                this.state.projectName == "" ? null : React__default['default'].createElement("div", { className: "breadcrumb" },
                    React__default['default'].createElement("img", { className: "breadcrumb-icon", src: "/static/icon/project.png", alt: "Project" }),
                    React__default['default'].createElement(core.Typography, null, this.state.projectName)),
                this.state.masterName == "" ? null : React__default['default'].createElement("div", { className: "breadcrumb" },
                    React__default['default'].createElement("img", { className: "breadcrumb-icon", src: "/static/icon/master.png", alt: "Master" }),
                    React__default['default'].createElement(core.Typography, null, this.state.masterName))));
        }
    }
}

exports.AppSwitcher = AppSwitcher;
exports.Breadcrumb = Breadcrumb;
exports.Header = Header;
exports.handleUnauthorized = handleUnauthorized;
//# sourceMappingURL=index.js.map
