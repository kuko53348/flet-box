/**
 * Generate a CSS gradient string.
 *
 * Supports linear, radial (circle), and conic gradient types.
 * Use the returned string as a CSS `background` value on any element.
 *
 * @param {"linear"|"circle"|"conic"} type - Gradient type:
 *   - `"linear"` → `linear-gradient(angleDeg, ...stops)`
 *   - `"circle"` → `radial-gradient(circle, ...stops)`
 *   - `"conic"`  → `conic-gradient(from angleDeg, ...stops)`
 * @param {string[]} colors - Array of color stop values (any valid CSS color)
 * @param {number} [angle=135] - Angle in degrees (used for linear and conic gradients)
 * @returns {string} CSS gradient value
 *
 * @example
 * // Use in a Container's background prop:
 * gradient('linear', ['red', 'blue'])
 * // "linear-gradient(135deg, red, blue)"
 *
 * gradient('circle', ['white', 'black'])
 * // "radial-gradient(circle, white, black)"
 *
 * gradient('conic', ['red', 'yellow', 'blue'])
 * // "conic-gradient(from 135deg, red, yellow, blue)"
 */

const gradient = (type, colors, angle = 135) => {
  const stops = colors.join(", ");
  if (type === "linear") return `linear-gradient(${angle}deg, ${stops})`;
  if (type === "circle") return `radial-gradient(circle, ${stops})`;
  return `conic-gradient(from ${angle}deg, ${stops})`;
};

export default gradient;
