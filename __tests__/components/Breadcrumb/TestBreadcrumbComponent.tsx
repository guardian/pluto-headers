import React from "react";
import {mount} from "enzyme";
import moxios from "moxios";
import {Breadcrumb} from "../../../src";

describe("Breadcrumb", ()=>{
    beforeEach(() => moxios.install());
    afterEach(() => moxios.uninstall());

    it("should load in commission data only if only commission id is set", (done) => {
        const rendered = mount(<Breadcrumb commissionId={5}/>);

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
                rendered.update();
                const commText = rendered.find("a.breadcrumb-text");
                expect(commText.text()).toEqual("My commission title");
                expect(commText.prop("href")).toEqual("/pluto-core/commission/5")
                done();
            } catch(err) {
                done.fail(err);
            }
        })
    });

    it("should load in commission and project if only project id is set", (done) => {
        const rendered = mount(<Breadcrumb projectId={5}/>);

        moxios.wait(async () => {
            const request = moxios.requests.mostRecent()
            expect(request.config.url).toEqual("/pluto-core/api/project/5");
            await request.respondWith({
                    status: 200,
                    response: {
                        "status": "ok",
                        "result": {
                            commissionId: 8,
                            title: "My project title"
                        }
                    }
                })

            moxios.wait( async () => {
                const request = moxios.requests.mostRecent();
                expect(request.config.url).toEqual("/pluto-core/api/pluto/commission/8");
                await request.respondWith({
                        status: 200,
                        response: {
                            "status": "ok",
                            "result": {
                                id: 8,
                                title: "My commission title"
                            }
                        }
                    })

                try {
                    rendered.update();
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
    });

    it("should load in deliverables if master id is set", (done) => {
        const rendered = mount(<Breadcrumb masterId={6}/> );

        moxios.wait(async ()=>{
            const request = moxios.requests.mostRecent();
            expect(request.config.url).toEqual("/deliverables/api/asset/6");
            await request.respondWith({
                status: 200,
                response: {
                    "id": 6,
                    "type_string": "Full master",
                    "filename": "/path/to/deliverable.mxf"
                }
            });

            try {
                rendered.update();
                const container = rendered.find("div.breadcrumb-container");
                expect(container.length).toEqual(1);
                expect(container.children().length).toEqual(1);
                const crumb = container.childAt(0);
                const txt = crumb.find("p");
                expect(txt.text()).toEqual("Full master deliverable.mxf");
                done();
            } catch (err) {
                done.fail(err);
            }
        })
    });

    it("should load in commission, project and deliverables data if they are all set", (done) => {
        const rendered = mount(<Breadcrumb projectId={5} commissionId={8} masterId={6}/>);

        moxios.wait(async () => {
            const request = moxios.requests.mostRecent();
            expect(request.config.url).toEqual("/deliverables/api/asset/6");
            await request.respondWith({
                status: 200,
                response: {
                    "id": 6,
                    "type_string": "Full master",
                    "filename": "/path/to/deliverable.mxf"
                }
            });

            moxios.wait(async () => {
                const request = moxios.requests.mostRecent();
                expect(request.config.url).toEqual("/pluto-core/api/project/5");
                await request.respondWith({
                    status: 200,
                    response: {
                        "status": "ok",
                        "result": {
                            commissionId: 8,
                            title: "My project title"
                        }
                    }
                })

                moxios.wait(async () => {
                    const request = moxios.requests.mostRecent();
                    expect(request.config.url).toEqual("/pluto-core/api/pluto/commission/8");
                    await request.respondWith({
                        status: 200,
                        response: {
                            "status": "ok",
                            "result": {
                                id: 8,
                                title: "My commission title"
                            }
                        }
                    })
                    try {
                        rendered.update();
                        const container = rendered.find("div.breadcrumb-container");
                        expect(container.length).toEqual(1);
                        expect(container.children().length).toEqual(3);

                        const commCrumb = container.childAt(0);
                        const commText = commCrumb.find("a");
                        expect(commText.text()).toEqual("My commission title");
                        expect(commText.prop("href")).toEqual("/pluto-core/commission/8");

                        const projcrumb = container.childAt(1);
                        const projText = projcrumb.find("a");
                        expect(projText.text()).toEqual("My project title")
                        expect(projText.prop("href")).toEqual("/pluto-core/project/5");

                        const crumb = container.childAt(2);
                        const txt = crumb.find("p");
                        expect(txt.text()).toEqual("Full master deliverable.mxf");
                        done();
                    } catch (err) {
                        done.fail(err);
                    }
                })
            })
        })
    })

    it("should display generic error text on server error", (done)=>{
        const rendered = mount(<Breadcrumb projectId={5}/>);

        return moxios.wait(async () => {
            const request = moxios.requests.mostRecent()
            expect(request.config.url).toEqual("/pluto-core/api/project/5");
            await request.respondWith({
                    status: 500,
                    response: {
                        "status": "error",
                        "detail": "Kaboom"
                    }
                })

            try {
                rendered.update();
                const container = rendered.find("div.breadcrumb-container");
                expect(container.length).toEqual(1);
                expect(container.children().length).toEqual(1);
                const errcrumb = container.find("p");
                expect(errcrumb.text()).toEqual("Could not load location data");
                done();
            } catch (err) {
                done.fail(err);
            }
        });
    });

    it("should retry on server 503", (done) => {
        const rendered = mount(<Breadcrumb commissionId={5}/>);

        const simpleTimeout = (duration:number)=> {
            return new Promise((resolve,reject)=>window.setTimeout(()=>resolve(), duration));
        }

        return moxios.wait(async ()=> {
            const request = moxios.requests.mostRecent();
            expect(request.config.url).toEqual("/pluto-core/api/pluto/commission/5");
            await request.respondWith({
                status: 503,
                response: {}
            });

            //if we don't wait as long as the main code is waiting, then we end up testing the _last_ request
            await simpleTimeout(2000);

            const secondRequest = moxios.requests.mostRecent();
            expect(secondRequest.config.url).toEqual("/pluto-core/api/pluto/commission/5");
            await secondRequest.respondWith({
                status: 200,
                response: {
                    "status": "ok",
                    result: {
                        id: 8,
                        title: "My commission title"
                    }
                }
            });

            try {
                rendered.update();
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
        })
    })
});
