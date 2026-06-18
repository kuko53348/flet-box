/**
 * STRING TOOL - Only keeps props that are strings
 */

/**
 * Filters and keeps only string values
 * @param {Object} styles - Styles object
 * @returns {Object} - Only string props
 *
 * @example
 * keepStrings({ padding: 16, color: 'red', display: 'flex', zIndex: 10 })
 * // → { color: 'red', display: 'flex' }
 */
export const keepStrings = (styles) => {
  const result = {};

  for (const [key, value] of Object.entries(styles)) {
    if (typeof value === "string") {
      result[key] = value;
    }
  }

  return result;
};

export default keepStrings;
