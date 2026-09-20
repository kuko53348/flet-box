// src/modules/FletBox/core/dimensions.js

/**
 * Dimensions - Provides the current window dimensions and a resize listener API.
 * Similar in spirit to React Native's `Dimensions` module.
 *
 * @example
 * import { width, height } from './core/dimensions.js';
 * console.log(`Screen: ${width} x ${height}`);
 *
 * @example
 * import { dimensions } from './core/dimensions.js';
 * const remove = dimensions.addListener(({ width, height }) => {
 *   console.log(`Window resized: ${width} x ${height}`);
 * });
 * // Call remove() to stop listening.
 */

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

// Live named exports — ES-module live bindings: importers of { width, height }
// always read the current value, kept in sync on resize.
export let width = windowWidth;
export let height = windowHeight;

// Internal list of resize listener callbacks
const listeners = [];

/**
 * Internal resize handler. Syncs the cached dimensions and notifies all
 * registered listeners whenever the browser window is resized.
 *
 * @returns {void}
 */
const handleResize = () => {
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  width = windowWidth;
  height = windowHeight;

  // Notify all registered listeners with the updated dimensions
  listeners.forEach((listener) => {
    listener({ width: windowWidth, height: windowHeight });
  });
};

window.addEventListener("resize", handleResize);

/**
 * Dimensions object — provides getter properties and listener management.
 * Prefer the named `width` / `height` exports for simple reads; use this
 * object when you need the full API.
 */
export const dimensions = {
  /** Current window width in pixels. @type {number} */
  get width() {
    return windowWidth;
  },

  /** Current window height in pixels. @type {number} */
  get height() {
    return windowHeight;
  },

  /**
   * Returns the current window dimensions as an object.
   *
   * @returns {{ width: number, height: number }}
   */
  get: () => ({ width: windowWidth, height: windowHeight }),

  /**
   * Returns the current window width in pixels.
   *
   * @returns {number}
   */
  getWidth: () => windowWidth,

  /**
   * Returns the current window height in pixels.
   *
   * @returns {number}
   */
  getHeight: () => windowHeight,

  /**
   * Registers a callback that is called whenever the window is resized.
   *
   * @param {Function} callback - Receives `{ width: number, height: number }` on each resize.
   * @returns {Function} A cleanup function that removes this listener when called.
   *
   * @example
   * const remove = dimensions.addListener(({ width }) => console.log(width));
   * // Later:
   * remove();
   */
  addListener: (callback) => {
    listeners.push(callback);
    return () => {
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    };
  },

  /**
   * Removes a previously registered resize listener.
   *
   * @param {Function} callback - The same function reference passed to `addListener`.
   * @returns {void}
   */
  removeListener: (callback) => {
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  },
};

export default dimensions;
