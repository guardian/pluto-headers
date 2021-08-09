import React from "react";
import {shallow, mount} from "enzyme";
import moxios from "moxios";
import {Breadcrumb} from "../../../src";

describe("Breadcrumb", ()=>{
    beforeEach(() => moxios.install());
    afterEach(() => moxios.uninstall());

    it("should load in commission data only if only commission id is set", (done) => {
        const rendered = shallow(<Breadcrumb commissionId={5}/>);

        return moxios.wait(async () => {
            const request = moxios.requests.mostRecent()
            expect(request.config.url).toEqual("/pluto-core/api/pluto/commission/5");
            await request.respondWith({
                    status: 200,
                    response: {
                        "status": "ok",
                        "result": {
                            id: 5,
                            title: "My commission title"
                        }
                    }
                })

            try {
                const container = rendered.find("div.breadcrumb-container");
                expect(container.length).toEqual(1);
                expect(container.children().length).toEqual(1);
                const crumb = container.childAt(0);
                console.log(crumb)
                const commText = crumb.find("a");
                expect(commText.text()).toEqual("My commission title");
                expect(commText.prop("href")).toEqual("/pluto-core/commission/5")
                done();
            } catch(err) {
                done.fail(err);
            }
        })
    });

    it("should load in commission and project if only project id is set", (done) => {
        const rendered = shallow(<Breadcrumb projectId={5}/>);

        return moxios.wait(async () => {
            const request = moxios.requests.mostRecent()
            expect(request.config.url).toEqual("/pluto-core/api/project/5");
            request.respondWith({
                    status: 200,
                    response: {
                        "status": "ok",
                        "result": {
                            commissionId: 8,
                            title: "My project title"
                        }
                    }
                })
                .then(() => {
                    return moxios.wait( () => {
                        const request = moxios.requests.mostRecent();
                        expect(request.config.url).toEqual("/pluto-core/api/pluto/commission/8");
                        request
                            .respondWith({
                                status: 200,
                                response: {
                                    "status": "ok",
                                    "result": {
                                        id: 8,
                                        title: "My commission title"
                                    }
                                }
                            })
                            .then(()=>{
                                try {
                                    const container = rendered.find("div.breadcrumb-container");
                                    expect(container.length).toEqual(1);
                                    expect(container.children().length).toEqual(2);
                                    const crumb = container.childAt(0);
                                    const commText = crumb.find("a");
                                    expect(commText.text()).toEqual("My commission title");
                                    expect(commText.prop("href")).toEqual("/pluto-core/commission/8");

                                    const projcrumb = container.childAt(1);
                                    const projText = projcrumb.find("a");
                                    expect(projText.text()).toEqual("My project title")
                                    expect(projText.prop("href")).toEqual("/pluto-core/project/5");
                                    done();
                                } catch(err) {
                                    done.fail(err);
                                }
                            })
                    })
                })
        })
    });

    it("should display generic error text on server error", (done)=>{
        const rendered = shallow(<Breadcrumb projectId={5}/>);

        return moxios.wait(() => {
            const request = moxios.requests.mostRecent()
            expect(request.config.url).toEqual("/pluto-core/api/project/5");
            request
                .respondWith({
                    status: 500,
                    response: {
                        "status": "error",
                        "detail": "Kaboom"
                    }
                })
                .then(() => {
                    const container = rendered.find("div.breadcrumb-container");
                    expect(container.length).toEqual(1);
                    expect(container.children().length).toEqual(1);
                    const errcrumb = container.find("p");
                    expect(errcrumb.text()).toEqual("Could not load location data");
                    done();
                })
                .catch((err)=>done.fail(err));
        });
    });

    it("should retry on server 503", (done) => {
        const rendered = shallow(<Breadcrumb commissionId={5}/>);

        return moxios.wait(()=> {
            const request = moxios.requests.mostRecent();
            expect(request.config.url).toEqual("/pluto-core/api/pluto/commission/5");
            request.respondWith({
                status: 503,
                response: {}
            }).then( () => {
                //if we don't wait as long as the main code is waiting, then we end up testing the _last_ request
                return window.setTimeout(()=>moxios.wait( ()=> {
                    const request = moxios.requests.mostRecent();
                    expect(request.config.url).toEqual("/pluto-core/api/pluto/commission/5");
                    request.respondWith({
                        status: 200,
                        response: {
                            "status": "ok",
                            result: {
                                id: 8,
                                title: "My commission title"
                            }
                        }
                    }).then(()=>{
                        try {
                            const container = rendered.find("div.breadcrumb-container");
                            expect(container.length).toEqual(1);
                            expect(container.children().length).toEqual(1);
                            const crumb = container.childAt(0);
                            const commText = crumb.find("a");
                            expect(commText.text()).toEqual("My commission title");
                            expect(commText.prop("href")).toEqual("/pluto-core/commission/5");
                            done();
                        } catch(err) {
                            done.fail(err);
                        }
                    }).catch((err)=>done.fail(err));
                }),2000)
            });
        })
    })
});
