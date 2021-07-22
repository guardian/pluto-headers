import { createMuiTheme } from "@material-ui/core";

const defaultPlutoTheme = createMuiTheme({
    typography: {
        fontFamily:
            '"Guardian Text Sans Web","Helvetica Neue",Helvetica,Arial,"Lucida Grande",sans-serif',
    },
    palette: {
        type: "dark",
        background: {
            paper: "#424242A0",
        },
    },
});

export {defaultPlutoTheme};
