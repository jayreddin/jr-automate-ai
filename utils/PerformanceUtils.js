/**
 * Performance optimization utilities
 * @module utils/PerformanceUtils
 */



/**
 * Simple memoization decorator for pure functions
 * @param {Function} fn - Function to memoize
 * @returns {Function} Memoized function
 */
export const memoize = (fn) => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
};

/**
 * Creates a cached version of an async function
 * @param {Function} fn - Async function to cache
 * @returns {Function} Cached async function
 */
export const cacheAsync = (fn) => {
    const cache = new Map();
    return async (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const result = await fn(...args);
        cache.set(key, result);
        return result;
    };
};

/**
 * Gets a property by dot notation path with caching
 * @param {Object} obj - Object to access
 * @param {string} path - Dot notation path
 * @returns {*} Property value or undefined
 */
export const getPropertyByPath = memoize((obj, path) => {
    try {
        return path.split('.').reduce((acc, part) => acc?.[part], obj);
    } catch {
        return undefined;
    }
});