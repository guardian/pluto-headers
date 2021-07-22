import React from "react";
import { JwtDataShape } from "../../utils/DecodedProfile";
interface UserContext {
    profile?: JwtDataShape;
    updateProfile: (newValue?: JwtDataShape) => void;
}
declare const UserContext: React.Context<UserContext>;
export declare const UserContextProvider: React.Provider<UserContext>;
export { UserContext };
