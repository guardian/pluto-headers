import axios from "axios";
import moxios from "moxios";
import sinon from "sinon";
import { handleUnauthorized } from "../../src/utils/Interceptor";

describe("handleUnauthorized", () => {
  let localaxios;

  beforeEach(() => {
    localaxios = axios.create();
    moxios.install();
  });

  afterEach(() => {
    moxios.uninstall();
    localaxios = undefined;
  });

  test("it should execute onRejectedCb on failing to refresh token on 401 Unauthorized", (done) => {
    let rejectedCb = sinon.spy();

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
              done();
            } catch(err) {
              done.fail(err);
            }
          }).then(()=> {
            try {
              expect(rejectedCb.calledOnce).toBeTruthy();
              done();
            } catch(err) {
              done.fail(err);
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
    const rejectedCb = sinon.spy();
    moxios.stubRequest("/uri/token", {
      status: 200,
      response: {
        count: 1,
        data: { access_token: "123", refresh_token: "456" },
      },
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
              done();
            } catch(err) {
              done.fail(err);
            }
          });
        }
      );

      localaxios.interceptors.response.handlers[1].rejected({
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
});
