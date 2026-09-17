// core/security/database.js - Security Database (in-memory)

import { signJWT, verifyJWT, OAuth2PasswordBearer } from "./jwt.js";
import { SchemaValidator } from "./validation.js";
import { hasRole } from "./roles.js";
import { blacklist } from "./blacklist.js";
import crypto from "crypto";

export const securityDB = {
  // ============================================================
  // Blacklist Methods (delegados a blacklist)
  // ============================================================
  addBlacklistIP: blacklist.addIP,
  removeBlacklistIP: blacklist.removeIP,
  addWhitelistIP: blacklist.addWhitelistIP,
  removeWhitelistIP: blacklist.removeWhitelistIP,
  isIPBlocked: blacklist.isIPBlocked,
  addBlockedPath: blacklist.addPath,
  removeBlockedPath: blacklist.removePath,
  isPathBlocked: blacklist.isPathBlocked,
  addBlockedUserAgent: blacklist.addUserAgent,
  removeBlockedUserAgent: blacklist.removeUserAgent,
  isUserAgentBlocked: blacklist.isUserAgentBlocked,
  getBlacklistData: blacklist.getData,

  // ============================================================
  // Malicious Patterns - DEPRECATED (ya no se usan)
  // ============================================================
  maliciousPatterns: [],
  addPattern: () => {},
  removePattern: () => {},
  getPatterns: () => [],

  // ============================================================
  // JWT
  // ============================================================
  oauth2: new OAuth2PasswordBearer({ tokenUrl: "/token" }),
  jwtStore: new Map(),
  signJWT,
  verifyJWT,

  // ============================================================
  // Users
  // ============================================================
  users: new Map(),
  roles: {
    admin: ["admin", "user", "read"],
    user: ["user", "read"],
    read: ["read"],
  },

  createUser: (username, password, roles = ["user"]) => {
    if (securityDB.users.has(username)) throw new Error("User already exists");
    const hashed = crypto.createHash("sha256").update(password).digest("hex");
    securityDB.users.set(username, { username, password: hashed, roles });
    return { username, roles };
  },

  getUser: (username) => securityDB.users.get(username) || null,

  authenticate: (username, password) => {
    const user = securityDB.getUser(username);
    if (!user) return null;
    const hashed = crypto.createHash("sha256").update(password).digest("hex");
    if (user.password !== hashed) return null;
    return user;
  },

  // ============================================================
  // Token Handler (login/refresh)
  // ============================================================
  tokenHandler: async (req, res) => {
    const { grant_type, username, password, refresh_token } = req.body;

    if (grant_type === "password") {
      const user = securityDB.authenticate(username, password);
      if (!user) return res.error("Invalid credentials", 401);

      const accessToken = signJWT({
        username: user.username,
        roles: user.roles,
        scopes: user.roles,
      });

      const refreshToken = signJWT(
        { username: user.username, type: "refresh" },
        "30d",
      );

      securityDB.jwtStore.set(refreshToken, { username: user.username });

      return res.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "bearer",
      });
    }

    if (grant_type === "refresh_token") {
      if (!refresh_token) return res.error("Refresh token required", 400);

      try {
        const payload = verifyJWT(refresh_token);
        if (!payload || !securityDB.jwtStore.has(refresh_token)) {
          return res.error("Invalid refresh token", 401);
        }

        const user = securityDB.getUser(payload.username);
        if (!user) return res.error("User not found", 401);

        const newAccessToken = signJWT({
          username: user.username,
          roles: user.roles,
          scopes: user.roles,
        });

        return res.json({ access_token: newAccessToken, token_type: "bearer" });
      } catch {
        return res.error("Invalid refresh token", 401);
      }
    }

    return res.error("Unsupported grant_type", 400);
  },

  // ============================================================
  // DI Helpers
  // ============================================================
  SchemaValidator,
  hasRole,

  // ============================================================
  // Config
  // ============================================================
  config: {
    maxBodySize: 10240,
    logIncidents: true,
    blockOnPatternMatch: true,
    enableSecurityHeaders: true,
    enableCORS: true,
    corsOrigins: ["*"],
    csrfProtection: false,
  },

  setConfig: (key, value) => {
    securityDB.config[key] = value;
    console.log(`⚙️ Config ${key} = ${value}`);
  },

  getConfig: (key) => securityDB.config[key],
};

export default { securityDB };
