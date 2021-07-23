import React from "react";

interface CustomisingThemeContext {
    darkMode: boolean;
    changeDarkMode: (newValue:boolean)=>void;
}

const CustomisingThemeContext = React.createContext<CustomisingThemeContext>({darkMode: false, changeDarkMode: ()=>{}});

export const CustomisingThemeContextProvider = CustomisingThemeContext.Provider;
export default CustomisingThemeContext;
