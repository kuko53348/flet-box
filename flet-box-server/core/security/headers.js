// core/security/headers.js - Security Headers

/**
 * Security headers to protect against common web vulnerabilities
 * These headers are applied to every response when securityCheck is used
 * @module securityHeaders
 */

export const securityHeaders = {
  "X-Content-Type-Options": "nosniff", // Prevents MIME type sniffing
  "X-Frame-Options": "DENY", // Prevents clickjacking
  "X-XSS-Protection": "1; mode=block", // Enables XSS filtering
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains", // Enforces HTTPS
  "Content-Security-Policy":
    "default-src 'self'; style-src 'self' 'unsafe-inline'", // Restricts resources
  "Referrer-Policy": "no-referrer", // Controls referrer info
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()", // Restricts browser features
  "X-DNS-Prefetch-Control": "off", // Disables DNS prefetching
  "X-Download-Options": "noopen", // Prevents opening files automatically
  "X-Permitted-Cross-Domain-Policies": "none", // Restricts cross-domain policies
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate", // Prevents caching
  Pragma: "no-cache", // HTTP/1.0 cache control
  Expires: "0", // Sets immediate expiry
  "Cross-Origin-Resource-Policy": "same-origin", // Restricts cross-origin resource sharing
  "Cross-Origin-Embedder-Policy": "require-corp", // Requires cross-origin policy
  "Cross-Origin-Opener-Policy": "same-origin", // Restricts window sharing
};

/**
 * Apply all security headers to a response
 * @param {Object} res - HTTP response object
 */
export const applySecurityHeaders = (res) => {
  for (const [key, value] of Object.entries(securityHeaders)) {
    res.setHeader(key, value);
  }
};

export default {
  securityHeaders,
  applySecurityHeaders,
};
