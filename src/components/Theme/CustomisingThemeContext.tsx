import React from "react";

interface CustomisingThemeContext {
    darkMode: boolean;
    changeDarkMode: (newValue:boolean)=>void;
}

const CustomisingThemeContext = React.createContext<CustomisingThemeContext>({
    darkMode:  !(localStorage.getItem("pluto-dark-mode") && localStorage.getItem("pluto-dark-mode")=="false"), changeDarkMode: ()=>{}
});

export const CustomisingThemeContextProvider = CustomisingThemeContext.Provider;
export default CustomisingThemeContext;
