// core/security/middleware.js - Security Check Middleware (solo limpieza y headers)
import { applySecurityHeaders } from "./headers.js";
import { blacklist } from "./blacklist.js";
import { sanitizeObject } from "./sanitize.js";

/**
 * Middleware que limpia todo el input y aplica headers/CORS
 */
export const securityCheck = (req, res, next) => {
  const ip = req.socket.remoteAddress || req.headers["x-forwarded-for"];
  const path = req.url;
  const userAgent = req.headers["user-agent"];

  // 1. Whitelist/Blacklist
  if (blacklist.isIPWhitelisted(ip)) return next();
  if (blacklist.isIPBlocked(ip)) {
    logIncident("BLOCKED_IP", `Blocked IP: ${ip}`, ip, path);
    return res.error("Forbidden", 403);
  }
  if (blacklist.isPathBlocked(path)) {
    logIncident("BLOCKED_PATH", `Blocked path: ${path}`, ip, path);
    return res.error("Forbidden", 403);
  }
  if (blacklist.isUserAgentBlocked(userAgent)) {
    logIncident("BLOCKED_UA", `Blocked User-Agent: ${userAgent}`, ip, path);
    return res.error("Forbidden", 403);
  }

  // 2. 🧹 LIMPIEZA DE INPUT
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  // 3. Aplicar security headers
  applySecurityHeaders(res);

  // 4. Aplicar CORS
  applyCORS(req, res);

  // 5. Continuar
  next();
};

/**
 * Apply CORS headers
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 */
const applyCORS = (req, res) => {
  const origin = req.headers.origin || "*";
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : ["*"];

  if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-API-Key, X-Requested-With",
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
};

/**
 * Log a security incident
 * @param {string} type - Incident type
 * @param {string} detail - Incident details
 * @param {string} ip - IP address
 * @param {string} path - Request path
 */
const logIncident = (type, detail, ip, path) => {
  const entry = {
    timestamp: new Date().toISOString(),
    type,
    detail,
    ip: ip || "unknown",
    path: path || "unknown",
  };

  console.log(
    `🚨 INCIDENT: ${type} - ${detail} (IP: ${entry.ip}, Path: ${entry.path})`,
  );

  if (!global._securityIncidents) {
    global._securityIncidents = [];
  }
  global._securityIncidents.push(entry);
  if (global._securityIncidents.length > 1000) {
    global._securityIncidents.shift();
  }
};

/**
 * Get security incidents log
 * @param {number} limit - Max incidents to return (default: 100)
 * @returns {Array} List of incidents
 */
export const getSecurityIncidents = (limit = 100) => {
  if (!global._securityIncidents) return [];
  return global._securityIncidents.slice(-limit);
};

/**
 * Clear security incidents log
 */
export const clearSecurityIncidents = () => {
  global._securityIncidents = [];
};

export default {
  securityCheck,
  getSecurityIncidents,
  clearSecurityIncidents,
};
