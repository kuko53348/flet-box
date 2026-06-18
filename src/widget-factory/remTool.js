/**
 * REM TOOL - Only converts numbers to REM
 */

/**
 * Converts a number to REM
 * @param {number} value - Number to convert
 * @returns {string} - Value in REM
 *
 * @example
 * toREM(16) → '1rem'
 * toREM(24) → '1.5rem'
 */
export const toREM = (value) => {
  if (typeof value !== "number") return value;
  return `${value / 16}rem`;
};

/**
 * Applies REM to a styles object
 * @param {Object} styles - Styles with numbers
 * @returns {Object} - Styles with REM
 *
 * @example
 * applyREM({ padding: 16, fontSize: 24, color: 'red' })
 * // → { padding: '1rem', fontSize: '1.5rem', color: 'red' }
 */
export const applyREM = (styles) => {
  const result = {};

  for (const [key, value] of Object.entries(styles)) {
    if (typeof value === "number") {
      result[key] = toREM(value);
    } else {
      result[key] = value;
    }
  }

  return result;
};
