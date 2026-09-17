// core/security/auth.js - Authentication middleware
import { extractToken, verifyJWT } from "./jwt.js";

/**
 * Authentication middleware
 * Verifies JWT token and adds user to req.user
 *
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {Function} next - Next middleware function
 * @returns {void}
 *
 * @example
 * // Protect a route
 * routes['/protected'] = {
 *   GET: {
 *     handler: () => ({ data: 'secure' }),
 *     middleware: [authenticate]
 *   }
 * }
 */
export const authenticate = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.error("Unauthorized: No token provided", 401);
  }

  try {
    const payload = verifyJWT(token);
    req.user = payload;
    next();
  } catch (error) {
    return res.error("Unauthorized: Invalid token", 401);
  }
};

/**
 * Optional authentication (does not fail if no token)
 *
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {Function} next - Next middleware function
 * @returns {void}
 */
export const optionalAuth = (req, res, next) => {
  try {
    const token = extractToken(req);
    if (token) {
      req.user = verifyJWT(token);
    }
  } catch {
    // Ignore invalid token, just don't set user
  }
  next();
};

export default {
  authenticate,
  optionalAuth,
};
