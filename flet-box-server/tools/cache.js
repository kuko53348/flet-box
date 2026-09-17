// cache.js - Redis cache module for FletBox
import Redis from 'ioredis';

/**
 * # CACHE MODULE
 * - Redis-based caching
 * - Set, get, delete, expire
 * - JSON serialization
 *
 * @example
 * import { cache } from '@flet-box/cache';
 *
 * // Set cache with expiry (seconds)
 * await cache.set('user:123', { name: 'Juan' }, 3600);
 *
 * // Get cache
 * const user = await cache.get('user:123');
 *
 * // Delete cache
 * await cache.del('user:123');
 */

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const DEFAULT_TTL = process.env.CACHE_TTL || 3600;

let redisClient = null;

/**
 * Initialize Redis connection
 * @param {string} url - Redis URL (optional)
 * @returns {Redis} Redis client
 */
export function connectRedis(url = REDIS_URL) {
  if (!redisClient) {
    redisClient = new Redis(url);
    
    redisClient.on('error', (error) => {
      console.error('Redis error:', error.message);
    });
    
    redisClient.on('connect', () => {
      console.log('✅ Redis connected');
    });
  }
  return redisClient;
}

/**
 * Get Redis client (lazy connect)
 * @returns {Redis} Redis client
 */
function getClient() {
  if (!redisClient) {
    return connectRedis();
  }
  return redisClient;
}

/**
 * Set cache value with optional TTL
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: DEFAULT_TTL)
 * @returns {Promise<void>}
 */
export async function cacheSet(key, value, ttl = DEFAULT_TTL) {
  const client = getClient();
  const serialized = JSON.stringify(value);
  if (ttl > 0) {
    await client.setex(key, ttl, serialized);
  } else {
    await client.set(key, serialized);
  }
}

/**
 * Get cache value
 * @param {string} key - Cache key
 * @returns {Promise<any>} Cached value or null
 */
export async function cacheGet(key) {
  try {
    const client = getClient();
    const value = await client.get(key);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    console.error('Cache get error:', error.message);
    return null;
  }
}

/**
 * Delete cache key
 * @param {string} key - Cache key
 * @returns {Promise<number>} Number of keys deleted
 */
export async function cacheDel(key) {
  const client = getClient();
  return client.del(key);
}

/**
 * Check if key exists
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} True if exists
 */
export async function cacheExists(key) {
  const client = getClient();
  const result = await client.exists(key);
  return result === 1;
}

/**
 * Get TTL of key (remaining seconds)
 * @param {string} key - Cache key
 * @returns {Promise<number>} Remaining TTL in seconds (-1 if no TTL, -2 if not exists)
 */
export async function cacheTtl(key) {
  const client = getClient();
  return client.ttl(key);
}

/**
 * Increment a numeric cache value
 * @param {string} key - Cache key
 * @param {number} amount - Amount to increment (default: 1)
 * @returns {Promise<number>} New value
 */
export async function cacheIncr(key, amount = 1) {
  const client = getClient();
  if (amount === 1) {
    return client.incr(key);
  }
  return client.incrby(key, amount);
}

/**
 * Decrement a numeric cache value
 * @param {string} key - Cache key
 * @param {number} amount - Amount to decrement (default: 1)
 * @returns {Promise<number>} New value
 */
export async function cacheDecr(key, amount = 1) {
  const client = getClient();
  if (amount === 1) {
    return client.decr(key);
  }
  return client.decrby(key, amount);
}

/**
 * Get all keys matching a pattern
 * @param {string} pattern - Pattern to match (e.g., 'user:*')
 * @returns {Promise<string[]>} Array of keys
 */
export async function cacheKeys(pattern = '*') {
  const client = getClient();
  return client.keys(pattern);
}

/**
 * Delete all keys matching a pattern
 * @param {string} pattern - Pattern to match
 * @returns {Promise<number>} Number of keys deleted
 */
export async function cacheDelPattern(pattern) {
  const client = getClient();
  const keys = await client.keys(pattern);
  if (keys.length === 0) return 0;
  return client.del(...keys);
}

/**
 * Flush all cache
 * @returns {Promise<void>}
 */
export async function cacheFlush() {
  const client = getClient();
  await client.flushdb();
}

/**
 * Close Redis connection
 * @returns {Promise<void>}
 */
export async function cacheClose() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

// Cache decorator for functions
export function cached(ttl = DEFAULT_TTL) {
  return function(target, propertyKey, descriptor) {
    const original = descriptor.value;
    descriptor.value = async function(...args) {
      const key = `${propertyKey}:${JSON.stringify(args)}`;
      const cached = await cacheGet(key);
      if (cached !== null) {
        return cached;
      }
      const result = await original.apply(this, args);
      await cacheSet(key, result, ttl);
      return result;
    };
    return descriptor;
  };
}

export default {
  connectRedis,
  cacheSet,
  cacheGet,
  cacheDel,
  cacheExists,
  cacheTtl,
  cacheIncr,
  cacheDecr,
  cacheKeys,
  cacheDelPattern,
  cacheFlush,
  cacheClose,
  cached,
};
