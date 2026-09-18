// src/core/pwa.js - PWA functions listas para onPress
let deferredPrompt = null;

// Listen for install event (only in a browser; keep the module importable in Node/SSR/tests)
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });
}

// Check if already installed
export const isPWAInstalled = () => {
  return window.matchMedia("(display-mode: standalone)").matches;
};

// Install - directo para onPress
export const installPWA = () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt = null;
    return true;
  }
  alert("Install PWA not available");
  return false;
};

// Update - directo para onPress
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

// Remove - directo para onPress
export const removePWA = () => {
  if (navigator.userAgent.includes("Chrome")) {
    window.open("chrome://apps", "_blank");
  } else {
    alert("Use your browser settings to uninstall");
  }
};

export default { installPWA, updatePWA, removePWA, isPWAInstalled };
