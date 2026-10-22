/**
 * @file remTool.js
 * @description The engine's entry point to the framework's one unit converter.
 *
 * This file used to keep its own copy of the rule — `value / 16` for numbers,
 * strings passed through untouched. Two converters in one framework means two
 * meanings for one number: a widget that called `src/utils/units.js` honoured
 * `setBaseFontSize()` and an engine-routed prop did not, so the same `40` painted
 * 40px in one place and 50px in another. Both halves now call the same function,
 * and a length written as pixels ("8px", "4px 12px") converts like the number
 * that produced it instead of freezing at that size.
 */
import { toREM as convert } from "../utils/units.js";

/**
 * @param {number|string} value - A framework number, or a CSS length/value.
 * @returns {string|*} `40` → `"2.5rem"`; `"8px 12px"` → `"0.5rem 0.75rem"`;
 *   anything that is not a pixel length (`"50%"`, `"auto"`) is returned as given.
 */
export const toREM = (value) => convert(value);
