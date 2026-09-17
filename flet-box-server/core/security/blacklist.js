// core/security/blacklist.js - IP and User-Agent blacklist

/**
 * Blacklist management for IPs, User-Agents, and paths
 * @module blacklist
 */

const blacklistedIPs = new Set();
const whitelistedIPs = new Set();
const blacklistedUserAgents = new Set();
const blacklistedPaths = new Set();

export const blacklist = {
  // ============================================================
  // IP Blacklist Methods
  // ============================================================

  /**
   * Add an IP to the blacklist
   * @param {string} ip - IP address to block
   */
  addIP: (ip) => {
    blacklistedIPs.add(ip);
    console.log(`⛔ IP ${ip} added to blacklist`);
  },

  /**
   * Remove an IP from the blacklist
   * @param {string} ip - IP address to unblock
   */
  removeIP: (ip) => {
    blacklistedIPs.delete(ip);
    console.log(`✅ IP ${ip} removed from blacklist`);
  },

  /**
   * Check if an IP is blocked
   * @param {string} ip - IP address to check
   * @returns {boolean} True if blocked
   */
  isIPBlocked: (ip) => {
    if (whitelistedIPs.has(ip)) return false;
    return blacklistedIPs.has(ip);
  },

  // ============================================================
  // IP Whitelist Methods
  // ============================================================

  /**
   * Add an IP to the whitelist (bypasses blacklist)
   * @param {string} ip - IP address to whitelist
   */
  addWhitelistIP: (ip) => {
    whitelistedIPs.add(ip);
    console.log(`✅ IP ${ip} added to whitelist`);
  },

  /**
   * Remove an IP from the whitelist
   * @param {string} ip - IP address to remove from whitelist
   */
  removeWhitelistIP: (ip) => {
    whitelistedIPs.delete(ip);
    console.log(`⛔ IP ${ip} removed from whitelist`);
  },

  /**
   * Check if an IP is whitelisted
   * @param {string} ip - IP address to check
   * @returns {boolean} True if whitelisted
   */
  isIPWhitelisted: (ip) => whitelistedIPs.has(ip),

  // ============================================================
  // User-Agent Blacklist Methods
  // ============================================================

  /**
   * Block a User-Agent
   * @param {string} ua - User-Agent string to block
   */
  addUserAgent: (ua) => {
    blacklistedUserAgents.add(ua.toLowerCase());
    console.log(`⛔ User-Agent ${ua} blocked`);
  },

  /**
   * Unblock a User-Agent
   * @param {string} ua - User-Agent string to unblock
   */
  removeUserAgent: (ua) => {
    blacklistedUserAgents.delete(ua.toLowerCase());
    console.log(`✅ User-Agent ${ua} unblocked`);
  },

  /**
   * Check if a User-Agent is blocked
   * @param {string} ua - User-Agent string to check
   * @returns {boolean} True if blocked
   */
  isUserAgentBlocked: (ua) => {
    if (!ua) return false;
    return blacklistedUserAgents.has(ua.toLowerCase());
  },

  // ============================================================
  // Path Blacklist Methods
  // ============================================================

  /**
   * Block a path (e.g., /admin, /hidden)
   * @param {string} path - Path to block
   */
  addPath: (path) => {
    blacklistedPaths.add(path);
    console.log(`⛔ Path ${path} blocked`);
  },

  /**
   * Unblock a path
   * @param {string} path - Path to unblock
   */
  removePath: (path) => {
    blacklistedPaths.delete(path);
    console.log(`✅ Path ${path} unblocked`);
  },

  /**
   * Check if a path is blocked
   * @param {string} path - Path to check
   * @returns {boolean} True if blocked
   */
  isPathBlocked: (path) => blacklistedPaths.has(path),

  // ============================================================
  // Utility Methods
  // ============================================================

  /**
   * Get all blacklist/whitelist data
   * @returns {Object} All blacklist data
   */
  getData: () => ({
    blacklistedIPs: Array.from(blacklistedIPs),
    whitelistedIPs: Array.from(whitelistedIPs),
    blacklistedUserAgents: Array.from(blacklistedUserAgents),
    blacklistedPaths: Array.from(blacklistedPaths),
  }),
};

export default blacklist;
