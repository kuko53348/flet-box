// core/security/roles.js - Roles & Permissions

/**
 * Role-based access control (RBAC)
 * @module roles
 */

export class RoleChecker {
  constructor(requiredRoles = []) {
    this.requiredRoles = requiredRoles;
  }

  /**
   * Check if a user has required roles
   * @param {Object} req - HTTP request with user data
   * @returns {Promise<boolean>}
   * @throws {Error} If user not authenticated or missing roles
   */
  async check(req) {
    const user = req.user;
    if (!user) throw new Error("Not authenticated");
    if (this.requiredRoles.length === 0) return true;

    const userRoles = user.roles || [];
    for (const role of this.requiredRoles) {
      if (!userRoles.includes(role)) {
        throw new Error(`Missing required role: ${role}`);
      }
    }
    return true;
  }
}

/**
 * Middleware to check user roles
 * @param {...string} roles - Required roles
 * @returns {Function} Middleware function
 *
 * @example
 * // Only admin can access
 * routes['/admin'] = {
 *   GET: {
 *     handler: () => ({ data: 'admin' }),
 *     middleware: [hasRole('admin')]
 *   }
 * }
 *
 * // User or admin can access
 * routes['/dashboard'] = {
 *   GET: {
 *     handler: () => ({ data: 'dashboard' }),
 *     middleware: [hasRole('user', 'admin')]
 *   }
 * }
 */
export const hasRole = (...roles) => {
  const checker = new RoleChecker(roles);
  return async (req, res, next) => {
    try {
      await checker.check(req);
      next();
    } catch (error) {
      res.error(error.message, 403);
    }
  };
};

/** Default role definitions */
export const defaultRoles = {
  admin: ["admin", "user", "read"],
  user: ["user", "read"],
  read: ["read"],
};

export default {
  RoleChecker,
  hasRole,
  defaultRoles,
};
