// tools/array.js

/**
 * Shuffle an array (Fisher-Yates)
 * @param {Array} arr - Input array
 * @returns {Array} New shuffled array
 * @example shuffle([1,2,3,4,5]) // [3,1,5,2,4]
 */
export const shuffle = (arr) => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Reverse an array
 * @param {Array} arr - Input array
 * @returns {Array} New reversed array
 * @example reverse([1,2,3,4]) // [4,3,2,1]
 */
export const reverse = (arr) => {
  return [...arr].reverse();
};

/**
 * Sort array by key or custom function
 * @param {Array} arr - Input array
 * @param {string|Function} by - Key to sort by or sort function
 * @param {string} order - 'asc' or 'desc' (default: 'asc')
 * @returns {Array} New sorted array
 * @example sort(users, 'name')
 * @example sort(users, (a,b) => a.age - b.age)
 */
export const sort = (arr, by, order = "asc") => {
  const result = [...arr];

  if (typeof by === "function") {
    result.sort(by);
  } else if (typeof by === "string") {
    result.sort((a, b) => {
      const aVal = a[by];
      const bVal = b[by];
      if (typeof aVal === "number") {
        return order === "asc" ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return order === "asc" ? cmp : -cmp;
    });
  } else {
    result.sort();
  }

  return order === "desc" && typeof by !== "function"
    ? result.reverse()
    : result;
};

/**
 * Get unique values from array
 * @param {Array} arr - Input array
 * @param {string} key - Optional key for objects
 * @returns {Array} Array with unique values
 */
export const unique = (arr, key = null) => {
  if (key) {
    const seen = new Set();
    return arr.filter((item) => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }
  return [...new Set(arr)];
};

/**
 * Chunk array into smaller arrays
 * @param {Array} arr - Input array
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 * @example chunk([1,2,3,4,5], 2) // [[1,2], [3,4], [5]]
 */
export const chunk = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

export default { shuffle, reverse, sort, unique, chunk };
