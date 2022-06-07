import {OAuthContextData} from "../components/Context/OAuthContext";
import {verifyJwt} from "./JwtHelpers";
import {UserContext} from "../components/Context/UserContext";
import {JwtData} from "./DecodedProfile";

/**
 * call out to the IdP to request a refresh of the login using the refresh token stored in the localstorage.
 * on success, the updated token is stored in the local storage and the promise resolves
 * on failure, the local storage is not touched and the promise rejects with an error string
 * if the server returns a 500 or 503/504 error then it's assumed to be transient and the request will be retried
 * after a 2s delay.
 *
 * this is NOT written as a conventional async function in order to utilise more fine-grained control of when the promise
 * is resolved; i.e., it calls itself on a timer in order to retry so we must only resolve the promise once there has been
 * a definitive success or failure of the operation which could be after multiple calls
 * @param oAuthConfig OAuthContextData giving the server configuration, so we have the refresh url
 * @param userContext UserContext object giving the present user profile. We use the `update` method on this to update the profile once
 * login refresh is completed
 * @returns a Promise
 */
export const refreshLogin:(oAuthConfig:OAuthContextData, userContext:UserContext)=>Promise<void> = (oAuthConfig, userContext) => new Promise((resolve,reject)=>{
    const refreshToken = localStorage.getItem("pluto:refresh-token");
    if(!refreshToken) {
        reject("No refresh token");
    }

    const postdata:{[index:string]:string } = {
        grant_type: "refresh_token",
        refresh_token: refreshToken as string
    };
    const content_elements = Object.keys(postdata).map(
        (k) => k + "=" + encodeURIComponent(postdata[k])
    );
    const body_content = content_elements.join("&");

    const performRefresh = async ()=> {
        const response = await fetch(oAuthConfig.tokenUri, {
            method: "POST",
            body: body_content,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        switch (response.status) {
            case 200:
                try {
                    const content = await response.json();
                    console.log("Server response: ", content);
                    const result = await verifyJwt(oAuthConfig, content.id_token ?? content.access_token, content.refresh_token);
                    const updatedProfile = JwtData(result);
                    userContext.updateProfile(updatedProfile);

                    // localStorage.setItem("pluto:access-token", content.id_token ?? content.access_token);
                    // if (content.refresh_token) localStorage.setItem("pluto:refresh-token", content.refresh_token);
                    resolve();
                } catch(err) {
                    reject(err);
                }
                break;
            case 403:
            case 401:
                console.log("Refresh was rejected with a forbidden error");
                reject("Request forbidden");
                break;
            case 500:
                console.log("Refresh was rejected due to a server error");
                window.setTimeout(() => performRefresh(), 2000);    //try again in 2s
                break;
            case 503:
            case 504:
                console.log("Authentication server not available");
                window.setTimeout(() => performRefresh(), 2000);    //try again in 2s
                break;
            default:
                const errorbody = await response.text();
                console.log("Unexpected response from authentication server: ", response.status, errorbody);
                reject("Unexpected response");
                break;
        }
    }

    performRefresh().catch(err=>reject(err.toString()));
})