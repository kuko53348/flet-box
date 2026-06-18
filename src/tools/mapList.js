// tools/mapList.js

/**
 * Map an array to widgets or components
 * @param {Array|number|Object} list - Source array, number (length), or object
 * @param {Function} fn - Mapping function (item, index) => widget
 * @returns {Array} Array of widgets
 *
 * @example
 * // Map array to widgets
 * mapList(users, (user, i) => Text({ text: user.name }))
 *
 * @example
 * // Generate N widgets (number)
 * mapList(5, (_, i) => Skeleton({ variant: 'text' }))
 *
 * @example
 * // Map object values
 * mapList({ a: 1, b: 2, c: 3 }, (value, key) => Text({ text: `${key}: ${value}` }))
 */
export const mapList = (list, fn) => {
  // Handle number (create array of that length)
  if (typeof list === "number") {
    const arr = [];
    for (let i = 0; i < list; i++) {
      arr.push(fn(null, i));
    }
    return arr;
  }

  // Handle array
  if (Array.isArray(list)) {
    return list.map((item, index) => fn(item, index));
  }

  // Handle object (iterate over entries)
  if (typeof list === "object" && list !== null) {
    return Object.entries(list).map(([key, value], index) =>
      fn(value, key, index),
    );
  }

  return [];
};

/**
 * Repeat same widget N times
 * @param {number} count - Number of repetitions
 * @param {Function|Widget} widget - Widget or function that returns widget
 * @returns {Array} Array of widgets
 *
 * @example
 * repeat(3, Button({ text: 'Click' }))
 * repeat(5, (i) => Text({ text: `Item ${i}` }))
 */
export const repeat = (count, widget) => {
  const result = [];
  for (let i = 0; i < count; i++) {
    if (typeof widget === "function") {
      result.push(widget(i));
    } else {
      result.push(widget);
    }
  }
  return result;
};

/**
 * Generate a range of numbers
 * @param {number} start - Start value
 * @param {number} end - End value (exclusive)
 * @param {number} step - Step value (default: 1)
 * @returns {Array} Array of numbers
 *
 * @example
 * range(5)        // [0, 1, 2, 3, 4]
 * range(1, 5)     // [1, 2, 3, 4]
 * range(0, 10, 2) // [0, 2, 4, 6, 8]
 */
export const range = (start, end, step = 1) => {
  const result = [];
  const actualStart = end === undefined ? 0 : start;
  const actualEnd = end === undefined ? start : end;

  for (let i = actualStart; i < actualEnd; i += step) {
    result.push(i);
  }
  return result;
};

export default { mapList, repeat, range };
