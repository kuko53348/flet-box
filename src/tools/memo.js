// tools/memo.js

/**
 * Memoize a function (cache results)
 * @param {Function} fn - Function to memoize
 * @returns {Function} Memoized function
 * @example
 * const expensiveFn = memo((n) => { ... })
 */
export const memo = (fn) => {
    const cache = new Map();
    
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
};

/**
 * Memoize with custom key generator
 * @param {Function} fn - Function to memoize
 * @param {Function} keyFn - Key generator function
 * @returns {Function} Memoized function
 */
export const memoWithKey = (fn, keyFn) => {
    const cache = new Map();
    
    return (...args) => {
        const key = keyFn(...args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
};

/**
 * Clear memo cache
 * @param {Function} memoizedFn - Memoized function
 */
export const clearMemo = (memoizedFn) => {
    if (memoizedFn.cache) {
        memoizedFn.cache.clear();
    }
};

export default { memo, memoWithKey, clearMemo };
