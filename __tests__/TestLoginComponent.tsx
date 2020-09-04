import React from "react";
import LoginComponent from "../src/components/AppSwitcher/LoginComponent";
import {mount, shallow} from "enzyme";
import {JwtDataShape} from "../src/utils/DecodedProfile";
import sinon from "sinon";

describe("LoginComponent", ()=>{
    it("should set up an interval on load to check login state", ()=>{
        jest.useFakeTimers();
        const loginExpiredCb = sinon.spy();

        const mockLoginData:JwtDataShape = {
            aud: "my-audience",
            iss: "my-idP",
            iat: 123456,
            exp: 78910,
        };

        const rendered = mount(<LoginComponent loginData={mockLoginData}
                                               onLoginExpired={loginExpiredCb}
                                               tokenUri="https://fake-token-uri"/>);
        expect(setInterval).toHaveBeenCalledTimes(1);
        expect(loginExpiredCb.callCount).toEqual(0);
        jest.useRealTimers();
    });


})