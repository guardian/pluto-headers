import React from "react";
import { Link } from "react-router-dom";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { Menu, MenuItem, Button } from "@material-ui/core";

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
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openSubmenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const closeMenu = () => {
    setAnchorEl(null);
  };
  const menuSettings = props.menuSettings || [];
  const getLink = (text, href, adminOnly, index) =>
    React.createElement(
      "li",
      {
        key: index,
        style: {
          display: adminOnly ? (props.isAdmin ? "inherit" : "none") : "inherit",
        },
      },
      React.createElement(Link, { to: href }, text)
    );
  return React.createElement(
    React.Fragment,
    null,
    props.isLoggedIn
      ? React.createElement(
          "div",
          { className: "app-switcher-container" },
          React.createElement(
            "ul",
            { className: "app-switcher" },
            menuSettings.map(
              ({ type, text, href, adminOnly, content }, index) =>
                type === "link"
                  ? getLink(text, href, adminOnly, index)
                  : React.createElement(
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
                      React.createElement(
                        "button",
                        {
                          className: "submenu-button",
                          "aria-controls": `simple-menu-${index}`,
                          "aria-haspopup": "true",
                          onClick: openSubmenu,
                        },
                        text,
                        React.createElement(ArrowDropDownIcon, {
                          style: { fontSize: "16px" },
                        })
                      ),
                      React.createElement(
                        Menu,
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
                            return React.createElement(
                              MenuItem,
                              {
                                key: `${index}-menu-item`,
                                style: {
                                  display: adminOnly
                                    ? props.isAdmin
                                      ? "inherit"
                                      : "none"
                                    : "inherit",
                                },
                                component: Link,
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
          React.createElement(
            "div",
            null,
            React.createElement(
              "span",
              null,
              "You are logged in as",
              " ",
              React.createElement(
                "span",
                { className: "username" },
                props.username
              )
            ),
            React.createElement(
              "span",
              null,
              React.createElement(
                Button,
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
      : React.createElement(
          "div",
          { className: "app-switcher-container" },
          React.createElement(
            "span",
            { className: "not-logged-in" },
            "You are not currently logged in",
            React.createElement(
              Button,
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
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "div",
      { className: "header" },
      React.createElement("div", { className: "content" }, props.children)
    )
  );
};

export { AppSwitcher, Header };
//# sourceMappingURL=index.es.js.map
