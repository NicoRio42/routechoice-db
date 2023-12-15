/** 
 * @param {Uint8Array} password
 * @param {Uint8Array} salt
 * @param {{ c: number, dkLen: number}} options
 * @returns {Promise<Uint8Array>}
 */
export const pbkdf2 = async (password, salt, options) => {
    const pwKey = await crypto.subtle.importKey("raw", password, "PBKDF2", false, ["deriveBits"]);
    const keyBuffer = await crypto.subtle.deriveBits({
        name: "PBKDF2",
        hash: "SHA-256",
        salt,
        iterations: options.c
    }, pwKey, options.dkLen * 8);

    return new Uint8Array(keyBuffer);
};
