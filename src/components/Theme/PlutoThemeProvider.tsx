import React, {useEffect, useState} from "react";
import {defaultPlutoTheme} from "./DefaultPlutoTheme";
import {ThemeProvider} from "@material-ui/core";
import CustomisingThemeContext from "./CustomisingThemeContext";

interface PlutoThemeProviderProps {
    userSettingsUrl?: string;
    userSettingsKey?: string;
}

const PlutoThemeProvider:React.FC<PlutoThemeProviderProps> = (props) => {
    const [darkMode, setDarkmode] = useState(!(localStorage.getItem("pluto-dark-mode") && localStorage.getItem("pluto-dark-mode")=="false"));

    const updateDarkMode = (newValue:boolean)=>{
        localStorage.setItem("pluto-dark-mode", newValue ? "true" : "false");
        setDarkmode(newValue);
    }

    return <ThemeProvider theme={defaultPlutoTheme(darkMode)}>
        <CustomisingThemeContext.Provider value={{darkMode: darkMode, changeDarkMode: updateDarkMode}}>
            {
                props.children
            }
        </CustomisingThemeContext.Provider>
    </ThemeProvider>
}

export  {PlutoThemeProvider};