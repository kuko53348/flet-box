// src/components/flet-box/tools/delay.js

/**
 * Delay execution for specified milliseconds
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after delay
 * 
 * @example
 * await delay(1000);
 * console.log('After 1 second');
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Simulate loading with minimum display time
 * @param {Promise} promise - Promise to execute
 * @param {number} minMs - Minimum display time in ms
 * @returns {Promise} Promise result
 * 
 * @example
 * const data = await withMinDelay(fetchData(), 800);
 */
export const withMinDelay = async (promise, minMs = 500) => {
    const [result] = await Promise.all([
        promise,
        delay(minMs)
    ]);
    return result;
};

/**
 * Retry an async operation
 * @param {Function} fn - Async function
 * @param {number} retries - Number of retries (default: 3)
 * @param {number} delayMs - Delay between retries (default: 1000)
 * @returns {Promise} Promise result
 * 
 * @example
 * const data = await retry(() => fetchData(), 3, 1000);
 */
export const retry = async (fn, retries = 3, delayMs = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await delay(delayMs);
        return retry(fn, retries - 1, delayMs);
    }
};

// Exportación por defecto para importar todo
export default { delay, withMinDelay, retry };
