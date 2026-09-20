// src/components/flet-box/tools/delay.js

/**
 * Delay execution for a specified number of milliseconds.
 *
 * @param {number} ms - Number of milliseconds to wait.
 * @returns {Promise<void>} A promise that resolves after the delay.
 *
 * @example
 * await delay(1000);
 * console.log('After 1 second');
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Ensures a promise takes at least `minMs` milliseconds to resolve.
 * Useful for preventing UI flicker when async operations complete too quickly.
 *
 * @param {Promise<*>} promise - The promise to execute.
 * @param {number} [minMs=500] - Minimum display time in milliseconds.
 * @returns {Promise<*>} Resolves with the promise result after at least `minMs` ms.
 *
 * @example
 * const data = await withMinDelay(fetchData(), 800);
 */
export const withMinDelay = async (promise, minMs = 500) => {
  const [result] = await Promise.all([promise, delay(minMs)]);
  return result;
};

/**
 * Retries an async operation up to `retries` times with a delay between attempts.
 * Throws the last encountered error if all retries are exhausted.
 *
 * @param {Function} fn - Async function to attempt.
 * @param {number} [retries=3] - Maximum number of retry attempts.
 * @param {number} [delayMs=1000] - Milliseconds to wait between retries.
 * @returns {Promise<*>} Resolves with the function's result on success.
 * @throws {Error} Re-throws the last error when all retries are exhausted.
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

// Default export for importing everything at once
export default { delay, withMinDelay, retry };
