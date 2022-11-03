import { verifyJwt } from "../../src";
import {OAuthContextData} from "../../src";
import fetchMock from "jest-fetch-mock";

describe("validateAndDecode", () => {
    beforeEach(()=>{
        localStorage.clear();
        fetchMock.resetMocks();
    });

  it("should decode an example jwt", (done) => {
    const exampleToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    //can get them from https://jwt.io/
      const oauthconfig:OAuthContextData = {
          clientId: "", oAuthUri: "", redirectUri: "", tokenUri: ""
      }
      fetchMock.mockResponseOnce("your-256-bit-secret")
    verifyJwt(oauthconfig, exampleToken)
      .then((decodedContent) => {
        expect(decodedContent.sub).toEqual("1234567890");
        expect(decodedContent.name).toEqual("John Doe");
        expect(decodedContent.iat).toEqual(1516239022);

        done();
      })
      .catch((err) => {
        console.error(err);
        expect(err.message).toBe('Something')
      });
  });

  it("should reject if the jwt is not valid", (done) => {
    const exampleToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwidXNlcm5hbWUiOiJqb2huX2RvZSIsImZhbWlseV9uYW1lIjoiRG9lIiwiZmlyc3RfbmFtZSI6IkpvaG4iLCJpYXQiOjE1MTYyMzkwMjJ9.IfSuq8z7BL6DQIydiK5fEC85z9t_twQTQj0rfTpMXPa";
    //can get them from https://jwt.io/
      const oauthconfig:OAuthContextData = {
          clientId: "", oAuthUri: "", redirectUri: "", tokenUri: ""
      }
      fetchMock.mockResponseOnce("your-256-bit-secret");
      verifyJwt(oauthconfig, exampleToken)
      .then((decodedContent) => {
        console.log(decodedContent);

        done.fail("expected invalid JWT to fail but it succeeded");
      })
      .catch((err) => {
        done();
      });
  });
});
