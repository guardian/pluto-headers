interface JWKS {
    keys: JWK[];
}

interface JWK {
    alg: AlgorithmIdentifier;
    kty: string;
    use: string;
    n: string;
    e: string;
    kid: string;
    x5t: string;
    x5c: string[];
}

function digestFor(algorithm: string):string {
    switch(algorithm) {
        case "RS256":
            return "SHA-256";
        case "RS384":
            return "SHA-384";
        case "RS512":
            return "SHA-512";
        default:
            throw `Unknown algorithm "${algorithm}"`
    }
}

export async function jwksFromUri(kid:string, algorithm: string, baseUrl:string) {
    const rawDataResponse = await fetch(baseUrl);
    if(rawDataResponse.status!=200) throw `Could not download JWKS from ${baseUrl}`;
    if(!algorithm.startsWith("RS")) throw `Only RSA keys are supported at present`;

    const jwks = await rawDataResponse.json() as JWKS;

    //find the matching key
    const matches = jwks.keys.filter(k=>k.kid==kid);
    if(matches.length==0) {
        throw `No verification found for key ID "${kid}"`
    } else {
        const k = matches[0] as JsonWebKey;
        const algo:RsaHashedImportParams = {
            hash: digestFor(algorithm),
            name: "RSA-PSS",
        }
        console.log(algo);
        const cryptoKey = await crypto.subtle.importKey("jwk", k, algo, true, ["verify"]);
        const rawKey = await crypto.subtle.exportKey("spki", cryptoKey) as ArrayBuffer;

    }
}
