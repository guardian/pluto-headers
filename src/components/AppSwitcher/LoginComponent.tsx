import React, {useState, useEffect, useRef} from "react";
import {Button, Tooltip} from "@material-ui/core";
import {JwtDataShape} from "../../utils/DecodedProfile";
import {CircularProgress} from "@material-ui/core";
import {Error, CheckCircle} from "@material-ui/icons";
import {refreshLogin} from "../../utils/OAuth2Helper";

interface LoginComponentProps {
    refreshToken?: string;
    checkInterval?:number;
    loginData: JwtDataShape;
    onLoginRefreshed?: ()=>void;
    onLoginCantRefresh?: (reason:string)=>void;
    onLoginExpired: ()=>void;
    onLoggedOut?: ()=>void;
    tokenUri: string;
}

const LoginComponent:React.FC<LoginComponentProps> = (props) => {
    const [refreshInProgress, setRefreshInProgress] = useState<boolean>(false);
    const [refreshFailed, setRefreshFailed] = useState<boolean>(false);
    const [refreshed, setRefreshed] = useState<boolean>(false);
    const [loginExpiryCount, setLoginExpiryCount] = useState<string>("");

    const loginDataRef = useRef(props.loginData);
    const tokenUriRef = useRef(props.tokenUri);

    useEffect(()=>{
        const intervalTimerId = window.setInterval(checkExpiryHandler, props.checkInterval ?? 60000);

        return (()=>{
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
    }, [refreshFailed])

    /**
     * called periodically every second once a refresh has failed to alert the user how long they have left
     */
    const updateCountdownHandler = () => {
        const nowTime = new Date().getTime() / 1000; //assume time is in seconds
        const expiry = loginDataRef.current.exp;
        const timeToGo = expiry - nowTime;

        setLoginExpiryCount(`${timeToGo}s`);
    }

    /**
     * lightweight function that is called every minute to verify the state of the token
     * it returns a promise that resolves when the component state has been updated. In normal usage this
     * is ignored but it is used in testing to ensure that the component state is only checked after it has been set.
     */
    const checkExpiryHandler = () => {
        if (loginDataRef) {
            const nowTime = new Date().getTime() / 1000; //assume time is in seconds
            //we know that it is not null due to above check
            const expiry = loginDataRef.current.exp;
            const timeToGo = expiry - nowTime;

            if (timeToGo <= 120) {
                console.log("less than 2mins to expiry, attempting refresh...");
                setRefreshInProgress(true);
                refreshLogin(tokenUriRef.current).then(()=>{
                    if(props.onLoginRefreshed) props.onLoginRefreshed();
                    console.log("Login refreshed");
                    setRefreshInProgress(false);
                    setRefreshFailed(false);
                    setRefreshed(true);
                    window.setTimeout(()=>setRefreshed(false), 5000);   //show success message for 5s
                }).catch(errString=>{
                    if(props.onLoginCantRefresh) props.onLoginCantRefresh(errString);
                    setRefreshFailed(true);
                    setRefreshInProgress(false);
                    return;
                })
            }
            if (timeToGo <= 0) {
                console.log("login has expired already");
                props.onLoginExpired();
            }
        } else {
            console.log("no login data present for expiry check");
        }
    };

    return (
        <div className="login-block">
            {
                refreshInProgress ? <span id="refresh-in-progress">
                    <CircularProgress/>&nbsp;Refreshing your login...
                </span> : null
            }
            {
                refreshFailed ? <span id="refresh-failed">
                    <Tooltip title="Could not refresh login, try logging out and logging in again">
                        <>
                        <Error style={{color:"red"}}/>&nbsp;Login expires in {loginExpiryCount}
                        </>
                    </Tooltip>
                </span> : null
            }
            {
                refreshed ? <span id="refresh-success">
                    <CheckCircle style={{color:"green"}}/>&nbsp;Token refreshed
                </span> : null
            }
            <span>
              You are logged in as <span className="username">{props.loginData.preferred_username ?? props.loginData.username}</span>
            </span>
            <span>
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
            </span>
        </div>
    )
}

export default LoginComponent;