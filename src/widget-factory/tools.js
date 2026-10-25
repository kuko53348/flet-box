// The engine owns the reduced-motion contract: a widget that writes an
// `infinite` CSS animation through these helpers is marked so the injected
// `@media (prefers-reduced-motion: reduce)` rule can reach it, even when the
// reader flips the OS setting long after the element was built.
import { markMotionLoop } from "../animations/motion.js";

// ============================================================
// ➕ CREATE / UPDATE: Assign styles
// ============================================================

/**
 * Converts a raw prop value to a CSS-ready string or number.
 *
 * Conversion rules:
 * - **Array** → space-separated string (e.g. `[12, 24]` → `"12px 24px"`).
 * - **Number** on a unitless prop (flex, zIndex, opacity, etc.) → returned
 *   as-is without a suffix.
 * - **Number** on any other prop → suffixed with `"px"`.
 * - **String** → returned unchanged.
 * - `undefined` / `null` → returned as `null` (caller should skip assignment).
 *
 * @param {string} key - The CSS property name (camelCase).
 * @param {*} value - The raw value to convert.
 * @returns {string|number|null} The CSS-ready value, or `null` to skip.
 */
const toCSSValue = (key, value) => {
  if (value === undefined || value === null) return null;

  // Array → "12px 24px"
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === "number" ? `${v}px` : v)).join(" ");
  }

  // Number → apply unit or no unit
  if (typeof value === "number") {
    // Props that must NOT receive a unit suffix
    const noUnitProps = new Set([
      "flex",
      "flexGrow",
      "flexShrink",
      "order",
      "zIndex",
      "opacity",
      "fontWeight",
      "lineHeight",
      "scale",
      "rotate",
      "rotateX",
      "rotateY",
      "rotateZ",
    ]);

    if (noUnitProps.has(key)) {
      return value; // No unit
    }
    return `${value}px`; // Add px
  }

  // String → keep as is
  return value;
};

/**
 * Whether a style assignment puts an endless animation on the element.
 *
 * Only a loop is marked: a one-shot entrance finishes on its own, and the
 * reduced-motion rule would then only be noise.
 *
 * @param {string} prop - The CSS property being written.
 * @param {*} value - The value being written.
 * @returns {boolean} True when this write starts an `infinite` animation.
 */
const isLoopingAnimation = (prop, value) => {
  if (typeof value !== "string") return false;
  if (prop === "animation") return value.includes("infinite");
  if (prop === "animationIterationCount") return value.trim() === "infinite";
  return false;
};

/**
 * Applies one or more styles to a DOM element.
 *
 * Supports two call signatures:
 * 1. `setStyles(el, propName, value)` – sets a single CSS property.
 * 2. `setStyles(el, stylesObject)` – applies every key/value pair in the object.
 *
 * Values are converted via `toCSSValue` before assignment. Invalid CSS
 * assignments (e.g. read-only properties) are silently ignored.
 *
 * @param {HTMLElement} el - The target element.
 * @param {string|Object} prop - CSS property name (camelCase) or an object of
 *   property–value pairs.
 * @param {*} [value] - The value to assign. Required when `prop` is a string.
 * @returns {HTMLElement} The element (for chaining).
 */
export function setStyles(el, prop, value) {
  // Validateste element
  if (!el || !el.style) return el;

  // Case 1: string (prop + value)
  if (typeof prop === "string") {
    const cssValue = toCSSValue(prop, value);
    if (cssValue !== null) {
      try {
        el.style[prop] = cssValue;
      } catch (e) {
        // Silently ignore errors
      }
      if (isLoopingAnimation(prop, cssValue)) markMotionLoop(el);
    }
    return el;
  }

  // Case 2: styles object
  if (typeof prop === "object" && prop !== null) {
    let loops = false;
    for (const [key, val] of Object.entries(prop)) {
      const cssValue = toCSSValue(key, val);
      if (cssValue !== null) {
        try {
          el.style[key] = cssValue;
        } catch (e) {
          // Silently ignore errors
        }
        if (isLoopingAnimation(key, cssValue)) loops = true;
      }
    }
    if (loops) markMotionLoop(el);
  }

  return el;
}
