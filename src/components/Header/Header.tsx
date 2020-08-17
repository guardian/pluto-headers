import React from "react";
import GuardianLogo from "../../static/guardian_white.svg";
import "./Header.css";

export const Header = () => {
  return (
    <>
      <div className="header">
        <div className="content">
          <a href="/" style={{ display: "inline-block", maxHeight: "60px" }}>
            <GuardianLogo
              width={"180px"}
              height={"60px"}
              viewBox={"0 0 300 100"}
            />
          </a>
        </div>
      </div>
    </>
  );
};
