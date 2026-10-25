// helpers/boxEdges.js
/**
 * @file boxEdges.js
 * @description
 * The one implementation behind `margin()` and `padding()`.
 *
 * CSS gives `margin` and `padding` the same four-value grammar, and the two
 * helpers had drifted into two byte-identical copies of the side-resolution
 * logic — 63 lines each, 25 branches each, differing only in the word in the
 * JSDoc. A fix to the priority order or to the shorthand collapsing had to be
 * made twice, so it is made here and both helpers delegate.
 *
 * Resolved per side, in priority order: the individual side, then its axis
 * (`vertical` for top/bottom, `horizontal` for left/right), then `all`, then 0.
 *
 * @module helpers/boxEdges
 */

/** A number becomes a px string; anything else is already CSS and passes through. */
const px = (value) => (typeof value === "number" ? `${value}px` : value);

/**
 * Resolves one side of the box from the options object.
 *
 * @param {Object} value - The options object.
 * @param {string} side - `top`, `right`, `bottom` or `left`.
 * @param {string} axis - `vertical` or `horizontal`.
 * @returns {number|string} The raw side value; `0` when nothing applies.
 */
const sideOf = (value, side, axis) =>
  value[side] !== undefined
    ? value[side]
    : value[axis] !== undefined
      ? value[axis]
      : value.all !== undefined
        ? value.all
        : 0;

/**
 * Builds the CSS box shorthand for a margin or a padding.
 *
 * One value when all four sides agree, two when only the axes differ, four
 * otherwise. Callers are `margin()` and `padding()`; the value they receive is
 * the same string CSS would have been handed had each side been written out.
 *
 * @param {number|string|Object} value
 *   A number (converted to `px`), a raw CSS string, or an options object with
 *   `all`, `horizontal`, `vertical` and per-side overrides.
 * @returns {string} A CSS shorthand value.
 */
export const boxEdges = (value) => {
  // A number or raw CSS string applies uniformly to all sides.
  if (typeof value === "number" || typeof value === "string") return px(value);

  if (typeof value === "object") {
    const top = px(sideOf(value, "top", "vertical"));
    const right = px(sideOf(value, "right", "horizontal"));
    const bottom = px(sideOf(value, "bottom", "vertical"));
    const left = px(sideOf(value, "left", "horizontal"));

    if (top === right && right === bottom && bottom === left) return top;
    if (top === bottom && right === left) return `${top} ${right}`;
    return `${top} ${right} ${bottom} ${left}`;
  }

  return "0px";
};

export default boxEdges;
