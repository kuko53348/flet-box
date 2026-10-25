/**
 * @file fieldFont.js
 * @description
 * Keeps a focused text field from zooming the page on iOS.
 *
 * WebKit magnifies the whole viewport when a text control whose computed
 * `font-size` is below 16px takes focus, so typing in a compiled iOS app made
 * the screen grow and stay deformed. The design sizes here are framework units
 * (12 / 14 / 16 for `small` / `medium` / `large`), and two of them sit under
 * that threshold.
 *
 * The fix is a floor, not a new size: on iOS the field text is at least 16px
 * while everything else keeps its rem value. The widget writes the length it
 * paints with into `--fb-field-font`, so a reader who raises the browser font
 * still gets a larger field (medium becomes 17.5px at a 20px root) — a flat
 * `16px` would have shrunk that field instead of merely flooring it.
 *
 * The rule arrives in a stylesheet because an inline `font-size` outranks one,
 * and it is scoped to `html[data-fb-ios]` so every other platform keeps the
 * design's own sizes. That attribute also gives the regression harness a switch
 * it can flip without an iPhone.
 *
 * @module fieldFont
 */

/** `id` of the injected tag, so the guard reaches it after HMR or a `document.write`. */
const STYLE_ID = "fletbox-field-font";

/** WebKit's auto-zoom threshold: a focused control under 16px scales the page. */
const MIN_FIELD_PX = 16;

/**
 * Whether these navigator values describe iOS.
 *
 * iPadOS 13 and later report a desktop Mac user agent, so the touch points are
 * what separate an iPad from a MacBook: a Mac reports 0, an iPad reports 5.
 *
 * @param {string} [ua] - `navigator.userAgent`.
 * @param {string} [platform] - `navigator.platform`.
 * @param {number} [touchPoints] - `navigator.maxTouchPoints`.
 * @returns {boolean}
 */
export const looksLikeIOS = (ua = "", platform = "", touchPoints = 0) => {
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  return platform === "MacIntel" && touchPoints > 1;
};

const runningOnIOS = () =>
  typeof navigator !== "undefined" &&
  looksLikeIOS(navigator.userAgent || "", navigator.platform || "", navigator.maxTouchPoints || 0);

const FIELD_FONT_RULE = `html[data-fb-ios] [data-fb-field] input,
html[data-fb-ios] [data-fb-field] textarea {
  font-size: max(${MIN_FIELD_PX}px, var(--fb-field-font, 1rem)) !important;
}`;

/**
 * Marks the document as iOS and injects the field floor, once.
 *
 * The attribute is re-checked on every call because it is what the rule keys
 * on; the `<style>` tag is the part that must not be duplicated. No-ops outside
 * a browser, so the package stays importable in Node.
 *
 * @returns {void}
 */
export function ensureFieldFont() {
  if (typeof document === "undefined") return;
  if (runningOnIOS()) document.documentElement.setAttribute("data-fb-ios", "");
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = FIELD_FONT_RULE;
  document.head.appendChild(style);
}

export default ensureFieldFont;
