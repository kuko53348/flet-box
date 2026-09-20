// tools/mapList.js

/**
 * Maps an array, a numeric length, or a plain object to an array of widgets or
 * any other value produced by the mapping function.
 *
 * - **Array**: iterates with `(item, index)`.
 * - **Number**: treats the value as an array length and iterates with `(null, index)`.
 * - **Object**: iterates over `Object.entries` with `(value, key, index)`.
 *
 * @param {Array|number|Object} list - Source collection.
 * @param {Function} fn - Mapping function. Signature depends on source type:
 *   - Array: `(item, index) => widget`
 *   - Number: `(null, index) => widget`
 *   - Object: `(value, key, index) => widget`
 * @returns {Array} Array of mapped values.
 *
 * @example
 * // Map array to widgets
 * mapList(users, (user, i) => Text({ text: user.name }))
 *
 * @example
 * // Generate N widgets from a number
 * mapList(5, (_, i) => Skeleton({ variant: 'text' }))
 *
 * @example
 * // Map object values
 * mapList({ a: 1, b: 2, c: 3 }, (value, key) => Text({ text: `${key}: ${value}` }))
 */
export const mapList = (list, fn) => {
  // Handle number — create a virtual array of that length
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

  // Handle plain object — iterate over its entries
  if (typeof list === "object" && list !== null) {
    return Object.entries(list).map(([key, value], index) =>
      fn(value, key, index),
    );
  }

  return [];
};

/**
 * Repeats a widget (or calls a factory function) `count` times and returns the
 * resulting array.
 *
 * @param {number} count - Number of repetitions.
 * @param {Function|*} widget - Widget instance to repeat, or a `(index) => widget`
 *   factory function called on each iteration.
 * @returns {Array} Array of widgets.
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
 * Generates an array of numbers in the half-open interval `[start, end)` with
 * a configurable step. Mirrors Python's `range()`.
 *
 * When called with a single argument, the range starts at `0`.
 *
 * @param {number} start - Start value (inclusive), or the exclusive end when `end` is omitted.
 * @param {number} [end] - End value (exclusive). If omitted, `start` becomes the end and `0` is used as start.
 * @param {number} [step=1] - Increment between values.
 * @returns {number[]} Array of numbers.
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
