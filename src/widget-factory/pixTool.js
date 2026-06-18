/**
 * PX TOOL - Converts numbers to PX
 */

/**
 * Converts a number to PX
 * @param {number} value - Number to convert
 * @returns {string} - Value in PX
 *
 * @example
 * toPX(16) → '16px'
 * toPX(24) → '24px'
 */
export const toPX = (value) => {
  if (typeof value !== "number") return value;
  return `${value}px`;
};

/**
 * Applies PX to a styles object
 * @param {Object} styles - Styles with numbers
 * @returns {Object} - Styles with PX
 *
 * @example
 * applyPX({ padding: 16, fontSize: 24, color: 'red' })
 * // → { padding: '16px', fontSize: '24px', color: 'red' }
 */
export const applyPX = (styles) => {
  const result = {};

  for (const [key, value] of Object.entries(styles)) {
    if (typeof value === "number") {
      result[key] = toPX(value);
    } else {
      result[key] = value;
    }
  }

  return result;
};
