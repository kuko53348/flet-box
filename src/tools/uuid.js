// tools/uuid.js

/**
 * Generate a UUID v4
 * @returns {string} UUID
 */
export const uuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Generate a short ID (8 characters)
 * @returns {string} Short ID
 */
export const shortId = () => {
  return Math.random().toString(36).substring(2, 10);
};

/**
 * Generate a numeric ID
 * @param {number} length - Length of the ID
 * @returns {string} Numeric ID
 */
export const numericId = (length = 6) => {
  return Math.random()
    .toString()
    .slice(2, 2 + length);
};

/**
 * Generate a timestamp-based ID
 * @returns {string} Timestamp ID
 */
export const timestampId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
};

export default { uuid, shortId, numericId, timestampId };
