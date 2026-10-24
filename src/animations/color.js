/**
 * color.js - The one color reader both animation engines use.
 *
 * The declarative engine (`AnimatedBox`) and the imperative one (`animate`) each
 * grew a color mixer, and they disagreed: one parsed hex and `rgb()` and wrote an
 * unclamped `rgba()`, the other parsed hex only. A caller who moved a working
 * `from: "rgba(255, 0, 0, 0.4)"` from one to the other got the string `"NaNpx"`
 * written every frame, which the browser drops silently — the animation looked
 * like it ran and changed nothing. One parser, one output, both engines.
 *
 * @module animations/color
 */

/**
 * The channels of a CSS color, or `null` when the value is not a color this
 * module can blend.
 *
 * Hex (3- and 6-digit) and `rgb()`/`rgba()` are the shapes a design token
 * actually arrives in. A named color (`"tomato"`) is not: blending it needs a
 * lookup table for 148 names, and the honest answer is to refuse rather than to
 * interpolate towards black.
 *
 * @param {string} value - A hex or `rgb()`/`rgba()` color.
 * @returns {[number, number, number, number]|null} `[red, green, blue, alpha]`,
 *   with the channels in `[0, 255]` and alpha in `[0, 1]`.
 */
export const parseColor = (value) => {
  if (typeof value !== "string") return null;
  const text = value.trim();

  const hex = text.match(/^#?([a-f\d]{3,4}|[a-f\d]{6}|[a-f\d]{8})$/i);
  if (hex) {
    const digits = hex[1];
    if (digits.length <= 4) {
      // `#rgb` and `#rgba` are the short forms of the same eight digits.
      const channel = (index) => parseInt(digits[index], 16) * 0x11;
      const alpha = digits.length === 4 ? parseInt(digits[3], 16) / 255 : 1;
      return [channel(0), channel(1), channel(2), alpha];
    }
    const channel = (offset) => parseInt(digits.slice(offset, offset + 2), 16);
    const alpha = digits.length === 8 ? channel(6) / 255 : 1;
    return [channel(0), channel(2), channel(4), alpha];
  }

  const rgb = text.match(
    /^rgba?\(\s*([\d.]+)(?:%?)\s*[,\s]\s*([\d.]+)(?:%?)\s*[,\s]\s*([\d.]+)(?:%?)\s*(?:[,/]\s*([\d.]+)\s*%?)?\)$/i,
  );
  if (rgb) {
    const channels = [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
    if (channels.some((n) => !Number.isFinite(n))) return null;
    const alpha = rgb[4] === undefined ? 1 : Number(rgb[4]);
    return [...channels, Number.isFinite(alpha) ? alpha : 1];
  }

  return null;
};

/**
 * True when this module knows how to blend the value.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export const isColor = (value) => parseColor(value) !== null;

/**
 * Linearly interpolates between two CSS colors.
 *
 * A curve that overshoots runs past 1, and an `rgb()` channel outside 0–255 makes
 * the browser drop the whole declaration — the color would blink, not overshoot.
 * Both channels and alpha are therefore clamped, so the value is always writable.
 *
 * @param {string} from   - Starting color (hex or `rgb()`/`rgba()`).
 * @param {string} to     - Ending color.
 * @param {number} t      - Interpolation factor; values outside `[0, 1]` are clamped.
 * @returns {string} The blended color as `"rgba(r, g, b, a)"`, or the starting
 *   color when either side is not a color this module parses.
 */
export const mixColor = (from, to, t) => {
  const a = parseColor(from);
  const b = parseColor(to);
  if (!a || !b) return from;
  const progress = Math.min(1, Math.max(0, t));
  const channel = (start, end) =>
    Math.round(Math.min(255, Math.max(0, start + (end - start) * progress)));
  const alpha = Math.min(1, Math.max(0, a[3] + (b[3] - a[3]) * progress));
  return `rgba(${channel(a[0], b[0])}, ${channel(a[1], b[1])}, ${channel(
    a[2],
    b[2],
  )}, ${Number(alpha.toFixed(3))})`;
};
