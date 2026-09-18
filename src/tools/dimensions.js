// src/modules/FletBox/core/dimensions.js

/**
 * Dimensions - Obtiene las dimensiones de la pantalla
 * Similar a Dimensions de React Native
 *
 * @example
 * import { width, height } from './core/dimensions.js';
 * console.log(`Pantalla: ${width} x ${height}`);
 *
 * // Con evento de resize
 * import { addDimensionsListener, removeDimensionsListener } from './core/dimensions.js';
 * addDimensionsListener(({ width, height }) => {
 *     console.log(`Pantalla redimensionada: ${width} x ${height}`);
 * });
 */

let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;

// Live named exports (ES-module live bindings: importers of { width, height }
// always read the current value, kept in sync on resize).
export let width = windowWidth;
export let height = windowHeight;

// Escuchar cambios de tamaño
const listeners = [];

const handleResize = () => {
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  width = windowWidth;
  height = windowHeight;

  // Notificar a todos los listeners
  listeners.forEach((listener) => {
    listener({ width: windowWidth, height: windowHeight });
  });
};

window.addEventListener("resize", handleResize);

// Objeto con métodos y propiedades
export const dimensions = {
  get width() {
    return windowWidth;
  },
  get height() {
    return windowHeight;
  },

  /**
   * Obtiene las dimensiones de la ventana
   * @returns {{ width: number, height: number }}
   */
  get: () => ({ width: windowWidth, height: windowHeight }),

  /**
   * Obtiene el ancho de la pantalla
   * @returns {number}
   */
  getWidth: () => windowWidth,

  /**
   * Obtiene el alto de la pantalla
   * @returns {number}
   */
  getHeight: () => windowHeight,

  /**
   * Agrega un listener para cambios de tamaño
   * @param {function} callback - Recibe { width, height }
   * @returns {function} Función para remover el listener
   */
  addListener: (callback) => {
    listeners.push(callback);
    return () => {
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    };
  },

  /**
   * Remueve un listener
   * @param {function} callback
   */
  removeListener: (callback) => {
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  },
};

// Export directo: `width` y `height` se declaran arriba como bindings vivos.

export default dimensions;
