// tools/transition.js

/**
 * Generate CSS transition string
 * @param {Object|Array} options - Transition options or array of transitions
 * @returns {string} CSS transition value
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
    // Handle array of transitions
    if (Array.isArray(options)) {
        return options.map(opt => transition(opt)).join(', ');
    }
    
    const property = options.property || 'all';
    const duration = options.duration || 0.3;
    const timing = options.timing || 'ease';
    const delay = options.delay || 0;
    
    return `${property} ${duration}s ${timing} ${delay}s`;
};

export default transition;
