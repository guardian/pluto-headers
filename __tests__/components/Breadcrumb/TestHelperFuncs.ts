import {file_basename} from "../../../src/components/Breadcrumb/helperfuncs";

describe("file_basename", ()=>{
    it("should return just the filname part of a path", ()=>{
        const result = file_basename("/path/to/something.new");
        expect(result).toEqual("something.new");
    });

    it("should return the whole string if there is no /", ()=>{
        const result = file_basename("something.new");
        expect(result).toEqual("something.new")
    });

    it("should return an empty string if there is a trailing /", ()=>{
        const result = file_basename("/path/to/something/");
        expect(result).toEqual("");
    })
})