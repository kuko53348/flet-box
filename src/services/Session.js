// src/modules/FletBox/services/Session.js

/**
 * Session - Temporary DOM storage (synchronous, similar to sessionStorage)
 *
 * @description Uses the browser's sessionStorage to persist data only during the session.
 * Data is removed when the tab or browser is closed.
 * Supports strings, objects, arrays, numbers, booleans.
 *
 * @example
 * import { saveSession, getSession, deleteSession, clearAllSession, getAllSessionKeys, getAllSessionData } from './services/Session.js';
 *
 * // Save
 * saveSession('user', { name: 'Juan', age: 30 });
 *
 * // Read
 * const user = getSession('user');
 *
 * // Delete
 * deleteSession('user');
 *
 * // Clear everything
 * clearAllSession();
 *
 * // Get all keys
 * const keys = getAllSessionKeys();
 *
 * // Get all data
 * const allData = getAllSessionData();
 */

// ========== CREATE / UPDATE ==========
/**
 * Saves or updates a value in sessionStorage
 * @param {string} key - Data key
 * @param {any} value - Value to save (string, object, array, number, boolean)
 * @returns {boolean} - true if saved successfully
 */
export const saveSession = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    sessionStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error("Error saving session data:", error);
    return false;
  }
};

// ========== READ ==========
/**
 * Gets a value from sessionStorage
 * @param {string} key - Data key
 * @returns {any} - The saved value or null if it does not exist
 */
export const getSession = (key) => {
  try {
    const value = sessionStorage.getItem(key);
    return value !== null ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Error reading session data:", error);
    return null;
  }
};

// ========== READ (direct synchronous) ==========
/**
 * Gets a value from sessionStorage synchronously (alias of getSession)
 * @param {string} key - Data key
 * @returns {any} - The saved value or null if it does not exist
 */
export const getSessionSync = (key) => {
  return getSession(key);
};

// ========== UPDATE ==========
/**
 * Updates an existing value (only if it exists)
 * @param {string} key - Data key
 * @param {any} newValue - New value
 * @returns {boolean} - true if updated, false if it did not exist
 */
export const updateSession = (key, newValue) => {
  try {
    const exists = sessionStorage.getItem(key);
    if (exists === null) return false;

    sessionStorage.setItem(key, JSON.stringify(newValue));
    return true;
  } catch (error) {
    console.error("Error updating session data:", error);
    return false;
  }
};

// ========== DELETE ==========
/**
 * Deletes a value from sessionStorage
 * @param {string} key - Data key
 * @returns {boolean} - true if removed successfully
 */
export const deleteSession = (key) => {
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error("Error deleting session data:", error);
    return false;
  }
};

// ========== DELETE ALL ==========
/**
 * Deletes ALL data from sessionStorage
 * @returns {boolean} - true if cleared successfully
 */
export const clearAllSession = () => {
  try {
    sessionStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing session data:", error);
    return false;
  }
};

// ========== UTILS ==========
/**
 * Checks whether a key exists in sessionStorage
 * @param {string} key - Key to check
 * @returns {boolean} - true if it exists
 */
export const hasSession = (key) => {
  try {
    return sessionStorage.getItem(key) !== null;
  } catch (error) {
    console.error("Error checking session data:", error);
    return false;
  }
};

/**
 * Gets all keys saved in sessionStorage
 * @returns {string[]} - Array of keys
 */
export const getAllSessionKeys = () => {
  try {
    const keys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) keys.push(key);
    }
    return keys;
  } catch (error) {
    console.error("Error getting all session keys:", error);
    return [];
  }
};

/**
 * Gets all data saved in sessionStorage
 * @returns {Object} - Object with all keys and values
 */
export const getAllSessionData = () => {
  try {
    const result = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        try {
          const value = sessionStorage.getItem(key);
          result[key] = value !== null ? JSON.parse(value) : null;
        } catch {
          result[key] = sessionStorage.getItem(key);
        }
      }
    }
    return result;
  } catch (error) {
    console.error("Error getting all session data:", error);
    return {};
  }
};

/**
 * Gets the approximate size used in sessionStorage (in bytes)
 * @returns {number} - Size in bytes
 */
export const getSessionSize = () => {
  try {
    let total = 0;
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        total += (key.length + (value?.length || 0)) * 2;
      }
    }
    return total;
  } catch (error) {
    console.error("Error getting session size:", error);
    return 0;
  }
};

/**
 * Deletes data by key prefix
 * @param {string} prefix - Prefix of the keys to delete
 * @returns {number} - Number of deleted items
 */
export const deleteSessionByPrefix = (prefix) => {
  try {
    let deleted = 0;
    const keysToRemove = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      sessionStorage.removeItem(key);
      deleted++;
    });

    return deleted;
  } catch (error) {
    console.error("Error deleting session by prefix:", error);
    return 0;
  }
};

/**
 * Deletes data by key suffix
 * @param {string} suffix - Suffix of the keys to delete
 * @returns {number} - Number of deleted items
 */
export const deleteSessionBySuffix = (suffix) => {
  try {
    let deleted = 0;
    const keysToRemove = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.endsWith(suffix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      sessionStorage.removeItem(key);
      deleted++;
    });

    return deleted;
  } catch (error) {
    console.error("Error deleting session by suffix:", error);
    return 0;
  }
};

/**
 * Gets the total number of items in sessionStorage
 * @returns {number} - Number of items
 */
export const getSessionItemCount = () => {
  try {
    return sessionStorage.length;
  } catch (error) {
    console.error("Error getting session item count:", error);
    return 0;
  }
};

/**
 * Checks whether sessionStorage is available
 * @returns {boolean} - true if available
 */
export const isSessionAvailable = () => {
  try {
    const test = "__session_test__";
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

// ========== EXPORT DEFAULT ==========
const Session = {
  saveSession,
  getSession,
  getSessionSync,
  updateSession,
  deleteSession,
  clearAllSession,
  hasSession,
  getAllSessionKeys,
  getAllSessionData,
  getSessionSize,
  deleteSessionByPrefix,
  deleteSessionBySuffix,
  getSessionItemCount,
  isSessionAvailable,
};

export default Session;
