// src/core/pwa.js - PWA utility functions ready to be wired to onPress handlers

/**
 * Holds the deferred `beforeinstallprompt` event so it can be triggered later
 * by `installPWA`. Set to `null` when no install prompt is available (e.g. the
 * app is already installed or the browser does not support PWA installation).
 *
 * @type {Event|null}
 */
let deferredPrompt = null;

// Listen for the install prompt event.
// The guard keeps the module safely importable in Node / SSR / test environments
// where `window` is not defined.
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

/**
 * Returns whether the PWA is currently running in standalone (installed) mode.
 *
 * Uses the `display-mode: standalone` CSS media query, which matches when the
 * app was launched from the home screen or app drawer rather than from a
 * browser tab.
 *
 * @returns {boolean} `true` if the app is running as an installed PWA.
 */
export const isPWAInstalled = () => {
  return window.matchMedia("(display-mode: standalone)").matches;
};

/**
 * Triggers the browser's native PWA installation prompt.
 *
 * Can be wired directly to an `onPress` handler. The prompt is only shown when
 * the browser previously fired `beforeinstallprompt` and the user has not
 * already installed the app.
 *
 * @returns {boolean} `true` if the install prompt was shown; `false` if no
 *   deferred prompt was available (app already installed or browser does not
 *   support installation).
 */
export const installPWA = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt = null;
    return true;
  }
  alert("Install PWA not available");
  return false;
};

/**
 * Checks for a pending Service Worker update and prompts the user to refresh.
 *
 * Can be wired directly to an `onPress` handler. Calls
 * `ServiceWorkerRegistration.update()` on the active registration, then alerts
 * the user that a refresh is needed to apply the update.
 *
 * @returns {boolean} `true` if a Service Worker registration was found and
 *   `update()` was called; `false` if Service Workers are not supported in the
 *   current browser.
 */
export const updatePWA = () => {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        reg.update();
        alert("Update available. Refresh to apply.");
      } else {
        alert("No Service Worker found");
      }
    });
    return true;
  }
  alert("Service Worker not supported");
  return false;
};

/**
 * Guides the user through uninstalling the PWA.
 *
 * On Chrome, opens `chrome://apps` in a new tab where the user can remove the
 * app. On other browsers, falls back to a generic instruction to use the
 * browser's own settings.
 *
 * Can be wired directly to an `onPress` handler.
 */
export const removePWA = () => {
  if (navigator.userAgent.includes("Chrome")) {
    window.open("chrome://apps", "_blank");
  } else {
    alert("Use your browser settings to uninstall");
  }
};

export default { installPWA, updatePWA, removePWA, isPWAInstalled };
