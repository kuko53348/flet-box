// src/core/hmr-client.js
import { getAllRam, saveRam } from "../services/RamStore.js";

/** @type {WebSocket|null} Active WebSocket connection to the HMR server. */
let ws = null;

/**
 * Registry of modules tracked by HMR.
 * Keys are module URLs; values are the imported module objects.
 *
 * @type {Map<string, Object>}
 */
let modules = new Map();

/** sessionStorage key that carries `useState` RAM across a hot reload. */
const STATE_KEY = "__fletbox_hmr_state";

/** How many seconds to keep retrying after the server drops the socket. */
const MAX_RETRIES = 30;

let retries = 0;
let everOpened = false;
let retryTimer = null;

/**
 * The live state, JSON-safe.
 *
 * `useState` lives in a plain Map, so a value that cannot cross a page reload
 * (a DOM node, a circular graph, a function) is skipped rather than poisoning
 * the whole snapshot.
 *
 * @returns {Object}
 */
const snapshotRam = () => {
  const snapshot = {};
  for (const [key, value] of Object.entries(getAllRam())) {
    try {
      JSON.stringify(value);
      snapshot[key] = value;
    } catch (e) {
      // Not serialisable: this key starts from its default on the next page.
    }
  }
  return snapshot;
};

/**
 * Reload the page without losing the developer's place: state is written to
 * sessionStorage first and put back by `initHMR` on the next load.
 *
 * @returns {void}
 */
const reloadKeepingState = () => {
  try {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(snapshotRam()));
  } catch (e) {
    // Private mode, quota, no sessionStorage: reload anyway.
  }
  window.location.reload();
};

/**
 * Push a previous snapshot back into the RAM store.
 *
 * Runs after the app module has already rendered, which is fine: `saveRam`
 * notifies subscribers, so every `useState` binding repaints with the value it
 * had before the reload.
 *
 * @returns {number} keys restored
 */
const restoreRam = () => {
  let raw = null;
  try {
    raw = sessionStorage.getItem(STATE_KEY);
  } catch (e) {
    return 0;
  }
  if (!raw) return 0;
  let saved;
  try {
    saved = JSON.parse(raw);
  } catch (e) {
    return 0;
  }
  let restored = 0;
  for (const [key, value] of Object.entries(saved)) {
    if (saveRam(key, value)) restored++;
  }
  return restored;
};

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
 * A dropped socket is retried, not reloaded: reloading into a server that is
 * still restarting (or a tunnel that closed an idle socket) produced an error
 * page and then a reload loop. When the connection *re*-establishes, the code
 * the page runs is stale and the page reloads — with its state.
 *
 * @returns {void}
 */
export const initHMR = () => {
  const restored = restoreRam();
  if (restored) console.log(`♻️ HMR restored ${restored} state key(s)`);
  connect();
};

/**
 * @returns {void}
 */
const connect = () => {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  ws = new WebSocket(`${protocol}//${location.host}`);

  ws.onopen = () => {
    retries = 0;
    if (everOpened) {
      console.log("🔥 HMR reconnected — the page is stale, reloading");
      reloadKeepingState();
      return;
    }
    everOpened = true;
    console.log("🔥 HMR connected");
  };

  ws.onmessage = (event) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      return; // a proxy or tunnel injecting a non-JSON frame must not kill the client
    }

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
      console.log("🔄 Reload triggered by the server");
      reloadKeepingState();
    }
  };

  ws.onclose = () => {
    if (retries >= MAX_RETRIES) {
      console.warn("🔌 HMR gave up: the dev server is unreachable. Refresh to retry.");
      return;
    }
    retries++;
    clearTimeout(retryTimer);
    retryTimer = setTimeout(connect, 1000);
  };
};

/**
 * Handles an individual HMR update from the server.
 *
 * Three change types are supported:
 *
 * - `css` — hot-reloads matching `<link>` stylesheets by appending a cache-
 *   busting timestamp to their `href`, avoiding a full page reload.
 * - anything else — the module graph cannot be rebound in place, so the page
 *   reloads and the `useState` RAM is restored from the snapshot.
 *
 * @param {{ file: string, changeType: string }} data - The HMR payload from the server.
 * @param {string} data.file - Relative path of the changed file.
 * @param {string} data.changeType - The kind of change (`"css"`, or any other
 *   string for a reload with the state kept).
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

  if (changeType === "exports-changed") console.log(`📦 Exports changed in ${file}`);
  // A JS change reloads the page and puts the state back.
  //
  // Re-importing the file is not a swap: a widget that already closed over the
  // old function keeps the old function, and the fresh module instance nobody
  // references changes nothing on screen. What the developer should see is the
  // new code, so the module graph is re-fetched — and because `useState` RAM
  // survives the reload, that is not paid for with the form you were filling.
  console.log(`🔥 Reload with state: ${file}`);
  reloadKeepingState();
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
