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
 * @param tokenUri server uri to make the refresh request to
 * @returns a Promise
 */
export declare const refreshLogin: (tokenUri: string) => Promise<void>;
