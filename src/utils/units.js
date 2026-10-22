// src/modules/FletBox/utils/units.js
// import { toREM, setBaseFontSize, toPX } from './utils/units.js';
//
// // Global configuration (optional)
// setBaseFontSize(16);  // 1rem = 16px (default)
//
// // Automatic conversions
// toREM(16)    // "1rem"
// toREM(24)    // "1.5rem"
// toREM(8)     // "0.5rem"
//
// // A length written in pixels is re-written in rem; anything else is left alone
// toREM('16px')         // "1rem"
// toREM('8px 12px')     // "0.5rem 0.75rem"
// toREM('1rem')         // "1rem"
// toREM('50%')          // "50%"
// toREM('2px solid red')// "2px solid red"
//
// // For exact pixels
// toPX(16)     // "16px"
// toPX(24)     // "24px"
// toPX('1rem') // "1rem"

let BASE_FONT_SIZE = 16;

/**
 * Sets the base font size for rem conversion
 * @param {number} size - Base size in pixels (default 16)
 * @example
 * setBaseFontSize(16); // 1rem = 16px
 * setBaseFontSize(20); // 1rem = 20px
 */
export const setBaseFontSize = (size) => {
  BASE_FONT_SIZE = size;
  document.documentElement.style.fontSize = `${size}px`;
};

/**
 * Converts a numeric value to rem, or keeps strings as they are
 *
 * A number always becomes rem: `40` is `2.5rem`, so it grows with the reader's
 * base font the same way the rest of the page does.
 *
 * A string is usually a CSS value the framework should not touch (`"50%"`,
 * `"calc(100% - 8px)"`, `"2px solid red"`) and passes through unchanged. The one
 * exception is a length shorthand made only of pixels — `"8px 12px"`, `"0 16px"`,
 * `"-4px -8px"`. That shape is a widget writing a framework number by hand
 * (`padding: \`${v}px ${h}px\``), and if it passes through, the whole rule set
 * still scales except for the one line that spelled its units out. So every
 * token of it is converted: `"8px 12px"` → `"0.5rem 0.75rem"`.
 *
 * @param {number|string} value - Value to convert
 * @returns {string} Converted value (e.g. "1rem", "0.5rem 0.75rem", "50%")
 * @example
 * toREM(16)        // "1rem"
 * toREM(8)         // "0.5rem"
 * toREM('8px 12px')// "0.5rem 0.75rem"
 * toREM('16px')    // "1rem"
 * toREM('50%')     // "50%"
 * toREM('2px solid red') // unchanged: "solid" is not a length
 */
const PX_TOKEN = /^-?\d+(?:\.\d+)?px$/;

export const toREM = (value) => {
  if (value === undefined || value === null) return undefined;

  // If it is a number, convert to rem
  if (typeof value === "number") {
    return `${value / BASE_FONT_SIZE}rem`;
  }

  // If it is a string, return it as-is
  if (typeof value === "string") {
    const parts = value.trim().split(/\s+/);
    const allPixels = parts.every((part) => PX_TOKEN.test(part));
    if (!allPixels) return value;
    return parts
      .map((part) => `${parseFloat(part) / BASE_FONT_SIZE}rem`)
      .join(" ");
  }

  // For other types (objects, booleans, etc.)
  return String(value);
};

/**
 * Converts a value to pixels if it is a number, or keeps strings
 * @param {number|string} value - Value to convert
 * @returns {string} Value in pixels or original string
 * @example
 * toPX(16)     // "16px"
 * toPX('1rem') // "1rem"
 * toPX('50%')  // "50%"
 */
export const toPX = (value) => {
  if (value === undefined || value === null) return undefined;

  if (typeof value === "number") {
    return `${value}px`;
  }

  return value;
};

/**
 * Gets the current base size
 * @returns {number} Base size in pixels
 */
export const getBaseFontSize = () => BASE_FONT_SIZE;
