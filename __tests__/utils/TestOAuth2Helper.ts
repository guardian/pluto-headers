import {refreshLogin} from "../../src/utils/OAuth2Helper";
import fetchMock from "jest-fetch-mock";
import {OAuthContextData, UserContext} from "../../build";
import sinon from "sinon";
import {JWTPayload} from "jose";

describe("refreshLogin", ()=>{
    beforeEach(()=>{
        localStorage.clear();
        fetchMock.resetMocks();
    })

    it("should call out to the IdP endpoint with the refresh token and resolve on success", async ()=>{
        fetchMock.mockResponseOnce(JSON.stringify({
            access_token: "some-access-token",
            refresh_token: "some-new-refresh-token"
        }));

        const oauthconfig:OAuthContextData = {
            clientId: "", oAuthUri: "", redirectUri: "", tokenUri: "https://fake-token-uri/endpoint"
        }

        const mockUpdateProfile = sinon.spy();
        const mockVerifyToken = sinon.stub();
        mockVerifyToken.returns(new Promise<JWTPayload>((resolve, reject)=>{
            resolve({})
        }));

        const userContext:UserContext = {
            updateProfile: mockUpdateProfile,
            profile: undefined

        }
        localStorage.setItem("pluto:refresh-token","some-old-refresh-token");
        await refreshLogin(oauthconfig, userContext, mockVerifyToken);

        //the browser storage is now set in verifyToken, which has been stubbed out on this test
        expect(mockUpdateProfile.callCount).toEqual(1);
        expect(mockVerifyToken.callCount).toEqual(1);
    });

    it("should reject with Request forbidden if the server returns a 403", async ()=>{
        fetchMock.mockReturnValue(Promise.resolve(new Response(JSON.stringify({"status":"forbidden"}),{status:403})));

        localStorage.setItem("pluto:refresh-token","some-old-refresh-token");
        const oauthconfig:OAuthContextData = {
            clientId: "", oAuthUri: "", redirectUri: "", tokenUri: "https://fake-token-uri/endpoint"
        }

        const mockUpdateProfile = sinon.spy();

        const userContext:UserContext = {
            updateProfile: mockUpdateProfile,
            profile: undefined

        }

        try {
            await refreshLogin(oauthconfig, userContext);
            throw "Promise did not reject as expected"
        } catch(err) {
            if(err==="Request forbidden") {
                return;
            } else {
                throw err;
            }
        }
    });

    it("should reject if the server returns an unexpected code", async ()=>{
        fetchMock.mockReturnValue(Promise.resolve(new Response(JSON.stringify({"status":"coffee"}),{status:418})));

        localStorage.setItem("pluto:refresh-token","some-old-refresh-token");
        const oauthconfig:OAuthContextData = {
            clientId: "", oAuthUri: "", redirectUri: "", tokenUri: "https://fake-token-uri/endpoint"
        }

        const mockUpdateProfile = sinon.spy();

        const userContext:UserContext = {
            updateProfile: mockUpdateProfile,
            profile: undefined

        }

        try {
            await refreshLogin(oauthconfig, userContext);
            throw "Promise did not reject as expected"
        } catch(err) {
            if(err==="Unexpected response") {
                return;
            } else {
                throw err;
            }
        }
    });

    it("should retry on a 503 or 500 error", async ()=>{
        fetchMock.mockResponses([
            "",
            {status: 503}
        ],[
            JSON.stringify({"status":"broken"}),
            {status: 500}
        ],[
            JSON.stringify({
                access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
                refresh_token: "some-new-refresh-token"
            }),
            {status: 200}
        ],[
            "your-256-bit-secret",{status: 200}
        ]);

        const oauthconfig:OAuthContextData = {
            clientId: "", oAuthUri: "", redirectUri: "", tokenUri: "https://fake-token-uri/endpoint"
        }

        const mockUpdateProfile = sinon.spy();

        const userContext:UserContext = {
            updateProfile: mockUpdateProfile,
            profile: undefined
        }

        localStorage.setItem("pluto:refresh-token","some-old-refresh-token");
        await refreshLogin(oauthconfig, userContext);
        expect(localStorage.getItem("pluto:access-token")).toEqual("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
        expect(localStorage.getItem("pluto:refresh-token")).toEqual("some-new-refresh-token");
    })
})