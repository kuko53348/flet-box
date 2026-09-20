// ============================================================
// 📋 READ: Get styles
// ============================================================

/**
 * Reads one or all inline styles from a DOM element.
 *
 * @param {HTMLElement|null} el - The target element.
 * @param {string} [prop] - CSS property name. When provided, returns only that
 *   property's value (or `null` when absent). When omitted, returns an object
 *   containing every non-empty inline style.
 * @returns {string|Object|null} The property value, a styles object, or `null`
 *   when `el` is falsy or the property is not set.
 */
export function getStyles(el, prop) {
  if (!el) return null;
  if (prop) return el.style[prop] || null;

  const styles = {};
  for (let i = 0; i < el.style.length; i++) {
    const p = el.style[i];
    const v = el.style[p];
    if (v !== "") styles[p] = v;
  }
  return styles;
}

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
  // Validate element
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
    }
    return el;
  }

  // Case 2: styles object
  if (typeof prop === "object" && prop !== null) {
    for (const [key, val] of Object.entries(prop)) {
      const cssValue = toCSSValue(key, val);
      if (cssValue !== null) {
        try {
          el.style[key] = cssValue;
        } catch (e) {
          // Silently ignore errors
        }
      }
    }
  }

  return el;
}

// ============================================================
// 🔄 TOGGLE: Toggle styles
// ============================================================

/**
 * Toggles a CSS property between two values.
 *
 * If the property currently equals `val1` it is set to `val2`, and vice versa.
 * Useful for toggling visibility, themes, or active states without external
 * boolean tracking.
 *
 * @param {HTMLElement} el - The target element.
 * @param {string} prop - CSS property name (camelCase).
 * @param {*} val1 - First value (the one to switch away from when current).
 * @param {*} val2 - Second value (the one to switch away from when current).
 * @returns {HTMLElement} The element (for chaining).
 */
export function updateStyle(el, prop, val1, val2) {
  if (!el || !prop) return el;

  const current = el.style[prop] || "";
  const newValue = current === val1 ? val2 : val1;
  const cssValue = toCSSValue(prop, newValue);

  if (cssValue !== null) {
    try {
      el.style[prop] = cssValue;
    } catch (e) {
      // Silently ignore errors
    }
  }

  return el;
}

// ============================================================
// 🗑️ DELETE: Remove styles
// ============================================================

/**
 * Removes one or more inline styles from a DOM element by setting them to an
 * empty string (which causes the browser to fall back to inherited / default
 * values).
 *
 * - `string` → removes that single property.
 * - `Array<string>` → removes every listed property.
 * - `undefined` → removes ALL currently set inline styles.
 *
 * @param {HTMLElement} el - The target element.
 * @param {string|string[]|undefined} [prop] - Property or properties to remove.
 *   Omit to remove all inline styles.
 * @returns {HTMLElement} The element (for chaining).
 */
export function removeStyles(el, prop) {
  if (!el) return el;

  if (typeof prop === "string") {
    try {
      el.style[prop] = "";
    } catch (e) {}
  } else if (Array.isArray(prop)) {
    prop.forEach((p) => {
      try {
        el.style[p] = "";
      } catch (e) {}
    });
  } else if (prop === undefined) {
    const styles = getStyles(el);
    Object.keys(styles).forEach((p) => {
      try {
        el.style[p] = "";
      } catch (e) {}
    });
  }
  return el;
}

// ============================================================
// 🔍 UTILITY: Check styles
// ============================================================

/**
 * Checks whether a specific inline style is set on an element.
 *
 * @param {HTMLElement|null} el - The target element.
 * @param {string} prop - CSS property name (camelCase).
 * @returns {boolean} `true` if the property has a non-empty inline value.
 */
export function hasStyle(el, prop) {
  if (!el || !prop) return false;
  return el.style[prop] !== "";
}

/**
 * Logs all inline styles of an element to the console in a readable format.
 * Useful for debugging style issues during development.
 *
 * @param {HTMLElement|null} el - The target element.
 * @param {string} [label="Styles"] - Label prefix shown in the console output.
 * @returns {Object|null} The styles object (same as `getStyles(el)`), or `null`
 *   when `el` is falsy.
 */
export function logStyles(el, label = "Styles") {
  if (!el) {
    console.warn("⚠️ Invalid element");
    return null;
  }
  const styles = getStyles(el);
  console.log(`📋 ${label}:`);
  if (Object.keys(styles).length === 0) {
    console.log("  (No inline styles)");
  } else {
    Object.entries(styles).forEach(([p, v]) => console.log(`  ${p}: ${v}`));
  }
  return styles;
}
