// tools/border.js

/**
 * Generate a CSS border shorthand string.
 *
 * Converts individual border parameters into the `border` CSS shorthand so
 * callers don't have to concatenate strings manually. Accepts either a number
 * (auto-suffixed with `"px"`) or a pre-formatted string for `width`.
 *
 * @param {number|string} [width=1] - Border width. Numbers are treated as pixels;
 *   strings are used as-is (e.g. `"0.5rem"`, `"thin"`).
 * @param {string} [style="solid"] - Border style — any valid CSS border-style keyword
 *   (`"solid"`, `"dashed"`, `"dotted"`, `"double"`, `"none"`, etc.)
 * @param {string} color - Border color — any valid CSS color value.
 *   Required; there is no default because a colorless border is invisible.
 * @returns {string} CSS border shorthand value
 *
 * @example
 * border(1, 'solid', '#ccc')      // "1px solid #ccc"
 * border(2, 'dashed', 'red')      // "2px dashed red"
 * border('0.5rem', 'dotted', 'var(--outline)') // "0.5rem dotted var(--outline)"
 */
export const border = (width = 1, style = "solid", color) => {
  const widthStr = typeof width === "number" ? `${width}px` : width;
  return `${widthStr} ${style} ${color}`;
};

export default border;
