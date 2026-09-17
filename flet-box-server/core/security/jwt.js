// core/security/jwt.js - JWT Authentication

/**
 * JWT (JSON Web Token) utilities for authentication
 * Handles signing, verification, and token extraction
 * @module jwt
 */

import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

// ============================================================
// Base64URL Encoding/Decoding
// ============================================================

/**
 * Encode a string to base64url format
 * @param {string} str - String to encode
 * @returns {string} base64url encoded string
 */
export const base64urlEncode = (str) => {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

/**
 * Decode a base64url string
 * @param {string} str - base64url encoded string
 * @returns {string} Decoded string
 */
export const base64urlDecode = (str) => {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return Buffer.from(base64, "base64").toString();
};

/**
 * Create HMAC SHA256 signature (base64url)
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {string} base64url signature
 */
export const hmacSha256 = (data, secret) => {
  return crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

// ============================================================
// JWT Sign/Verify
// ============================================================

/**
 * Sign a JWT token
 * @param {Object} payload - Data to encode in the token
 * @param {string} expiresIn - Expiration time (e.g., '1h', '7d')
 * @returns {string} JWT token
 */
export const signJWT = (payload, expiresIn = "1h") => {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const exp =
    expiresIn === "1h" ? now + 3600 : now + parseInt(expiresIn) || 3600;
  const data = { ...payload, iat: now, exp };
  const encoded =
    base64urlEncode(JSON.stringify(header)) +
    "." +
    base64urlEncode(JSON.stringify(data));
  const signature = hmacSha256(encoded, JWT_SECRET);
  return encoded + "." + signature;
};

/**
 * Verify a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyJWT = (token) => {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid token format");

  const [headerB64, payloadB64, signature] = parts;
  const data = headerB64 + "." + payloadB64;
  const expectedSignature = hmacSha256(data, JWT_SECRET);

  if (signature !== expectedSignature) throw new Error("Invalid signature");

  const payload = JSON.parse(base64urlDecode(payloadB64));
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp && payload.exp < now) throw new Error("Token expired");

  return payload;
};

/**
 * Extract JWT token from Authorization header
 * @param {Object} req - HTTP request
 * @returns {string|null} Token or null if not found
 */
export const extractToken = (req) => {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth) return null;
  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
};

/**
 * OAuth2 Password Bearer class
 * Implements OAuth2 password flow for token handling
 */
export class OAuth2PasswordBearer {
  constructor({ tokenUrl, scopes = {} } = {}) {
    this.tokenUrl = tokenUrl || "/token";
    this.scopes = scopes;
  }

  /**
   * Extract token from request
   */
  extractToken(req) {
    return extractToken(req);
  }

  /**
   * Verify token and check required scopes
   * @param {string} token - JWT token
   * @param {string[]} requiredScopes - Scopes required for access
   * @returns {Object} Decoded payload
   * @throws {Error} If token invalid or missing scopes
   */
  async verifyToken(token, requiredScopes = []) {
    try {
      const payload = verifyJWT(token);
      if (requiredScopes.length > 0) {
        const userScopes = payload.scopes || [];
        for (const scope of requiredScopes) {
          if (!userScopes.includes(scope)) {
            throw new Error(`Missing required scope: ${scope}`);
          }
        }
      }
      return payload;
    } catch (error) {
      throw new Error("Invalid token: " + error.message);
    }
  }
}

export default {
  JWT_SECRET,
  base64urlEncode,
  base64urlDecode,
  hmacSha256,
  signJWT,
  verifyJWT,
  extractToken,
  OAuth2PasswordBearer,
};
