// src/components/flet-box/services/RamStore.js

/**
 * RamStore - In-memory storage (live memory) with reactivity
 *
 * @description
 * Same API as Storage.js and Session.js, but keeps data in RAM.
 * Data is lost when the page is reloaded.
 * Includes subscribe() for reactivity between widgets.
 */

// ========== INTERNAL STATE (in RAM) ==========
const ramStore = new Map();

// ========== SUBSCRIBERS (for reactivity) ==========
let subscribers = [];

// ========== INTERNAL FUNCTION TO NOTIFY ==========
const notifySubscribers = (key, newValue, oldValue) => {
  subscribers.forEach((callback) => {
    try {
      callback(key, newValue, oldValue);
    } catch (e) {
      console.error("[RamStore] Subscriber error:", e);
    }
  });
};

// ========== CREATE / UPDATE ==========

/**
 * Saves or updates a value in RAM
 * @param {string} key - Data key
 * @param {any} value - Value to save
 * @returns {boolean}
 */
export const saveRam = (key, value) => {
  try {
    const oldValue = ramStore.get(key);
    const result = ramStore.set(key, value);
    notifySubscribers(key, value, oldValue);
    // console.log(`[RamStore] saved: ${key} =`, value);
    return true;
  } catch (error) {
    console.error("Error saving to RAM:", error);
    return false;
  }
};

// ========== READ ==========

/**
 * Gets a value from RAM
 * @param {string} key - Data key
 * @returns {any}
 */
export const getRam = (key) => {
  try {
    return ramStore.has(key) ? ramStore.get(key) : null;
  } catch (error) {
    console.error("Error reading from RAM:", error);
    return null;
  }
};

/**
 * Gets all data from RAM
 * @returns {Object}
 */
export const getAllRam = () => {
  try {
    const result = {};
    for (const [key, value] of ramStore.entries()) {
      result[key] = value;
    }
    return result;
  } catch (error) {
    console.error("Error getting all RAM data:", error);
    return {};
  }
};

/**
 * Gets all keys from RAM
 * @returns {string[]}
 */
export const getAllRamKeys = () => {
  try {
    return Array.from(ramStore.keys());
  } catch (error) {
    console.error("Error getting RAM keys:", error);
    return [];
  }
};

/**
 * Checks whether a key exists in RAM
 * @param {string} key
 * @returns {boolean}
 */
export const hasRam = (key) => {
  return ramStore.has(key);
};

// ========== UPDATE ==========

/**
 * Updates an existing value (only if it exists)
 * @param {string} key
 * @param {any} newValue
 * @returns {boolean}
 */
export const updateRam = (key, newValue) => {
  try {
    if (!ramStore.has(key)) return false;
    const oldValue = ramStore.get(key);
    ramStore.set(key, newValue);
    notifySubscribers(key, newValue, oldValue);
    return true;
  } catch (error) {
    console.error("Error updating RAM:", error);
    return false;
  }
};

// ========== DELETE ==========

/**
 * Deletes a value from RAM
 * @param {string} key
 * @returns {boolean}
 */
export const deleteRam = (key) => {
  try {
    const oldValue = ramStore.get(key);
    const deleted = ramStore.delete(key);
    if (deleted) {
      notifySubscribers(key, null, oldValue);
    }
    return deleted;
  } catch (error) {
    console.error("Error deleting from RAM:", error);
    return false;
  }
};

/**
 * Deletes ALL data from RAM
 * @returns {boolean}
 */
export const clearAllRam = () => {
  try {
    ramStore.clear();
    notifySubscribers(null, null, null);
    return true;
  } catch (error) {
    console.error("Error clearing RAM:", error);
    return false;
  }
};

// ========== SUBSCRIBE (REACTIVITY) ==========

/**
 * Subscribes a callback to RAM changes
 * @param {Function} callback - (key, newValue, oldValue) => void
 * @returns {Function} - unsubscribe function
 */
export const subscribeRam = (callback) => {
  subscribers.push(callback);
  // console.log(`[RamStore] Subscriber added. Total: ${subscribers.length}`);

  // Return a function to unsubscribe
  return () => {
    subscribers = subscribers.filter((s) => s !== callback);
    console.log(`[RamStore] Subscriber removed. Total: ${subscribers.length}`);
  };
};

// ========== UTILS ==========

/**
 * Gets the number of items in RAM
 * @returns {number}
 */
export const getRamItemCount = () => {
  return ramStore.size;
};

/**
 * Checks whether RamStore is available
 * @returns {boolean}
 */
export const isRamAvailable = () => {
  return true;
};

// ========== EXPORT DEFAULT ==========
const RamStore = {
  saveRam,
  getRam,
  getAllRam,
  getAllRamKeys,
  hasRam,
  updateRam,
  deleteRam,
  clearAllRam,
  subscribeRam,
  getRamItemCount,
  isRamAvailable,
};

export default RamStore;
