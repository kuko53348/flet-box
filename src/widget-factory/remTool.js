/**
 * REM TOOL - Only converts numbers to REM
 */

/**
 * Converts a number to REM
 * @param {number} value - Number to convert
 * @param {number} baseFontSize - Base root font size (default: 16)
 * @returns {string} - Value in REM
 */
export const toREM = (value, baseFontSize = 16) => {
  if (typeof value !== "number") return value;
  return `${value / baseFontSize}rem`;
};

/**
 * Applies REM to a styles object
 * @param {Object} styles - Styles with numbers
 * @param {number} baseFontSize - Base root font size (default: 16)
 * @returns {Object} - Styles with REM
 */
export const applyREM = (styles, baseFontSize = 16) => {
  const result = {};

  for (const [key, value] of Object.entries(styles)) {
    if (typeof value === "number") {
      result[key] = toREM(value, baseFontSize);
    } else {
      result[key] = value;
    }
  }

  return result;
};