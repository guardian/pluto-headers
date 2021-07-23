import React, {useEffect, useState} from "react";
import {defaultPlutoTheme} from "./DefaultPlutoTheme";
import {ThemeProvider, ThemeProviderProps} from "@material-ui/core";
import axios from "axios";
import CustomisingThemeContext from "./CustomisingThemeContext";

interface PlutoThemeProviderProps {
    userSettingsUrl?: string;
    userSettingsKey?: string;
}

const PlutoThemeProvider:React.FC<PlutoThemeProviderProps> = (props) => {
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkmode] = useState(false);

    const userSettingsUrl = props.userSettingsUrl ?? "/userprefs/api";
    const userSettingsKey = props.userSettingsKey ?? "darkmode";

    const loadUserPrefs = async () => {
        setLoading(true);
        const response = await axios.get<string>(`${userSettingsUrl}/getValue/${userSettingsKey}`, {headers: {"Accept": "text/plain"}, validateStatus: ()=>true});
        switch(response.status) {
            case 200:
                setDarkmode(response.data=="true");
                setLoading(false);
                break;
            case 500:
                console.error("user preferences service returned a 500 error: ", response.data);
                setLoading(false);
                break;
            case 502|503|504:
                console.error("user preferences service is offline");
                setLoading(false);
                break;
            case 403|401:
                console.error("user token is invalid, refresh the page");
                setLoading(false);
                break;
            default:
                console.error("server returned unexpected ", response.status, " ", response.statusText, ": ", response.data);
                setLoading(false);
                break;
        }
    }

    useEffect(()=>{
        loadUserPrefs()
            .catch(err=>{
                console.error("loadUserPrefs failed: ", err);
                setLoading(false);
            })
    }, []);

    return loading ? <div>...</div> : <ThemeProvider theme={defaultPlutoTheme(darkMode)}>
        <CustomisingThemeContext.Provider value={{darkMode: darkMode, changeDarkMode: setDarkmode}}>
            {
                props.children
            }
        </CustomisingThemeContext.Provider>
    </ThemeProvider>
}

export  {PlutoThemeProvider};