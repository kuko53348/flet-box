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
