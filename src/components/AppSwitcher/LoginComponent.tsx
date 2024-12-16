import React, {useState, useEffect, useRef, useContext} from "react";
import {Button, Grid, IconButton, Tooltip, Typography} from "@material-ui/core";
import {CircularProgress} from "@material-ui/core";
import {Error, CheckCircle, Person, Brightness7, Brightness4, HelpOutline} from "@material-ui/icons";
import {refreshLogin} from "../../utils/OAuth2Helper";
import {makeStyles} from "@material-ui/core/styles";
import CustomisingThemeContext from "../Theme/CustomisingThemeContext";
import {OAuthContext} from "../Context/OAuthContext";
import {UserContext} from "../Context/UserContext";

interface LoginComponentProps {
    refreshToken?: string;
    checkInterval?:number;
    onLoginRefreshed?: ()=>void;
    onLoginCantRefresh?: (reason:string)=>void;
    onLoginExpired: ()=>void;
    onLoggedOut?: ()=>void;
    overrideRefreshLogin?: (tokenUri:string)=>Promise<void>;    //only used for testing
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
    iconButton: {
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

    const overrideRefreshLoginRef = useRef(props.overrideRefreshLogin);

    const classes = useStyles();

    const oAuthContext = useContext(OAuthContext);
    const userContext = useContext(UserContext);

    const themeContext = useContext(CustomisingThemeContext);

    useEffect(()=>{
        const intervalTimerId = window.setInterval(checkExpiryHandler, props.checkInterval ?? 60000);

        return (()=>{
            window.clearInterval(intervalTimerId);
        })
    }, [userContext]);

    useEffect(()=>{
        if(refreshFailed) {
            const intervalTimerId = window.setInterval(updateCountdownHandler, 1000);
            return (()=>{
                window.clearInterval(intervalTimerId);
            })
        }
    }, [refreshFailed]);


    /**
     * called periodically every second once a refresh has failed to alert the user how long they have left
     */
    const updateCountdownHandler = () => {
        if(userContext.profile) {
            const nowTime = new Date().getTime() / 1000; //assume time is in seconds
            const expiry = userContext.profile.exp;
            const timeToGo = expiry - nowTime;

            if (timeToGo > 1) {
                setLoginExpiryCount(`expires in ${Math.ceil(timeToGo)}s`);
            } else {
                if (props.onLoginExpired) props.onLoginExpired();
                setLoginExpiryCount("has expired");
            }
        }
    }

    /**
     * lightweight function that is called every minute to verify the state of the token
     * it returns a promise that resolves when the component state has been updated. In normal usage this
     * is ignored but it is used in testing to ensure that the component state is only checked after it has been set.
     */
    const checkExpiryHandler = () => {
        if (userContext.profile && oAuthContext) {
            const nowTime = new Date().getTime() / 1000; //assume time is in seconds
            //we know that it is not null due to above check
            const expiry = userContext.profile.exp;
            const timeToGo = expiry - nowTime;

            if (timeToGo <= 120) {
                console.log("less than 2mins to expiry, attempting refresh...");
                setRefreshInProgress(true);

                let refreshedPromise;

                if(overrideRefreshLoginRef.current){
                    refreshedPromise = overrideRefreshLoginRef.current(oAuthContext.tokenUri);
                }  else {
                    refreshedPromise = refreshLogin(oAuthContext, userContext);
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
    const openDocs = ()=> window.open(
        "pluto-core/help",
        "_blank"
    )

    const usernameFromProfile = ()=>{
        if(userContext.profile) {
            return userContext.profile.preferred_username ?? userContext.profile.username ?? userContext.profile.email
        } else {
            return "(unknown)"
        }
    }

    return (
        <Grid container className="login-block" direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
            <Grid item>
                <Grid container spacing={0} alignItems="flex-start" justifyContent="flex-end">
                    <Grid item style={{marginRight: "0.2em"}}>
                        <Typography className={classes.textOnGrey}>You are logged in as</Typography></Grid>
                    <Grid item><Person className={classes.textOnGrey}/></Grid>
                    <Grid item><Typography className="username">{usernameFromProfile()}</Typography></Grid>
                </Grid>
            </Grid>
            <Grid item>
                <Tooltip title="Switch dark/light theme">
                    <IconButton onClick={toggleThemeMode} className={classes.iconButton}>
                        {
                            themeContext.darkMode ? <Brightness7 style={{color: "rgba(0, 0, 0, 0.54)"}}/> : <Brightness4/>
                        }
                    </IconButton>
                </Tooltip>
            </Grid>
            <Grid item>
                <Tooltip title="Open help page">
                    <Button
                        className="help-button"
                        variant="outlined"
                        size="small"
                        onClick={openDocs}
                        style={{  marginLeft: "10px", borderColor: "black", color: "black" }}
                    >
                      Help
                    </Button>
                </Tooltip>
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
                      if(oAuthContext?.logoutUri) {
                          const currentUri = new URL(window.location.href);
                          const redirectUrl =
                              currentUri.protocol + "//" + currentUri.host + "/logout";
                          const params:{ [key:string]: string } = {
                              client_id: encodeURIComponent(oAuthContext.clientId),
                              post_logout_redirect_uri: encodeURIComponent(redirectUrl)
                          }
                          const queryString = Object
                              .keys(params)
                              .map(k=>`${k}=${params[k]}`)
                              .join("&");

                          const externalLogoutUri = `${oAuthContext.logoutUri}?${queryString}`;
                          window.location.assign(externalLogoutUri);
                      } else {
                          if (props.onLoggedOut) {
                              props.onLoggedOut();
                              return;
                          }

                          window.location.assign("/logout");
                      }
                  }}
              >
                Logout
              </Button>
            </Grid>
        </Grid>
    )
}

export default LoginComponent;
