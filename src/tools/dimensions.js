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

// Escuchar cambios de tamaño
const listeners = [];

const handleResize = () => {
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;

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

// Export directo
export const width = dimensions.width;
export const height = dimensions.height;

export default dimensions;
