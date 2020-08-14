import React from "react";
import "./Header.css";

interface HeaderProps {
  children: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = (props) => {
  return (
    <>
      <div className="header">
        <div className="content">{props.children}</div>
      </div>
    </>
  );
};
