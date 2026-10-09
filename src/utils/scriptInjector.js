/**
 * @file scriptInjector.js
 * @description
 * Shared, idempotent external `<script>` loading.
 *
 * Like `@keyframes`, a third-party SDK script is global to the document: it must
 * be loaded exactly once even if several widgets request it (for example a page
 * with multiple ad units sharing one vendor SDK). Widgets therefore must not
 * each append their own `<script>` tag — this module centralises the injection
 * and returns the same promise for the same URL.
 *
 * @module scriptInjector
 */

/** URL → Promise<HTMLScriptElement> for scripts already requested. */
const pending = new Map();

/**
 * Loads an external script once and resolves when it is ready.
 *
 * @param {string} src - Absolute script URL.
 * @param {Object} [options]
 * @param {boolean} [options.async=true] - Set the `async` attribute.
 * @param {string} [options.crossOrigin] - Value for the `crossorigin` attribute.
 * @param {Record<string,string>} [options.attrs] - Extra attributes to stamp on
 *   the tag (e.g. `{ "data-flet-adsense": "ca-pub-…" }`).
 * @returns {Promise<HTMLScriptElement|null>} Resolves with the script element,
 *   or `null` outside a DOM environment. Rejects when the script fails to load.
 */
export function injectScript(src, options = {}) {
  if (typeof document === "undefined") return Promise.resolve(null);
  if (pending.has(src)) return pending.get(src);

  const promise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      // A script already in the document was not created by this module (our
      // own tags are cached in `pending`), so it comes from the host page. We
      // cannot observe its load state retroactively, and command-queue SDKs
      // (AdSense) tolerate pushes before the script finishes loading, so treat
      // it as ready instead of hanging on an already-fired `load` event.
      resolve(existing);
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = options.async !== false;
    if (options.crossOrigin) script.crossOrigin = options.crossOrigin;
    for (const [name, value] of Object.entries(options.attrs || {})) {
      script.setAttribute(name, value);
    }
    script.addEventListener(
      "load",
      () => {
        script.dataset.fletLoaded = "true";
        resolve(script);
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => reject(new Error(`Failed to load script: ${src}`)),
      { once: true },
    );
    document.head.appendChild(script);
  });

  pending.set(src, promise);
  return promise;
}

export default injectScript;
