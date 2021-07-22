import React from "react";
import {defaultPlutoTheme} from "./DefaultPlutoTheme";
import {ThemeProvider, ThemeProviderProps} from "@material-ui/core";

const PlutoThemeProvider:React.FC<ThemeProviderProps> = (props) => {
    const updatedProps = Object.assign({}, {theme: defaultPlutoTheme}, props) as ThemeProviderProps;

    return <ThemeProvider theme={updatedProps}>
        {
            props.children
        }
    </ThemeProvider>
}

export  {PlutoThemeProvider};