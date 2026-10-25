// tools/margin.js
import { boxEdges } from "./boxEdges.js";

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
 * The grammar is shared with `padding()` and lives in `boxEdges.js`, so the two
 * cannot disagree about how a side is resolved.
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
export const margin = boxEdges;

export default margin;
