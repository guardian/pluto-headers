import React, {useContext} from "react";
import fetchMock from "jest-fetch-mock";
import {OAuthContext, OAuthContextProvider} from "../../../src";
import {mount} from "enzyme";
import {act} from "react-dom/test-utils";
import sinon from "sinon";
import {makeLoginUrl, OAuthContextData} from "../../../src";

describe("OAuthContextProvider", ()=>{
    beforeEach(()=>{
        localStorage.clear();
        fetchMock.resetMocks();
    });

    const ExampleComponent = () => {
        const oAuthContext = useContext(OAuthContext);

        return (
            <>
                <p id="oAuthUri">{oAuthContext?.oAuthUri}</p>
                <p id="redirectUri">{oAuthContext?.redirectUri}</p>
                <p id="tokenUri">{oAuthContext?.tokenUri}</p>
                <p id="clientId">{oAuthContext?.clientId}</p>
                <p id="resource">{oAuthContext?.resource}</p>
            </>
        )
    }

    function simpleTimeout(time:number):Promise<void> {
        return new Promise<void>((resolve, reject)=>window.setTimeout(()=>resolve(), time))
    }

    it("should load in oAuth data from the server and make that available to subcomponents", async ()=>{
        const mockedResponseData = {
            clientId: "some-client",
            tokenUri: "some-token",
            oAuthUri: "some-uri",
            resource: "some-resource"
        };

        const errorCb = sinon.spy();

        return act(async ()=> {
            fetchMock.mockResponseOnce(JSON.stringify(mockedResponseData));
            const rendered = mount(<div>
                <OAuthContextProvider onError={errorCb}>
                    <ExampleComponent/>
                </OAuthContextProvider>
            </div>);

            await simpleTimeout(1000)
            rendered.update();

            expect(rendered.find("p#oAuthUri").text()).toEqual("some-uri");
            expect(rendered.find("p#redirectUri").text()).toEqual("http://localhost/oauth2/callback");
            expect(rendered.find("p#tokenUri").text()).toEqual("some-token");
            expect(rendered.find("p#clientId").text()).toEqual("some-client");
            expect(rendered.find("p#resource").text()).toEqual("some-resource");
            expect(errorCb.called).toBeFalsy();
        });
    });

    it("should call the optional onError callback if the server won't provide data", async ()=>{
        const errorCb = sinon.spy();

        return act(async ()=> {
            fetchMock.mockResponseOnce(JSON.stringify({status: "error"}), {status: 500});

            const rendered = mount(<div>
                <OAuthContextProvider onError={errorCb}>
                    <ExampleComponent/>
                </OAuthContextProvider>
            </div>);

            await simpleTimeout(1000)
            rendered.update();

            expect(rendered.find("p#oAuthUri").text()).toEqual("");
            expect(rendered.find("p#redirectUri").text()).toEqual("");
            expect(rendered.find("p#tokenUri").text()).toEqual("");
            expect(rendered.find("p#clientId").text()).toEqual("");
            expect(rendered.find("p#resource").text()).toEqual("");
            expect(errorCb.called).toBeTruthy();
        });
    });
});

describe("makeLoginUrl", ()=>{
    it("should build an oauth url from the parameters available", ()=>{
        const sampleData:OAuthContextData = {
            clientId: "some-client",
            resource: "some-resource",
            oAuthUri: "some-oauth-uri",
            tokenUri: "some-token-uri",
            redirectUri: "https://some-redirect/uri"
        };

        const result = makeLoginUrl(sampleData);
        expect(result).toEqual("some-oauth-uri?response_type=code&client_id=some-client&resource=some-resource&redirect_uri=https%3A%2F%2Fsome-redirect%2Furi&state=%2F");
    })
})