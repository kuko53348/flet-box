// core/rateLimit.js - Rate limiting middleware

/**
 * Create a rate limiting middleware.
 *
 * This middleware limits the number of requests from a single client
 * within a time window. It uses an in-memory store by default, but
 * you can pass a custom store (e.g., Redis) for distributed environments.
 *
 * @param {Object} options - Rate limit options.
 * @param {number} [options.windowMs=60000] - Time window in milliseconds.
 * @param {number} [options.max=100] - Maximum number of requests per window.
 * @param {string} [options.message="Too many requests"] - Error message returned when limit is exceeded.
 * @param {Function} [options.keyGenerator=(req) => req.socket.remoteAddress] - Function to generate a unique key per client.
 * @param {Map|Object} [options.store=new Map()] - Store for tracking counts (must have get, set, delete).
 * @returns {Function} Express-style middleware (req, res, next) => void.
 *
 * @example
 * const limiter = rateLimit({ max: 10, windowMs: 5000 });
 * app.use(limiter);
 *
 * // Or on a specific route
 * routes['/api'] = {
 *   GET: { handler: () => ({}), middleware: [rateLimit({ max: 5 })] }
 * };
 */
export const rateLimit = (options = {}) => {
  const {
    windowMs = 60000,
    max = 100,
    message = "Too many requests",
    keyGenerator = (req) => req.socket.remoteAddress,
  } = options;
  const store = new Map();

  setInterval(() => {
    const now = Date.now();
    for (const [key, data] of store) {
      if (data.resetTime < now) store.delete(key);
    }
  }, 60000);

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    let record = store.get(key);
    if (!record || record.resetTime < now) {
      record = { count: 0, resetTime: now + windowMs };
      store.set(key, record);
    }
    record.count++;
    res.setHeader("X-RateLimit-Limit", max);
    res.setHeader("X-RateLimit-Remaining", Math.max(0, max - record.count));
    res.setHeader("X-RateLimit-Reset", Math.ceil(record.resetTime / 1000));
    if (record.count > max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      return res.error(message, 429);
    }
    next();
  };
};
