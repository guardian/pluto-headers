import React, {useContext} from "react";
import {UserContext, UserContextProvider} from "../../../src/components/Context/UserContext";
import {mount} from "enzyme";
import {JwtDataShape} from "../../../src/utils/DecodedProfile";


describe("UserContext", ()=>{
    const ExampleComponent = () => {
        const userContext = useContext(UserContext);
        return (
            <p id="login">{
                userContext?.profile?.username ? `You are logged in as ${userContext.profile.username}` : "You are not logged in"
            }</p>
        )
    }

    it("should represent a higher-order state", ()=>{
        const fakeProfile:JwtDataShape = {
            aud: "testee",
            iss: "tester",
            iat: Date.now(),
            exp: Date.now()+60000,
            username: "ms flibble"
        }

        const rendered = mount(<div>
            <UserContextProvider value={{
            profile: fakeProfile,
                updateProfile: (newValue) => {}
            }}>
                <ExampleComponent/>
            </UserContextProvider>
        </div>);

        expect(rendered.find("p#login").text()).toEqual("You are logged in as ms flibble");
    });

    it("should be undefined initially", ()=>{
        const rendered = mount(<div>
            <UserContextProvider value={{
                profile: undefined,
                updateProfile: (newValue) => {}
            }}>
                <ExampleComponent/>
            </UserContextProvider>
        </div>);

        expect(rendered.find("p#login").text()).toEqual("You are not logged in");
    })
})