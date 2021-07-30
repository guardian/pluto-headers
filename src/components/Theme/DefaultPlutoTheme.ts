import { createTheme } from "@material-ui/core/styles";
import {PaletteOptions} from "@material-ui/core/styles/createPalette";

const defaultPlutoTheme = (dark:boolean)=>{
    const palette = dark ? {
            type: "dark",
            background: {
                paper: "#424242EA",
            }
        } as PaletteOptions: {
            type: "light",
            background: {
                paper: "#FFFFFFEA",
            }
        } as PaletteOptions

    return createTheme({
        typography: {
            fontFamily:
                '"Guardian Text Sans Web","Helvetica Neue",Helvetica,Arial,"Lucida Grande",sans-serif',
        },
        palette: palette,
    });
}

export {defaultPlutoTheme};
