// Shadow.js - Minimal box-shadow helper

/**
 * Generate a CSS box-shadow string from individual components.
 *
 * Keeps callers from having to manually concatenate pixel values and color strings.
 * Every parameter maps 1-to-1 to the CSS `box-shadow` shorthand property.
 *
 * @param {number} x - Horizontal offset in pixels (positive = right, negative = left)
 * @param {number} y - Vertical offset in pixels (positive = down, negative = up)
 * @param {number} blur - Blur radius in pixels (0 = sharp edge)
 * @param {number} spread - Spread radius in pixels (positive = larger shadow, negative = smaller)
 * @param {string} color - Shadow color (any valid CSS color value, e.g. "rgba(0,0,0,0.3)")
 * @returns {string} CSS box-shadow value
 *
 * @example
 * shadow(0, 4, 8, 0, "rgba(0,0,0,0.2)")
 * // "0px 4px 8px 0px rgba(0,0,0,0.2)"
 */
const shadow = (x, y, blur, spread, color) =>
  `${x}px ${y}px ${blur}px ${spread}px ${color}`;

/**
 * The framework's depth scale, shared by every widget that lifts off the page.
 *
 * The engine routes `elevation` straight into `style.boxShadow`, so a bare
 * number is an invalid declaration the browser drops without a word: a widget
 * that forwards `elevation` instead of one of these strings looks configured and
 * paints flat. A widget that wants a numeric depth reads the level here and
 * passes the resulting string.
 *
 * `0` is deliberately `none` — a flush surface is a decision, not a missing one.
 */
export const SHADOW_LEVELS = {
  0: "none",
  1: "0 1px 3px rgba(0,0,0,0.12)",
  2: "0 3px 6px rgba(0,0,0,0.16)",
  3: "0 6px 12px rgba(0,0,0,0.2)",
  4: "0 10px 20px rgba(0,0,0,0.25)",
  5: "0 15px 30px rgba(0,0,0,0.3)",
};

export default shadow;
