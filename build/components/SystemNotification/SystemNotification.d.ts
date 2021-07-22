import React from "react";
/**
 * these values correspond to the material-ui palette labels, so are safe to use below with
 * `severity={SystemNotificationKind.toString() as Color}`
 */
export declare enum SystemNotifcationKind {
    Success = "success",
    Error = "error",
    Info = "info",
    Warning = "warning"
}
declare type OpenFunc = (kind: SystemNotifcationKind, message: string) => void;
declare const SystemNotification: React.FC<{}> & {
    open: OpenFunc;
};
export { SystemNotification };
