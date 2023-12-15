import scrypt from './scrypt/index.js';
import { generateRandomString } from './nanoid.js';

/**
 * @param {string} s
 * @returns {Promise<string>}
 */
export const generateScryptHash = async (s) => {
    const salt = generateRandomString(16);
    const key = await hashWithScrypt(s.normalize('NFKC'), salt);
    return `s2:${salt}:${key}`;
};

/** 
 * @param {string} s
 * @param {string} salt
 * @returns {Promise<string>}
 */
const hashWithScrypt = async (s, salt, blockSize = 16) => {
    const keyUint8Array = await scrypt(new TextEncoder().encode(s), new TextEncoder().encode(salt), {
        N: 1024,
        r: blockSize,
        p: 1,
        dkLen: 64
    });
    return convertUint8ArrayToHex(keyUint8Array);
};

/** 
 * @param {string} s
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export const validateScryptHash = async (s, hash) => {
    const arr = hash.split(':');
    if (arr.length === 2) {
        const [salt, key] = arr;
        const targetKey = await hashWithScrypt(s.normalize('NFKC'), salt, 8);
        const result = constantTimeEqual(targetKey, key);
        return result;
    }
    if (arr.length !== 3)
        return false;
    const [version, salt, key] = arr;
    if (version === 's2') {
        const targetKey = await hashWithScrypt(s.normalize('NFKC'), salt);
        const result = constantTimeEqual(targetKey, key);
        return result;
    }
    return false;
};

/** 
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
const constantTimeEqual = (a, b) => {
    if (a.length !== b.length) {
        return false;
    }
    const aUint8Array = new TextEncoder().encode(a);
    const bUint8Array = new TextEncoder().encode(b);

    let c = 0;
    for (let i = 0; i < a.length; i++) {
        c |= aUint8Array[i] ^ bUint8Array[i]; // ^: XOR operator
    }
    return c === 0;
};

/** 
 * @param {Uint8Array} arr
 * @returns {string}
 */
export const convertUint8ArrayToHex = (arr) => {
    return [...arr].map((x) => x.toString(16).padStart(2, '0')).join('');
};
