// src/tools/dict.js
// Python-like dictionary utilities

/**
 * A wrapper around a plain JavaScript object that exposes a Python-inspired
 * dictionary API (`.get()`, `.keys()`, `.values()`, `.items()`, etc.).
 */
export class Dict {
  /**
   * @param {Object} [obj={}] - Initial key-value pairs.
   */
  constructor(obj = {}) {
    this._data = { ...obj };
  }

  /**
   * Returns the value for `key`, or `defaultValue` if the key is absent.
   * Mirrors Python's `dict.get(key, default)`.
   *
   * @param {string} key - Key to look up.
   * @param {*} [defaultValue=null] - Fallback value when the key is missing.
   * @returns {*} The stored value or `defaultValue`.
   */
  get(key, defaultValue = null) {
    return this._data[key] !== undefined ? this._data[key] : defaultValue;
  }

  /**
   * Sets a key to a value and returns `this` for chaining.
   * Mirrors Python's assignment `d[key] = value`.
   *
   * @param {string} key - Key to set.
   * @param {*} value - Value to store.
   * @returns {Dict} This instance.
   */
  set(key, value) {
    this._data[key] = value;
    return this;
  }

  /**
   * Returns `true` if `key` exists in the dictionary.
   * Mirrors Python's `key in d`.
   *
   * @param {string} key - Key to check.
   * @returns {boolean}
   */
  has(key) {
    return key in this._data;
  }

  /**
   * Returns an array of all keys in the dictionary.
   * Mirrors Python's `dict.keys()`.
   *
   * @returns {string[]}
   */
  keys() {
    return Object.keys(this._data);
  }

  /**
   * Returns an array of all values in the dictionary.
   * Mirrors Python's `dict.values()`.
   *
   * @returns {*[]}
   */
  values() {
    return Object.values(this._data);
  }

  /**
   * Returns an array of `[key, value]` pairs.
   * Mirrors Python's `dict.items()`.
   *
   * @returns {Array<[string, *]>}
   */
  items() {
    return Object.entries(this._data);
  }

  /**
   * Deletes a key from the dictionary and returns `this` for chaining.
   * Mirrors Python's `del d[key]`.
   *
   * @param {string} key - Key to remove.
   * @returns {Dict} This instance.
   */
  delete(key) {
    delete this._data[key];
    return this;
  }

  /**
   * The number of entries in the dictionary.
   * Mirrors Python's `len(d)`.
   *
   * @type {number}
   */
  get size() {
    return Object.keys(this._data).length;
  }

  /**
   * Removes all entries and returns `this` for chaining.
   * Mirrors Python's `dict.clear()`.
   *
   * @returns {Dict} This instance.
   */
  clear() {
    this._data = {};
    return this;
  }

  /**
   * Returns a shallow copy of this dictionary as a new `Dict` instance.
   * Mirrors Python's `dict.copy()`.
   *
   * @returns {Dict} A new `Dict` with the same entries.
   */
  copy() {
    return new Dict({ ...this._data });
  }

  /**
   * Merges another object or `Dict` into this dictionary, overwriting existing keys.
   * Mirrors Python's `dict.update(other)`.
   *
   * @param {Object|Dict} other - Source of additional key-value pairs.
   * @returns {Dict} This instance.
   */
  update(other) {
    Object.assign(this._data, other instanceof Dict ? other._data : other);
    return this;
  }

  /**
   * Returns the internal data as a plain JavaScript object.
   *
   * @returns {Object}
   */
  toObject() {
    return { ...this._data };
  }

  /**
   * Serializes the dictionary to a JSON string.
   *
   * @returns {string}
   */
  toJSON() {
    return JSON.stringify(this._data);
  }

  /**
   * Returns a debug-friendly string representation.
   * Mirrors Python's `__str__`.
   *
   * @returns {string} e.g. `Dict({"key":"value"})`
   */
  toString() {
    return `Dict(${JSON.stringify(this._data)})`;
  }

  /**
   * Reads a nested value using dot-notation path, returning `defaultValue` if any
   * segment along the path is absent.
   *
   * @param {string} path - Dot-separated key path, e.g. `"user.address.city"`.
   * @param {*} [defaultValue=null] - Fallback when the path does not exist.
   * @returns {*} The nested value or `defaultValue`.
   *
   * @example
   * dict.getNested("user.address.city", "Unknown")
   */
  getNested(path, defaultValue = null) {
    const keys = path.split(".");
    let result = this._data;
    for (const key of keys) {
      if (result?.[key] === undefined) return defaultValue;
      result = result[key];
    }
    return result;
  }

  /**
   * Sets a nested value at the given dot-notation path, creating intermediate
   * objects as needed. Returns `this` for chaining.
   *
   * @param {string} path - Dot-separated key path, e.g. `"user.address.city"`.
   * @param {*} value - Value to set at the path.
   * @returns {Dict} This instance.
   *
   * @example
   * dict.setNested("user.address.city", "New York")
   */
  setNested(path, value) {
    const keys = path.split(".");
    const lastKey = keys.pop();
    let target = this._data;
    for (const key of keys) {
      if (target[key] === undefined) target[key] = {};
      target = target[key];
    }
    target[lastKey] = value;
    return this;
  }

  /**
   * Iterates over all entries, calling `callback(value, key)` for each.
   *
   * @param {Function} callback - Called with `(value, key)` for each entry.
   * @returns {void}
   */
  forEach(callback) {
    Object.entries(this._data).forEach(([key, value]) => callback(value, key));
  }

  /**
   * Maps over all entries and returns an array of the results.
   *
   * @param {Function} callback - Called with `(value, key)` for each entry; return the mapped value.
   * @returns {Array<*>}
   */
  map(callback) {
    return Object.entries(this._data).map(([key, value]) =>
      callback(value, key),
    );
  }

  /**
   * Returns a new `Dict` containing only entries for which `callback` returns truthy.
   *
   * @param {Function} callback - Predicate called with `(value, key)`.
   * @returns {Dict} Filtered dictionary.
   */
  filter(callback) {
    const result = {};
    Object.entries(this._data).forEach(([key, value]) => {
      if (callback(value, key)) result[key] = value;
    });
    return new Dict(result);
  }
}

/**
 * Factory function — creates a new `Dict` instance from a plain object.
 * Mirrors Python's `dict()` constructor.
 *
 * @param {Object} [obj={}] - Initial key-value pairs.
 * @returns {Dict}
 *
 * @example
 * const d = dict({ name: "Alice", age: 30 });
 * d.get("name"); // "Alice"
 */
export const dict = (obj = {}) => {
  return new Dict(obj);
};

/**
 * Creates and returns an empty `Dict`.
 *
 * @returns {Dict}
 */
export const emptyDict = () => new Dict({});

/**
 * Parses a JSON string and wraps the result in a `Dict`.
 * Returns an empty `Dict` on parse failure.
 *
 * @param {string} jsonStr - JSON-encoded object string.
 * @returns {Dict}
 */
export const fromJSON = (jsonStr) => {
  try {
    return new Dict(JSON.parse(jsonStr));
  } catch {
    return new Dict({});
  }
};

/**
 * Creates a `Dict` from an array of `[key, value]` pairs.
 * Mirrors Python's `dict([(key, value), ...])`.
 *
 * @param {Array<[string, *]>} entries - Array of key-value pairs.
 * @returns {Dict}
 *
 * @example
 * fromEntries([["a", 1], ["b", 2]]) // Dict { a: 1, b: 2 }
 */
export const fromEntries = (entries) => {
  return new Dict(Object.fromEntries(entries));
};

export default dict;
