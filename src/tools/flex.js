// tools/flex.js

/**
 * Generate CSS flex string (shorthand)
 * @param {number|Object} grow - Flex grow value or options object
 * @param {number} shrink - Flex shrink value
 * @param {string} basis - Flex basis value
 * @returns {string} CSS flex value
 *
 * @example
 * flex(1)                    // "1 1 0%"
 * flex(1, 0, 'auto')        // "1 0 auto"
 * flex({ grow: 1, shrink: 0, basis: '200px' })
 * // "1 0 200px"
 */
export const flex = (grow, shrink = 1, basis = "0%") => {
  if (typeof grow === "object") {
    const g = grow.grow ?? 1;
    const s = grow.shrink ?? 1;
    const b = grow.basis ?? "0%";
    return `${g} ${s} ${b}`;
  }
  return `${grow} ${shrink} ${basis}`;
};

export default flex;
