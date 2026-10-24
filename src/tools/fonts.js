// src/tools/fonts.js
// Webfont loading, so a `fontFamily` prop has something to name.

/**
 * `fontFamily` is a CSS family name; if the bytes of that face are not on the
 * machine, the browser silently paints its fallback and the app ships a typeface
 * nobody chose. This module is the missing half: ask for the family, get a
 * promise that settles when the request is done, and set the prop from it.
 *
 * One thing this cannot promise: a webfont is a network request. A self-hosted
 * same-origin stylesheet survives an offline launch; a provider URL does not.
 * `loadFont` therefore never fails a screen — it resolves `false` when the face
 * could not be had, and the app keeps its fallback.
 */

/** @type {Map<string, Promise<boolean>>} One request per family, however many callers ask. */
const loading = new Map();

const toCssTime = (weights) => weights.map((weight) => Number(weight) || 0).join(";");

const googleUrl = (family, weights, display) =>
  `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}${
    weights.length ? `:wght@${toCssTime(weights)}` : ""
  }&display=${display}`;

const appendLink = (rel, href, attributes = {}) => {
  const link = document.createElement("link");
  link.rel = rel;
  if (href) link.href = href;
  for (const [name, value] of Object.entries(attributes)) link.setAttribute(name, value);
  document.head.appendChild(link);
  return link;
};

// A cross-origin stylesheet wants its origin warm before the request, or the face
// arrives a round trip late. Once per origin: every family on the same host would
// otherwise add its own pair.
const preconnect = (href) => {
  if (document.head.querySelector(`link[rel="preconnect"][href="${href}"]`)) return;
  appendLink("preconnect", href, { crossorigin: "anonymous" });
};

/**
 * Load a webfont family.
 *
 * @param {string} family - The CSS family name, e.g. `"Inter"`.
 * @param {object} [options]
 * @param {number[]} [options.weights] - Weights to fetch (`[400, 600]`). A Google
 *   family with no weight list arrives at 400 only, which is a face that cannot
 *   carry a heading.
 * @param {string} [options.url] - A stylesheet to load instead of Google's: a
 *   self-hosted `@font-face` file, or any other provider.
 * @param {"auto" | "block" | "swap" | "fallback" | "optional"} [options.display="swap"]
 *   CSS `font-display`, Google URLs only. `swap` paints the fallback at once and
 *   replaces it when the face lands; `optional` may skip it on a slow connection.
 * @returns {Promise<boolean>} `true` when the stylesheet landed, `false` when it
 *   did not — and an immediate `false` where there is no document to write to, so
 *   importing this module in Node never throws.
 */
export const loadFont = (family, options = {}) => {
  if (typeof document === "undefined" || !family) return Promise.resolve(false);
  const key = String(family);
  if (loading.has(key)) return loading.get(key);

  const run = new Promise((resolve) => {
    const { weights = [], url, display = "swap" } = options;
    const href = url || googleUrl(key, weights, display);
    if (!url) {
      preconnect("https://fonts.googleapis.com");
      preconnect("https://fonts.gstatic.com");
    }

    const link = appendLink("stylesheet", href, { "data-fb-font": key });
    // The face itself still has to paint; `document.fonts.ready` is the point
    // where the engine has finished everything it started, loaded or not.
    const settle = () => {
      if (typeof document.fonts?.ready?.then !== "function") return resolve(true);
      document.fonts.ready.then(() => resolve(true), () => resolve(false));
    };
    link.addEventListener("load", settle);
    link.addEventListener("error", () => resolve(false));
  });

  loading.set(key, run);
  return run;
};

/**
 * Wait for every face the document has already started, without asking for one.
 * Use it before a canvas paint or an export, where text that reflows after the
 * drawing is a visible bug.
 *
 * @returns {Promise<boolean>} `true` when the font engine settled, `false` where
 *   there is none.
 */
export const fontsReady = () => {
  if (typeof document === "undefined" || !document.fonts) return Promise.resolve(false);
  return document.fonts.ready.then(() => true, () => false);
};
