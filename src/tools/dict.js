// src/tools/dict.js
// Python-like dictionary utilities

export class Dict {
  constructor(obj = {}) {
    this._data = { ...obj };
  }

  // Get value with default (like Python's .get())
  get(key, defaultValue = null) {
    return this._data[key] !== undefined ? this._data[key] : defaultValue;
  }

  // Set value (like Python's assignment)
  set(key, value) {
    this._data[key] = value;
    return this;
  }

  // Check if key exists (like Python's 'in')
  has(key) {
    return key in this._data;
  }

  // Get all keys (like Python's .keys())
  keys() {
    return Object.keys(this._data);
  }

  // Get all values (like Python's .values())
  values() {
    return Object.values(this._data);
  }

  // Get all items (like Python's .items())
  items() {
    return Object.entries(this._data);
  }

  // Delete key (like Python's del)
  delete(key) {
    delete this._data[key];
    return this;
  }

  // Get length (like Python's len())
  get size() {
    return Object.keys(this._data).length;
  }

  // Clear all (like Python's .clear())
  clear() {
    this._data = {};
    return this;
  }

  // Copy (like Python's .copy())
  copy() {
    return new Dict({ ...this._data });
  }

  // Update with another object (like Python's .update())
  update(other) {
    Object.assign(this._data, other instanceof Dict ? other._data : other);
    return this;
  }

  // Convert to plain object
  toObject() {
    return { ...this._data };
  }

  // Convert to JSON string
  toJSON() {
    return JSON.stringify(this._data);
  }

  // String representation (like Python's __str__)
  toString() {
    return `Dict(${JSON.stringify(this._data)})`;
  }

  // Get nested value with dot notation
  getNested(path, defaultValue = null) {
    const keys = path.split(".");
    let result = this._data;
    for (const key of keys) {
      if (result?.[key] === undefined) return defaultValue;
      result = result[key];
    }
    return result;
  }

  // Set nested value with dot notation
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

  // ForEach iteration
  forEach(callback) {
    Object.entries(this._data).forEach(([key, value]) => callback(value, key));
  }

  // Map transformation
  map(callback) {
    return Object.entries(this._data).map(([key, value]) =>
      callback(value, key),
    );
  }

  // Filter (returns new Dict)
  filter(callback) {
    const result = {};
    Object.entries(this._data).forEach(([key, value]) => {
      if (callback(value, key)) result[key] = value;
    });
    return new Dict(result);
  }
}

// Factory function (like Python's dict())
export const dict = (obj = {}) => {
  return new Dict(obj);
};

// Create empty dict
export const emptyDict = () => new Dict({});

// Create from JSON string
export const fromJSON = (jsonStr) => {
  try {
    return new Dict(JSON.parse(jsonStr));
  } catch {
    return new Dict({});
  }
};

// Create from entries array (like Python's dict([(key, value), ...]))
export const fromEntries = (entries) => {
  return new Dict(Object.fromEntries(entries));
};

export default dict;
