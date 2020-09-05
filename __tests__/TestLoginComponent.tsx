import React from "react";
import LoginComponent from "../src/components/AppSwitcher/LoginComponent";
import {mount, shallow} from "enzyme";
import {JwtDataShape} from "../src/utils/DecodedProfile";
import sinon from "sinon";
jest.mock("../src/utils/OAuth2Helper");
import {refreshLogin} from "../src/utils/OAuth2Helper";
import {act} from "react-dom/test-utils";

describe("LoginComponent", ()=> {
    beforeEach(()=>jest.useFakeTimers());
    afterEach(()=>{
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    it("should set up an interval on load to check login state", () => {
        const loginExpiredCb = sinon.spy();

        const mockLoginData: JwtDataShape = {
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
    });

    it("should fire a callback and display a message if the login was successfully refreshed", async () => {
        const loginExpiredCb = sinon.spy();
        const loginRefreshedCb = sinon.spy();
        const loggedOutCb = sinon.spy();
        const loginCantRefreshCb = sinon.spy();

        const mockRefresh = sinon.stub();
        mockRefresh.returns(Promise.resolve());

        const mockLoginData: JwtDataShape = {
            aud: "my-audience",
            iss: "my-idP",
            iat: new Date().getTime() / 1000,
            exp: 78910,
        };

        const rendered = mount(<LoginComponent loginData={mockLoginData}
                                               onLoginExpired={loginExpiredCb}
                                               onLoginRefreshed={loginRefreshedCb}
                                               onLoggedOut={loggedOutCb}
                                               onLoginCantRefresh={loginCantRefreshCb}
                                               overrideRefreshLogin={mockRefresh}
                                               tokenUri="https://fake-token-uri"/>);

        expect(rendered.find("#refresh-in-progress").length).toEqual(0);
        expect(rendered.find("#refresh-failed").length).toEqual(0);
        expect(rendered.find("#refresh-success").length).toEqual(0);

        act(() => {
            jest.advanceTimersByTime(60001);
        });
        expect(mockRefresh.calledOnceWith("https://fake-token-uri")).toBeTruthy();
        await act(()=>Promise.resolve());    //this allows other outstanding promises to resolve _first_, including the one that
                                    //sets the component state and calls loginRefreshedCb
        expect(loginRefreshedCb.calledOnce).toBeTruthy();

        const updated = rendered.update();
        expect(updated.find("#refresh-success").length).toEqual(1);

        //the "success" message should disappear after 5s
        act(() => {
            jest.advanceTimersByTime(5001);
        });
        const nextupdate = rendered.update();
        expect(nextupdate.find("#refresh-success").length).toEqual(0);
    });

    it("should fire a callback and display a message if the refresh failed", async ()=>{
        // jest.useFakeTimers();
        const loginExpiredCb = sinon.spy();
        const loginRefreshedCb = sinon.spy();
        const loggedOutCb = sinon.spy();
        const loginCantRefreshCb = sinon.spy();

        const mockRefresh = sinon.stub();
        mockRefresh.returns(Promise.reject("Something went bang"));

        const mockLoginData:JwtDataShape = {
            aud: "my-audience",
            iss: "my-idP",
            iat: new Date().getTime() / 1000,
            exp: (new Date().getTime() / 1000)+30,
        };

        const rendered = mount(<LoginComponent loginData={mockLoginData}
                                               onLoginExpired={loginExpiredCb}
                                               onLoginRefreshed={loginRefreshedCb}
                                               onLoggedOut={loggedOutCb}
                                               onLoginCantRefresh={loginCantRefreshCb}
                                               overrideRefreshLogin={mockRefresh}
                                               tokenUri="https://fake-token-uri"/>);

        expect(rendered.find("#refresh-in-progress").length).toEqual(0);
        expect(rendered.find("#refresh-failed").length).toEqual(0);
        expect(rendered.find("#refresh-success").length).toEqual(0);

        act(()=>{
            jest.advanceTimersByTime(60001);
        });
        expect(mockRefresh.calledOnceWith("https://fake-token-uri")).toBeTruthy();

        await act(()=>Promise.resolve());    //this allows other outstanding promises to resolve _first_, including the one that
                                    //sets the component state and calls loginRefreshedCb
        expect(loginRefreshedCb.callCount).toEqual(0);

        const updated = rendered.update();
        expect(updated.find("#refresh-success").length).toEqual(0);
        const failureblock = updated.find("#refresh-failed");
        expect(failureblock.length).toEqual(1);
        // console.log(failureblock.debug());
        expect(failureblock.text()).toContain("Login expires in 30s");
    });
})