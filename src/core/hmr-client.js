// src/core/hmr-client.js

/** @type {WebSocket|null} Active WebSocket connection to the HMR server. */
let ws = null;

/**
 * Registry of modules tracked by HMR.
 * Keys are module URLs; values are the imported module objects.
 *
 * @type {Map<string, Object>}
 */
let modules = new Map();

/**
 * Initialises the Hot Module Replacement (HMR) client.
 *
 * Opens a WebSocket connection to the current host using the appropriate
 * protocol (`ws:` or `wss:` depending on whether the page is served over
 * HTTPS). Handles three server message types:
 *
 * - `request-modules` — the server asks which modules this client has
 *   registered; responds with a `register-modules` message.
 * - `hmr` — a file changed; delegates to `handleHMR`.
 * - `reload` — the server requests a full page reload.
 *
 * On disconnect the client waits 500 ms then reloads the page so the
 * developer always sees a fresh state.
 */
export const initHMR = () => {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  ws = new WebSocket(`${protocol}//${location.host}`);

  ws.onopen = () => {
    console.log("🔥 HMR connected");
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "request-modules") {
      // Send the list of registered module URLs back to the server.
      const moduleUrls = Array.from(modules.keys());
      ws.send(
        JSON.stringify({ type: "register-modules", modules: moduleUrls }),
      );
    }

    if (data.type === "hmr") {
      handleHMR(data);
    }

    if (data.type === "reload") {
      console.log("🔄 Full reload triggered");
      window.location.reload();
    }
  };

  ws.onclose = () => {
    console.log("🔄 HMR disconnected, reloading...");
    setTimeout(() => window.location.reload(), 500);
  };
};

/**
 * Handles an individual HMR update from the server.
 *
 * Three change types are supported:
 *
 * - `css` — hot-reloads matching `<link>` stylesheets by appending a cache-
 *   busting timestamp to their `href`, avoiding a full page reload.
 * - `exports-changed` — the module's public API changed in a way that cannot
 *   be patched in-place; triggers a full reload.
 * - anything else — re-imports the changed module via a dynamic `import()` and
 *   dispatches an `hmr:update` CustomEvent so components can react. Falls back
 *   to a full reload if the import fails.
 *
 * @param {{ file: string, changeType: string }} data - The HMR payload from the server.
 * @param {string} data.file - Relative path of the changed file.
 * @param {string} data.changeType - The kind of change (`"css"`,
 *   `"exports-changed"`, or any other string for a JS hot-swap).
 */
const handleHMR = (data) => {
  const { file, changeType } = data;

  if (changeType === "css") {
    // Reload CSS without a full page refresh by replacing each matching <link>
    // element with a clone that has a cache-busting timestamp in its href.
    const links = document.querySelectorAll(
      `link[href*="${file.replace(/\\/g, "/")}"]`,
    );
    links.forEach((link) => {
      const newLink = link.cloneNode();
      newLink.href = link.href.split("?")[0] + "?t=" + Date.now();
      link.parentNode.replaceChild(newLink, link);
    });
    console.log(`🎨 Hot reloaded CSS: ${file}`);
    return;
  }

  if (changeType === "exports-changed") {
    console.log(`📦 Exports changed in ${file}, reloading...`);
    window.location.reload();
    return;
  }

  // JS code change — attempt a hot swap via dynamic import.
  console.log(`🔥 Hot reloading: ${file}`);
  const url = `/${file}?t=${Date.now()}`;
  import(url)
    .then((module) => {
      // Notify any listening components that the module was updated.
      window.dispatchEvent(
        new CustomEvent("hmr:update", { detail: { file, module } }),
      );
    })
    .catch((err) => {
      console.error("HMR import failed:", err);
      window.location.reload();
    });
};

/**
 * Registers a module URL in the local HMR module registry so the server can
 * track which modules this client is using.
 *
 * @param {string} url - The URL (path) of the module to register.
 * @param {Object} module - The imported module object.
 */
export const registerModule = (url, module) => {
  modules.set(url, module);
};

/**
 * Returns the current WebSocket connection used by the HMR client, or `null`
 * if `initHMR` has not been called yet.
 *
 * @returns {WebSocket|null} The active WebSocket instance.
 */
// ✅ Added the getHMR function to match the export in index.js
export const getHMR = () => ws;

export default { initHMR, registerModule, getHMR };
