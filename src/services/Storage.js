// src/modules/FletBox/services/Storage.js

/**
 * Storage - Local DOM storage (synchronous, similar to localStorage)
 *
 * @description Uses the browser's localStorage to persist data.
 * Supports strings, objects, arrays, numbers, booleans.
 *
 * @example
 * import { saveData, getData, deleteData, clearAllData, getAllKeys, getAllData } from './services/Storage.js';
 *
 * // Save
 * saveData('user', { name: 'Juan', age: 30 });
 *
 * // Read
 * const user = getData('user');
 *
 * // Delete
 * deleteData('user');
 *
 * // Clear everything
 * clearAllData();
 *
 * // Get all keys
 * const keys = getAllKeys();
 *
 * // Get all data
 * const allData = getAllData();
 */

// ========== CREATE / UPDATE ==========
/**
 * Saves or updates a value in localStorage
 * @param {string} key - Data key
 * @param {any} value - Value to save (string, object, array, number, boolean)
 * @returns {boolean} - true if saved successfully
 */
export const saveData = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error("Error saving data:", error);
    return false;
  }
};

// ========== READ ==========
/**
 * Gets a value from localStorage
 * @param {string} key - Data key
 * @returns {any} - The saved value or null if it does not exist
 */
export const getData = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Error reading data:", error);
    return null;
  }
};

// ========== READ (direct synchronous) ==========
/**
 * Gets a value from localStorage synchronously (alias of getData)
 * @param {string} key - Data key
 * @returns {any} - The saved value or null if it does not exist
 */
export const getDataSync = (key) => {
  return getData(key);
};

// ========== UPDATE ==========
/**
 * Updates an existing value (only if it exists)
 * @param {string} key - Data key
 * @param {any} newValue - New value
 * @returns {boolean} - true if updated, false if it did not exist
 */
export const updateData = (key, newValue) => {
  try {
    const exists = localStorage.getItem(key);
    if (exists === null) return false;

    localStorage.setItem(key, JSON.stringify(newValue));
    return true;
  } catch (error) {
    console.error("Error updating data:", error);
    return false;
  }
};

// ========== DELETE ==========
/**
 * Deletes a value from localStorage
 * @param {string} key - Data key
 * @returns {boolean} - true if removed successfully
 */
export const deleteData = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error("Error deleting data:", error);
    return false;
  }
};

// ========== DELETE ALL ==========
/**
 * Deletes ALL data from localStorage
 * @returns {boolean} - true if cleared successfully
 */
export const clearAllData = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing data:", error);
    return false;
  }
};

// ========== UTILS ==========
/**
 * Checks whether a key exists in localStorage
 * @param {string} key - Key to check
 * @returns {boolean} - true if it exists
 */
export const hasData = (key) => {
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error("Error checking data:", error);
    return false;
  }
};

/**
 * Gets all keys saved in localStorage
 * @returns {string[]} - Array of keys
 */
export const getAllKeys = () => {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  } catch (error) {
    console.error("Error getting all keys:", error);
    return [];
  }
};

/**
 * Gets all data saved in localStorage
 * @returns {Object} - Object with all keys and values
 */
export const getAllData = () => {
  try {
    const result = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          result[key] = value !== null ? JSON.parse(value) : null;
        } catch {
          result[key] = localStorage.getItem(key);
        }
      }
    }
    return result;
  } catch (error) {
    console.error("Error getting all data:", error);
    return {};
  }
};

/**
 * Gets the approximate size used in localStorage (in bytes)
 * @returns {number} - Size in bytes
 */
export const getStorageSize = () => {
  try {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        total += (key.length + (value?.length || 0)) * 2;
      }
    }
    return total;
  } catch (error) {
    console.error("Error getting storage size:", error);
    return 0;
  }
};

/**
 * Deletes data by key prefix
 * @param {string} prefix - Prefix of the keys to delete
 * @returns {number} - Number of deleted items
 */
export const deleteDataByPrefix = (prefix) => {
  try {
    let deleted = 0;
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      deleted++;
    });

    return deleted;
  } catch (error) {
    console.error("Error deleting data by prefix:", error);
    return 0;
  }
};

/**
 * Deletes data by key suffix
 * @param {string} suffix - Suffix of the keys to delete
 * @returns {number} - Number of deleted items
 */
export const deleteDataBySuffix = (suffix) => {
  try {
    let deleted = 0;
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.endsWith(suffix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      deleted++;
    });

    return deleted;
  } catch (error) {
    console.error("Error deleting data by suffix:", error);
    return 0;
  }
};

/**
 * Gets the total number of items in localStorage
 * @returns {number} - Number of items
 */
export const getItemCount = () => {
  try {
    return localStorage.length;
  } catch (error) {
    console.error("Error getting item count:", error);
    return 0;
  }
};

/**
 * Checks whether localStorage is available
 * @returns {boolean} - true if available
 */
export const isStorageAvailable = () => {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

// ========== EXPORT DEFAULT ==========
const Storage = {
  saveData,
  getData,
  getDataSync,
  updateData,
  deleteData,
  clearAllData,
  hasData,
  getAllKeys,
  getAllData,
  getStorageSize,
  deleteDataByPrefix,
  deleteDataBySuffix,
  getItemCount,
  isStorageAvailable,
};

export default Storage;
