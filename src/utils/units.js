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
// // Strings pass through as-is
// toREM('16px')  // "16px"
// toREM('1rem')  // "1rem"
// toREM('50%')   // "50%"
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
 * @param {number|string} value - Value to convert
 * @returns {string} Converted value (e.g. "1rem", "16px", "50%")
 * @example
 * toREM(16)     // "1rem"
 * toREM(8)      // "0.5rem"
 * toREM('16px') // "16px"
 * toREM('1rem') // "1rem"
 * toREM('50%')  // "50%"
 */
export const toREM = (value) => {
  if (value === undefined || value === null) return undefined;

  // If it is a number, convert to rem
  if (typeof value === "number") {
    return `${value / BASE_FONT_SIZE}rem`;
  }

  // If it is a string, return it as-is
  if (typeof value === "string") {
    return value;
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
