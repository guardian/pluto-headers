import React from "react";
import LoginComponent from "../src/components/AppSwitcher/LoginComponent";
import {mount, shallow} from "enzyme";
import {JwtDataShape} from "../src/utils/DecodedProfile";
import sinon from "sinon";
jest.mock("../src/utils/OAuth2Helper");
import {refreshLogin} from "../src/utils/OAuth2Helper";
import {act} from "react-dom/test-utils";

describe("LoginComponent", ()=> {
    let assignSpy:jest.SpyInstance<any,[string]>;

    beforeEach(()=>{
        assignSpy = jest.spyOn(window.location,"assign");
        jest.useFakeTimers()
    });
    afterEach(()=>{
        assignSpy.mockRestore();
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
        expect(loginExpiredCb.callCount).toEqual(0);
        expect(loginCantRefreshCb.callCount).toEqual(0);
        expect(loggedOutCb.callCount).toEqual(0);
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
        expect(loggedOutCb.callCount).toEqual(0);
        expect(loginCantRefreshCb.callCount).toEqual(1);
        expect(loginExpiredCb.callCount).toEqual(0);

        const updated = rendered.update();
        expect(updated.find("#refresh-success").length).toEqual(0);
        const failureblock = updated.find("#refresh-failed");
        expect(failureblock.length).toEqual(1);
        // console.log(failureblock.debug());
        expect(failureblock.text()).toContain("Login expires in 30s");
    });

    it("should alert the parent when the login actually expires", async ()=>{
        const loginExpiredCb = sinon.spy();
        const loginRefreshedCb = sinon.spy();
        const loggedOutCb = sinon.spy();
        const loginCantRefreshCb = sinon.spy();

        const mockRefresh = sinon.stub();
        mockRefresh.returns(Promise.reject("Something went bang"));

        const mockLoginData:JwtDataShape = {
            aud: "my-audience",
            iss: "my-idP",
            iat: (new Date().getTime() / 1000)-3600,
            exp: (new Date().getTime() / 1000)-10,
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
        const first_update = rendered.update();
        expect(first_update.find("#refresh-in-progress").length).toEqual(1);
        expect(mockRefresh.calledOnceWith("https://fake-token-uri")).toBeTruthy();

        await act(()=>Promise.resolve());    //this allows other outstanding promises to resolve _first_, including the one that
        //sets the component state and calls callbacks
        expect(loginRefreshedCb.callCount).toEqual(0);
        expect(loggedOutCb.callCount).toEqual(0);
        expect(loginCantRefreshCb.callCount).toEqual(1);
        expect(loginExpiredCb.callCount).toEqual(1);


        const second_update = rendered.update();
        expect(second_update.find("#refresh-in-progress").length).toEqual(0);
        expect(second_update.find("#refresh-success").length).toEqual(0);
        const failureblock = second_update.find("#refresh-failed");
        expect(failureblock.length).toEqual(1);
        expect(failureblock.text()).toContain("Login has expired");
    });

    it("should notify parent when the user clicks Logout", ()=>{
        const loginExpiredCb = sinon.spy();
        const loginRefreshedCb = sinon.spy();
        const loggedOutCb = sinon.spy();
        const loginCantRefreshCb = sinon.spy();

        const mockRefresh = sinon.stub();
        mockRefresh.returns(Promise.resolve());

        const mockLoginData:JwtDataShape = {
            aud: "my-audience",
            iss: "my-idP",
            iat: (new Date().getTime() / 1000)-3600,
            exp: (new Date().getTime() / 1000)-10,
        };

        const rendered = mount(<LoginComponent loginData={mockLoginData}
                                               onLoginExpired={loginExpiredCb}
                                               onLoginRefreshed={loginRefreshedCb}
                                               onLoggedOut={loggedOutCb}
                                               onLoginCantRefresh={loginCantRefreshCb}
                                               overrideRefreshLogin={mockRefresh}
                                               tokenUri="https://fake-token-uri"/>);

        const btn = rendered.find("button.login-button");
        expect(btn.length).toEqual(1);
        btn.simulate("click");

        /* TODO: this is the behaviour as coded; the parent is expected to take care of reloading the
        page _if_ a callback is specified. should think about whether that is desirable.
         */
        expect(assignSpy).toHaveBeenCalledTimes(0);

        expect(loggedOutCb.callCount).toEqual(1);
        expect(loginExpiredCb.callCount).toEqual(0);
        expect(loginRefreshedCb.callCount).toEqual(0);
        expect(loginCantRefreshCb.callCount).toEqual(0);
        expect(mockRefresh.callCount).toEqual(0);
    })
})