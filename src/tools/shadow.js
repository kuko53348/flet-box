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

export default shadow;
