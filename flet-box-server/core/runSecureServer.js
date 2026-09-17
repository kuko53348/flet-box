// core/runSecureServer.js - Secure server wrapper with default security

/**
 * Run a secure server with security and rate limiting enabled by default.
 *
 * This is a convenience wrapper around `runServer` that pre-configures
 * global middleware: securityCheck and rateLimit. It is the recommended
 * way to start a production-ready API with minimal effort.
 *
 * @param {Object} routes - Processed routes from Api().
 * @param {Object} options - Server options (same as runServer).
 * @param {number} [options.port=3000] - Port to listen on.
 * @param {boolean} [options.docs=true] - Enable /docs endpoint.
 * @param {boolean} [options.cors=false] - Enable CORS.
 * @param {Object} [options.rateLimit={ max: 100, windowMs: 60000 }] - Rate limit settings.
 * @param {boolean} [options.security=true] - Always true (overridden internally).
 * @param {Array<Function>} [options.globalMiddleware=[]] - Additional global middleware.
 * @param {boolean} [options.validate=true] - Enable automatic schema validation.
 * @param {boolean} [options.block=true] - Enable malicious content blocking.
 * @param {...any} rest - Additional options passed to runServer.
 * @returns {Server} The HTTP server instance.
 *
 * @example
 * const routes = Api({ '/': { GET: () => ({ message: 'Hello' }) } });
 * runSecureServer(routes, { port: 8000, docs: true });
 */
import { runServer } from "./runServer.js";

export const runSecureServer = (
  routes,
  {
    port = 3000,
    docs = true,
    cors = false,
    rateLimit: rateLimitOptions = { max: 100, windowMs: 60000 },
    security = true,
    globalMiddleware = [],
    validate = true,
    block = true,
    ...rest
  } = {},
) => {
  const options = {
    port,
    docs,
    cors,
    security: true, // activa securityCheck
    cleanInput: true, // también activa sanitización
    rateLimit: rateLimitOptions,
    globalMiddleware,
    validate,
    block,
    ...rest,
  };

  return runServer(routes, options);
};

export default runSecureServer;
