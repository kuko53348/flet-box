// tools/animation.js

/**
 * Generate CSS animation string
 * @param {string|Object} name - Animation name or options object
 * @param {number} duration - Duration in seconds
 * @param {string} timing - Timing function
 * @param {string} iteration - Iteration count
 * @returns {string} CSS animation value
 *
 * @example
 * animation('fadeIn', 0.5, 'ease-in-out', 'infinite')
 * // "fadeIn 0.5s ease-in-out infinite"
 *
 * @example
 * animation({ name: 'slideIn', duration: 0.3, timing: 'ease', delay: 0.1, fillMode: 'forwards' })
 * // "slideIn 0.3s ease 0.1s forwards"
 */
export const animation = (
  name,
  duration = 0.3,
  timing = "ease",
  iteration = "1",
) => {
  if (typeof name === "object") {
    const n = name.name;
    const d = name.duration ?? 0.3;
    const t = name.timing ?? "ease";
    const dl = name.delay ?? 0;
    const i = name.iteration ?? "1";
    const dir = name.direction ?? "normal";
    const fill = name.fillMode ?? "none";

    let result = `${n} ${d}s ${t} ${dl}s ${i} ${dir}`;
    if (fill !== "none") result += ` ${fill}`;
    return result;
  }

  return `${name} ${duration}s ${timing} ${iteration}`;
};

export default animation;
