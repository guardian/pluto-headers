import React from "react";
import {shallow, mount} from "enzyme";
import moxios from "moxios";
import {Breadcrumb} from "../src/components/Breadcrumb/Breadcrumb";

describe("Breadcrumb", ()=>{
    beforeEach(() => moxios.install());
    afterEach(() => moxios.uninstall());

    it("should load in commission data only if only commission id is set", (done) => {
        const rendered = shallow(<Breadcrumb commissionId={5}/>);

        return moxios.wait(() => {
            const request = moxios.requests.mostRecent()
            expect(request.config.url).toEqual("/pluto-core/pluto/commission/5");
            request
                .respondWith({
                    status: 200,
                    response: {
                        "status": "ok",
                        "result": {
                            id: 5,
                            title: "My comission title"
                        }
                    }
                })
                .then(() => {
                    try {
                        const container = rendered.find("div#breadcrumb-container");
                        expect(container.length).toEqual(1);
                        expect(container.children().length).toEqual(1);
                        const crumb = container.childAt(0);
                        const commText = crumb.find("p");
                        expect(commText.text()).toEqual("My commission title");
                        done();
                    } catch(err) {
                        done.fail(err);
                    }
                })
        })
    });
});
