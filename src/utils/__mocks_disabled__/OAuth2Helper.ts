export let refreshLoginResult:Promise<void>;

export const refreshLogin:(tokenUri:string)=>Promise<void> = (tokenUri) => {
    return refreshLoginResult;
}