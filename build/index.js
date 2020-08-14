"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

var React = require("react");
var reactRouterDom = require("react-router-dom");
var ArrowDropDownIcon = require("@material-ui/icons/ArrowDropDown");
var core = require("@material-ui/core");

function _interopDefaultLegacy(e) {
  return e && typeof e === "object" && "default" in e ? e : { default: e };
}

var React__default = /*#__PURE__*/ _interopDefaultLegacy(React);
var ArrowDropDownIcon__default = /*#__PURE__*/ _interopDefaultLegacy(
  ArrowDropDownIcon
);

function styleInject(css, ref) {
  if (ref === void 0) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === "undefined") {
    return;
  }

  var head = document.head || document.getElementsByTagName("head")[0];
  var style = document.createElement("style");
  style.type = "text/css";

  if (insertAt === "top") {
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

var css_248z =
  ".app-switcher-container {\n  display: flex;\n  background-color: #dee2e3;\n  height: 30px;\n  padding: 6px;\n  border-bottom: 1px solid #d2d2d2;\n  font-size: 14px;\n}\n\n.app-switcher-container .username {\n  font-weight: 700;\n  font-size: 16px;\n}\n\n.app-switcher-container .not-logged-in {\n  width: 100%;\n  display: flex;\n  justify-content: flex-end;\n  align-items: center;\n}\n\n.app-switcher-container .login-button,\n.app-switcher-container .not-logged-in .logout-button {\n  margin-left: 10px;\n}\n\nul.app-switcher {\n  display: flex;\n  align-items: center;\n  list-style-type: none;\n  margin-bottom: 0;\n  flex-grow: 1;\n}\n\nul.app-switcher li {\n  padding: 0 10px;\n  margin-bottom: 0;\n}\n\nul.app-switcher li button.submenu-button,\nul.app-switcher li a {\n  color: #5d5d5d;\n}\n\nul.app-switcher li a {\n  text-decoration: none;\n}\n\nul.app-switcher li button.submenu-button:hover,\nul.app-switcher li a:hover {\n  color: #181818;\n}\n\nul.app-switcher li button.submenu-button:focus,\nul.app-switcher li a:focus {\n  color: #181818;\n  outline: none;\n}\n\nul.app-switcher li button.submenu-button {\n  display: flex;\n  align-items: center;\n  border: none;\n  box-sizing: content-box;\n  cursor: pointer;\n  font: inherit;\n  height: auto;\n  padding: 0;\n  text-transform: none;\n  letter-spacing: unset;\n  margin-bottom: 0;\n}\n";
styleInject(css_248z);

const AppSwitcher = (props) => {
  const [anchorEl, setAnchorEl] = React__default["default"].useState(null);
  const openSubmenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const closeMenu = () => {
    setAnchorEl(null);
  };
  const menuSettings = props.menuSettings || [];
  const getLink = (text, href, adminOnly, index) =>
    React__default["default"].createElement(
      "li",
      {
        key: index,
        style: {
          display: adminOnly ? (props.isAdmin ? "inherit" : "none") : "inherit",
        },
      },
      React__default["default"].createElement(
        reactRouterDom.Link,
        { to: href },
        text
      )
    );
  return React__default["default"].createElement(
    React__default["default"].Fragment,
    null,
    props.isLoggedIn
      ? React__default["default"].createElement(
          "div",
          { className: "app-switcher-container" },
          React__default["default"].createElement(
            "ul",
            { className: "app-switcher" },
            menuSettings.map(
              ({ type, text, href, adminOnly, content }, index) =>
                type === "link"
                  ? getLink(text, href, adminOnly, index)
                  : React__default["default"].createElement(
                      "li",
                      {
                        key: `${index}-submenu`,
                        style: {
                          display: adminOnly
                            ? props.isAdmin
                              ? "inherit"
                              : "none"
                            : "inherit",
                        },
                      },
                      React__default["default"].createElement(
                        "button",
                        {
                          className: "submenu-button",
                          "aria-controls": `simple-menu-${index}`,
                          "aria-haspopup": "true",
                          onClick: openSubmenu,
                        },
                        text,
                        React__default[
                          "default"
                        ].createElement(ArrowDropDownIcon__default["default"], {
                          style: { fontSize: "16px" },
                        })
                      ),
                      React__default["default"].createElement(
                        core.Menu,
                        {
                          id: `simple-menu-${index}`,
                          anchorEl: anchorEl,
                          getContentAnchorEl: null,
                          anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "center",
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "center",
                          },
                          keepMounted: true,
                          open: Boolean(anchorEl),
                          onClose: closeMenu,
                        },
                        (content || []).map(
                          ({ type, text, href, adminOnly }, index) => {
                            if (type === "submenu") {
                              console.error(
                                "You have provided a submenu inside a submenu, nested submenus are not supported!"
                              );
                              return;
                            }
                            return React__default["default"].createElement(
                              core.MenuItem,
                              {
                                key: `${index}-menu-item`,
                                style: {
                                  display: adminOnly
                                    ? props.isAdmin
                                      ? "inherit"
                                      : "none"
                                    : "inherit",
                                },
                                component: reactRouterDom.Link,
                                to: href,
                                onClick: () => {
                                  closeMenu();
                                },
                              },
                              text
                            );
                          }
                        )
                      )
                    )
            )
          ),
          React__default["default"].createElement(
            "div",
            null,
            React__default["default"].createElement(
              "span",
              null,
              "You are logged in as",
              " ",
              React__default["default"].createElement(
                "span",
                { className: "username" },
                props.username
              )
            ),
            React__default["default"].createElement(
              "span",
              null,
              React__default["default"].createElement(
                core.Button,
                {
                  className: "login-button",
                  variant: "outlined",
                  size: "small",
                  onClick: () => {
                    if (props.onLoggedOut) {
                      props.onLoggedOut();
                    }
                  },
                },
                "Logout"
              )
            )
          )
        )
      : React__default["default"].createElement(
          "div",
          { className: "app-switcher-container" },
          React__default["default"].createElement(
            "span",
            { className: "not-logged-in" },
            "You are not currently logged in",
            React__default["default"].createElement(
              core.Button,
              {
                className: "login-button",
                variant: "outlined",
                size: "small",
                onClick: () => {
                  if (props.onLoggedIn) {
                    props.onLoggedIn();
                  }
                },
              },
              "Login"
            )
          )
        )
  );
};

var css_248z$1 =
  ".header {\n  display: flex;\n  width: 100%;\n  background-color: #052962;\n}\n\n.content {\n  padding: 10px;\n  width: 100%;\n  height: 60px;\n}\n";
styleInject(css_248z$1);

const Header = (props) => {
  return React__default["default"].createElement(
    React__default["default"].Fragment,
    null,
    React__default["default"].createElement(
      "div",
      { className: "header" },
      React__default["default"].createElement(
        "div",
        { className: "content" },
        props.children
      )
    )
  );
};

exports.AppSwitcher = AppSwitcher;
exports.Header = Header;
//# sourceMappingURL=index.js.map
