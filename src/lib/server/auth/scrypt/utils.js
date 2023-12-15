/** 
 * @param {Uint8Array} arr
 * @returns {Uint32Array}
 */
export const u32 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));

/** @returns {Promise<void>} */
export const nextTick = async () => { };

/** 
 * @param {T1} defaults
 * @param {T2} [opts]
 * @returns {T1 & T2}
 */
export function checkOpts(defaults, opts) {
    const merged = Object.assign(defaults, opts);
    return merged;
}

/** 
 * @param {number} iters
 * @param {number} tick
 * @param {(i: number) => void} cb
 * @returns {Promise<void>}
 */
export const asyncLoop = async (iters, tick, cb) => {
    let ts = Date.now();
    for (let i = 0; i < iters; i++) {
        cb(i);
        const diff = Date.now() - ts;
        if (diff >= 0 && diff < tick)
            continue;
        await nextTick();
        ts += diff;
    }
};
