import React from "react";
import {mount} from "enzyme";
import {SystemNotifcationKind, SystemNotification} from "../../../src";
import {act} from "react-dom/test-utils";

describe("SystemNotification", ()=>{
    it("should present a notification with SUCCESS severity", ()=>{
        const rendered = mount(<div>
            <h1>Some text</h1>
            <SystemNotification/>
        </div>);

        expect(rendered.find("div.MuiSnackbar-root").length).toEqual(0);
        expect(rendered.find("div.MuiAlert-message").length).toEqual(0);

        act(()=>{
            SystemNotification.open(SystemNotifcationKind.Info, "Something good happened");
        });
        rendered.update();

        const snackbar = rendered.find("div.MuiSnackbar-root");
        expect(snackbar.length).toEqual(1);

        expect(rendered.find("div.MuiAlert-message").text()).toEqual("Something good happened");
        expect(rendered.find("div.MuiAlert-icon").length).toEqual(1);
    });

    it("should present a notification with ERROR severity", ()=>{
        const rendered = mount(<div>
            <h1>Some text</h1>
            <SystemNotification/>
        </div>);

        expect(rendered.find("div.MuiSnackbar-root").length).toEqual(0);
        expect(rendered.find("div.MuiAlert-message").length).toEqual(0);

        act(()=>{
            SystemNotification.open(SystemNotifcationKind.Error, "Something bad happened");
        });
        rendered.update();

        const snackbar = rendered.find("div.MuiSnackbar-root");
        expect(snackbar.length).toEqual(1);

        expect(rendered.find("div.MuiAlert-message").text()).toEqual("Something bad happened");
        expect(rendered.find("div.MuiAlert-icon").length).toEqual(1);
    });
});