import axios from "axios";
import moxios from "moxios";
import sinon from "sinon";
import { handleUnauthorized } from "../../src/utils/Interceptor";

describe("handleUnauthorized", () => {
  test("it should execute onRejectedCb on failing to refresh token on 401 Unauthorized", (done) => {
    const localaxios = axios.create();
    moxios.install(localaxios);
    const rejectedCb = sinon.spy();

    return moxios.wait(() => {
      moxios.stubRequest("/uri/token", {
        status: 400,
        response: {
          count: 1,
          data: { message: "Bad Request" },
        },
      });

      localaxios.interceptors.response.use(
        (response) => response,
        (error) => {
          handleUnauthorized(
            { tokenUri: "/uri/token", clientId: "client" },
            error,
            rejectedCb
          ).catch(() => {
            try {
              expect(rejectedCb.calledOnce).toBeTruthy();
              moxios.uninstall(localaxios);
              done();
            } catch(err) {
                moxios.uninstall(localaxios);
              expect(err).toBe("something");
            }
          }).then(()=> {
            try {
              expect(rejectedCb.calledOnce).toBeTruthy();
                moxios.uninstall(localaxios);
              done();
            } catch(err) {
                moxios.uninstall(localaxios);
              expect(err.message).toBe("Expected done to be called once, but it was called multiple times.");
            }
          })
          ;
        }
      );

      localaxios.interceptors.response.handlers[0].rejected({
        response: {
          status: 401,
        },
        config: {
          headers: {
            Authorization: "Bearer 123",
          },
        },
      });
    });
  });

  test("it should not execute onRejectedCb on successfully refreshing token on 401 Unauthorized", (done) => {
    const localaxios = axios.create();
    moxios.install();
    moxios.install(localaxios);
    const rejectedCb = sinon.spy();

    moxios.stubRequest("/uri/token", {
      status: 200,
      response: {
        count: 1,
        data: { access_token: "123", refresh_token: "456" },
      },
    });

    moxios.stubRequest("https://some/url", {
      status: 200,
      response: {
        detail: "it worked!"
      }
    });

    return moxios.wait(() => {
      localaxios.interceptors.response.use(
        (response) => response,
        (error) => {
          handleUnauthorized(
            { tokenUri: "/uri/token", clientId: "client" },
            error,
            rejectedCb
          ).then(() => {
            try {
              expect(rejectedCb.notCalled).toBeTruthy();
                moxios.uninstall();
                moxios.uninstall(localaxios);
              done();
            } catch(err) {
                moxios.uninstall();
                moxios.uninstall(localaxios);
              expect(err).toBe("just some text to force fail")
            }
          }).catch((err)=>expect(err).toBe("just some text to force fail"));
        }
      );

      localaxios.interceptors.response.handlers[0].rejected({
        response: {
          status: 401,
        },
        config: {
          headers: {
            Authorization: "Bearer 123",
          },
          url: "https://some/url"
        },
      });
    });
  });
});
