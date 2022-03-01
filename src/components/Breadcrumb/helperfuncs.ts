function file_basename(str:string): string {
    const xtractor = new RegExp("\/([^\/]*)$")

    const result = xtractor.exec(str);
    if(result) {
        return result[1];
    } else {
        return str;
    }
}

export {file_basename}