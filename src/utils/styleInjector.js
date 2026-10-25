/**
 * @file styleInjector.js
 * @description
 * Shared, idempotent `@keyframes` injection.
 *
 * Keyframes are global by nature (CSS cannot scope them to an element), so
 * widgets must not each append their own `<style>` tag to `document.head` —
 * that duplicates tags and makes ownership unclear. This module centralises the
 * injection and guarantees each animation name is defined exactly once.
 *
 * @module styleInjector
 */

/** Animation names already injected in this document. */
const injected = new Set();

/**
 * Stable name derived from a keyframe body.
 *
 * `@keyframes` is global, so two effects that build their body from their own
 * options must not share a name: the first injection would win for both, and a
 * glow in red would come out blue. Hashing the body gives every distinct
 * animation its own name and lets identical ones reuse a single `<style>` — the
 * same rule that keeps `AnimatedText` (one animation per letter) from appending
 * a tag per letter.
 *
 * @param {string} prefix - Human-readable head, e.g. `"glow-pulse"`.
 * @param {string} frames - The keyframe body that determines the motion.
 * @returns {string} A CSS-safe identifier, e.g. `"glow-pulse-1a2b3c4d5e"`.
 */
export const animationName = (prefix, frames) => {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < frames.length; i++) {
    const c = frames.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193);
    h2 = Math.imul(h2 + c, 0x85ebca6b) ^ (h2 >>> 13);
  }
  return `${prefix}-${(h1 >>> 0).toString(36)}${(h2 >>> 0).toString(36)}`;
};

/**
 * Injects `@keyframes <name> { <frames> }` into `<head>` the first time the
 * given name is requested. Subsequent calls for the same name are no-ops.
 *
 * @param {string} name - The animation name (e.g. `"skeleton-pulse"`).
 * @param {string} frames - The keyframe body, without the `@keyframes` wrapper
 *   (e.g. `"0% { opacity: 1; } 100% { opacity: 0.5; }"`).
 * @param {string} [styleId] - Optional `id` for the injected `<style>` tag.
 *   Older docs/widgets referenced ids like `#skeleton-styles` / `#indeterminate-progress-style`.
 * @returns {void}
 */
export function injectKeyframes(name, frames, styleId) {
  if (injected.has(name) || typeof document === "undefined") return;
  injected.add(name);
  const style = document.createElement("style");
  style.setAttribute("data-flet-keyframes", name);
  if (styleId) style.setAttribute("id", styleId);
  style.textContent = `@keyframes ${name} { ${frames} }`;
  document.head.appendChild(style);
}

export default injectKeyframes;
