// tools/transition.js

/**
 * Generates a CSS `transition` shorthand string from a single options object or
 * an array of options objects.
 *
 * Each options object can specify:
 * - `property` — CSS property to animate (default: `"all"`).
 * - `duration` — Duration in seconds (default: `0.3`).
 * - `timing` — Timing function (default: `"ease"`).
 * - `delay` — Delay in seconds before the transition starts (default: `0`).
 *
 * When an array is passed, each item is converted individually and the results
 * are joined with `", "` to produce a multi-transition value.
 *
 * @param {Object|Array<Object>} options - Transition options or an array of them.
 * @param {string} [options.property="all"] - CSS property to animate.
 * @param {number} [options.duration=0.3] - Transition duration in seconds.
 * @param {string} [options.timing="ease"] - CSS timing function.
 * @param {number} [options.delay=0] - Delay before the transition starts, in seconds.
 * @returns {string} CSS transition value.
 *
 * @example
 * transition({ property: 'all', duration: 0.3, timing: 'ease', delay: 0.1 })
 * // "all 0.3s ease 0.1s"
 *
 * @example
 * transition([
 *   { property: 'opacity', duration: 0.2 },
 *   { property: 'transform', duration: 0.3, timing: 'ease-out' }
 * ])
 * // "opacity 0.2s ease 0s, transform 0.3s ease-out 0s"
 */
export const transition = (options) => {
  // Handle array of transitions — convert each and join
  if (Array.isArray(options)) {
    return options.map((opt) => transition(opt)).join(", ");
  }

  const property = options.property || "all";
  const duration = options.duration || 0.3;
  const timing = options.timing || "ease";
  const delay = options.delay || 0;

  return `${property} ${duration}s ${timing} ${delay}s`;
};

export default transition;
