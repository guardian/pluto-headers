import React, {useState, useEffect, useRef, useContext} from "react";
import {Button, Grid, IconButton, Tooltip, Typography} from "@material-ui/core";
import {JwtDataShape} from "../../utils/DecodedProfile";
import {CircularProgress} from "@material-ui/core";
import {Error, CheckCircle, Person, Brightness7, Brightness4} from "@material-ui/icons";
import {refreshLogin} from "../../utils/OAuth2Helper";
import {makeStyles} from "@material-ui/core/styles";
import CustomisingThemeContext from "../Theme/CustomisingThemeContext";

interface LoginComponentProps {
    refreshToken?: string;
    checkInterval?:number;
    loginData: JwtDataShape;
    onLoginRefreshed?: ()=>void;
    onLoginCantRefresh?: (reason:string)=>void;
    onLoginExpired: ()=>void;
    onLoggedOut?: ()=>void;
    overrideRefreshLogin?: (tokenUri:string)=>Promise<void>;    //only used for testing
    tokenUri: string;
}

const useStyles = makeStyles({
    inlineIcon: {
        padding: 0,
        margin: "auto",
        display: "inline-block",
        marginRight: "0.2em",
        maxWidth: "16px",
        maxHeight: "16px",
    },
    textOnGrey: {
        color: "black"
    },
    themeSwitcher: {
        height: "36px",
        width: "36px",
        padding: "6px"
    }
});

const LoginComponent:React.FC<LoginComponentProps> = (props) => {
    const [refreshInProgress, setRefreshInProgress] = useState<boolean>(false);
    const [refreshFailed, setRefreshFailed] = useState<boolean>(false);
    const [refreshed, setRefreshed] = useState<boolean>(false);
    const [loginExpiryCount, setLoginExpiryCount] = useState<string>("");

    let loginDataRef = useRef(props.loginData);
    const tokenUriRef = useRef(props.tokenUri);
    const overrideRefreshLoginRef = useRef(props.overrideRefreshLogin);

    const classes = useStyles();

    const themeContext = useContext(CustomisingThemeContext);

    useEffect(()=>{
        const intervalTimerId = window.setInterval(checkExpiryHandler, props.checkInterval ?? 60000);

        return (()=>{
            console.log("removing checkExpiryHandler")
            window.clearInterval(intervalTimerId);
        })
    }, []);

    useEffect(()=>{
        console.log("refreshFailed was toggled to ", refreshFailed);
        if(refreshFailed) {
            console.log("setting countdown handler");
            const intervalTimerId = window.setInterval(updateCountdownHandler, 1000);
            return (()=>{
                console.log("cleared countdown handler");
                window.clearInterval(intervalTimerId);
            })
        }
    }, [refreshFailed]);

    useEffect(()=>{
      loginDataRef.current = props.loginData;
    }, [props.loginData]);

    /**
     * called periodically every second once a refresh has failed to alert the user how long they have left
     */
    const updateCountdownHandler = () => {
        const nowTime = new Date().getTime() / 1000; //assume time is in seconds
        const expiry = loginDataRef.current.exp;
        const timeToGo = expiry - nowTime;

        if(timeToGo>1) {
            setLoginExpiryCount(`expires in ${Math.ceil(timeToGo)}s`);
        } else {
            if(props.onLoginExpired) props.onLoginExpired();
            setLoginExpiryCount("has expired");
        }
    }

    /**
     * lightweight function that is called every minute to verify the state of the token
     * it returns a promise that resolves when the component state has been updated. In normal usage this
     * is ignored but it is used in testing to ensure that the component state is only checked after it has been set.
     */
    const checkExpiryHandler = () => {
        if (loginDataRef.current) {
            const nowTime = new Date().getTime() / 1000; //assume time is in seconds
            //we know that it is not null due to above check
            const expiry = loginDataRef.current.exp;
            const timeToGo = expiry - nowTime;

            if (timeToGo <= 120) {
                console.log("less than 2mins to expiry, attempting refresh...");
                setRefreshInProgress(true);

                let refreshedPromise;

                if(overrideRefreshLoginRef.current){
                    refreshedPromise = overrideRefreshLoginRef.current(tokenUriRef.current);
                }  else {
                    refreshedPromise = refreshLogin(tokenUriRef.current);
                }

                refreshedPromise.then(()=>{
                    console.log("Login refreshed");
                    setRefreshInProgress(false);
                    setRefreshFailed(false);
                    setRefreshed(true);

                    if(props.onLoginRefreshed) props.onLoginRefreshed();
                    window.setTimeout(()=>setRefreshed(false), 5000);   //show success message for 5s
                }).catch(errString=>{
                    if(props.onLoginCantRefresh) props.onLoginCantRefresh(errString);
                    setRefreshFailed(true);
                    setRefreshInProgress(false);
                    updateCountdownHandler();
                    return;
                })
            }
        } else {
            console.log("no login data present for expiry check");
        }
    };

    const toggleThemeMode = ()=>themeContext.changeDarkMode(!themeContext.darkMode);

    return (
        <Grid container className="login-block" direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
            <Grid item>
                <Grid container spacing={0} alignItems="flex-start" justifyContent="flex-end">
                    <Grid item style={{marginRight: "0.2em"}}>
                        <Typography className={classes.textOnGrey}>You are logged in as</Typography></Grid>
                    <Grid item><Person className={classes.textOnGrey}/></Grid>
                    <Grid item><Typography className="username">{props.loginData.preferred_username ?? props.loginData.username}</Typography></Grid>
                </Grid>
            </Grid>
            <Grid item>
                <IconButton onClick={toggleThemeMode} className={classes.themeSwitcher}>
                    {
                        themeContext.darkMode ? <Brightness7 style={{color: "rgba(0, 0, 0, 0.54)"}}/> : <Brightness4/>
                    }
                </IconButton>
            </Grid>
            {
                refreshInProgress ?
                    <Grid item id="refresh-in-progress">
                        <Grid container spacing={0} alignItems="flex-end" justifyContent="flex-end">
                            <Grid item><CircularProgress className={classes.inlineIcon}/></Grid>
                            <Grid item><Typography>Refreshing your login...</Typography></Grid>
                        </Grid>
                    </Grid>
                : null
            }
            {
                refreshFailed ?
                    <Grid item>
                        <Grid container spacing={0} alignItems="flex-end" justifyContent="flex-end" id="refresh-failed">
                            <Grid item><Error style={{color:"red"}} className={classes.inlineIcon}/></Grid>
                            <Grid item>
                                <Tooltip title="Could not refresh login, try logging out and logging in again">
                                    <Typography>Login {loginExpiryCount}</Typography>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </Grid>
                    : null
            }
            {
                refreshed ?
                    <Grid item id="refresh-success">
                        <Grid container spacing={0} alignItems="center" justifyContent="flex-end">
                            <Grid item><CheckCircle style={{color:"green"}} className={classes.inlineIcon}/></Grid>
                            <Grid item><Typography>Token refreshed</Typography></Grid>
                        </Grid>
                    </Grid>
                : null
            }

            <Grid item>
              <Button
                  className="login-button"
                  variant="outlined"
                  size="small"
                  onClick={() => {
                      if (props.onLoggedOut) {
                          props.onLoggedOut();
                          return;
                      }

                      window.location.assign("/logout");
                  }}
              >
                Logout
              </Button>
            </Grid>
        </Grid>
    )
}

export default LoginComponent;
