// tools/margin.js

/**
 * Generates a CSS `margin` shorthand string from a number, a plain CSS string,
 * or a configuration object.
 *
 * When all resolved sides are equal the output is a single value (e.g. `"20px"`).
 * When only top/bottom differ from left/right the two-value shorthand is used
 * (e.g. `"10px 20px"`). Otherwise the full four-value form is returned.
 *
 * Object option keys (all optional, resolved in priority order per side):
 * - `all` — applies to every side.
 * - `horizontal` — applies to `left` and `right`.
 * - `vertical` — applies to `top` and `bottom`.
 * - `top`, `right`, `bottom`, `left` — individual side overrides.
 *
 * @param {number|string|Object} value
 *   A number (converted to `px`), a raw CSS string, or an options object.
 * @returns {string} CSS margin value.
 *
 * @example
 * margin(20)                                        // "20px"
 * margin({ all: 20 })                               // "20px"
 * margin({ horizontal: 20, vertical: 10 })          // "10px 20px"
 * margin({ top: 10, right: 20, bottom: 10, left: 20 }) // "10px 20px"
 * margin({ left: 20, right: 20 })                   // "0px 20px"
 * margin({ top: 10, bottom: 10 })                   // "10px 0px"
 */
export const margin = (value) => {
  // A number or raw CSS string applies uniformly to all sides
  if (typeof value === "number" || typeof value === "string") {
    const px = typeof value === "number" ? `${value}px` : value;
    return px;
  }

  // Object form — resolve each side independently
  if (typeof value === "object") {
    const top =
      value.top !== undefined
        ? value.top
        : value.vertical !== undefined
          ? value.vertical
          : value.all !== undefined
            ? value.all
            : 0;
    const right =
      value.right !== undefined
        ? value.right
        : value.horizontal !== undefined
          ? value.horizontal
          : value.all !== undefined
            ? value.all
            : 0;
    const bottom =
      value.bottom !== undefined
        ? value.bottom
        : value.vertical !== undefined
          ? value.vertical
          : value.all !== undefined
            ? value.all
            : 0;
    const left =
      value.left !== undefined
        ? value.left
        : value.horizontal !== undefined
          ? value.horizontal
          : value.all !== undefined
            ? value.all
            : 0;

    const topPx = typeof top === "number" ? `${top}px` : top;
    const rightPx = typeof right === "number" ? `${right}px` : right;
    const bottomPx = typeof bottom === "number" ? `${bottom}px` : bottom;
    const leftPx = typeof left === "number" ? `${left}px` : left;

    // All sides equal — return a single value
    if (topPx === rightPx && rightPx === bottomPx && bottomPx === leftPx) {
      return topPx;
    }

    // Only horizontal and vertical differ — use two-value shorthand
    if (topPx === bottomPx && rightPx === leftPx) {
      return `${topPx} ${rightPx}`;
    }

    // Full four-value form
    return `${topPx} ${rightPx} ${bottomPx} ${leftPx}`;
  }

  return "0px";
};

export default margin;
