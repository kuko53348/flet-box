/**
 * @module core
 *
 * Public entry point for the FletBox core layer.
 *
 * Re-exports every symbol that consumers of the framework need to bootstrap an
 * application, manage the DOM, use HMR in development, and work with PWA APIs.
 *
 * @see {@link ./runApp.js}   - Application mounting and DOM helpers.
 * @see {@link ./App.js}      - Minimal single-widget mount helper.
 * @see {@link ./hmr-client.js} - Hot Module Replacement WebSocket client.
 * @see {@link ./pwa.js}      - Progressive Web App install / update / remove utilities.
 */

// Application bootstrap and DOM placement helpers
export {
  runApp,
  createApp,
  insertBy,
  prependBy,
  insertBefore,
  insertAfter,
  replaceBy,
  mountAll,
} from "./runApp.js";

// Minimal single-widget mount helper
export { App } from "./App.js";

// HMR client (development only)
export { initHMR, getHMR } from "./hmr-client.js";

// PWA utilities
export { installPWA, updatePWA, removePWA, isPWAInstalled } from "./pwa.js";
