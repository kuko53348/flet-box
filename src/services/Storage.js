// src/modules/FletBox/services/Storage.js

/**
 * Storage - Almacenamiento local para DOM (síncrono, similar a localStorage)
 *
 * @description Usa localStorage del navegador para persistir datos.
 * Soporta strings, objetos, arrays, números, booleanos.
 *
 * @example
 * import { saveData, getData, deleteData, clearAllData, getAllKeys, getAllData } from './services/Storage.js';
 *
 * // Guardar
 * saveData('user', { name: 'Juan', age: 30 });
 *
 * // Leer
 * const user = getData('user');
 *
 * // Eliminar
 * deleteData('user');
 *
 * // Limpiar todo
 * clearAllData();
 *
 * // Obtener todas las claves
 * const keys = getAllKeys();
 *
 * // Obtener todos los datos
 * const allData = getAllData();
 */

// ========== CREATE / UPDATE ==========
/**
 * Guarda o actualiza un dato en localStorage
 * @param {string} key - Clave del dato
 * @param {any} value - Valor a guardar (string, object, array, number, boolean)
 * @returns {boolean} - true si se guardó correctamente
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
 * Obtiene un dato de localStorage
 * @param {string} key - Clave del dato
 * @returns {any} - El valor guardado o null si no existe
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

// ========== READ (síncrono directo) ==========
/**
 * Obtiene un dato de localStorage de forma síncrona (alias de getData)
 * @param {string} key - Clave del dato
 * @returns {any} - El valor guardado o null si no existe
 */
export const getDataSync = (key) => {
  return getData(key);
};

// ========== UPDATE ==========
/**
 * Actualiza un dato existente (solo si existe)
 * @param {string} key - Clave del dato
 * @param {any} newValue - Nuevo valor
 * @returns {boolean} - true si se actualizó, false si no existía
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
 * Elimina un dato de localStorage
 * @param {string} key - Clave del dato
 * @returns {boolean} - true si se eliminó correctamente
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
 * Elimina TODOS los datos de localStorage
 * @returns {boolean} - true si se limpió correctamente
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
 * Verifica si existe una clave en localStorage
 * @param {string} key - Clave a verificar
 * @returns {boolean} - true si existe
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
 * Obtiene todas las claves guardadas en localStorage
 * @returns {string[]} - Array de claves
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
 * Obtiene todos los datos guardados en localStorage
 * @returns {Object} - Objeto con todas las claves y valores
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
 * Obtiene el tamaño aproximado usado en localStorage (en bytes)
 * @returns {number} - Tamaño en bytes
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
 * Elimina datos por prefijo de clave
 * @param {string} prefix - Prefijo de las claves a eliminar
 * @returns {number} - Cantidad de elementos eliminados
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
 * Elimina datos por sufijo de clave
 * @param {string} suffix - Sufijo de las claves a eliminar
 * @returns {number} - Cantidad de elementos eliminados
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
 * Obtiene el número total de items en localStorage
 * @returns {number} - Número de items
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
 * Verifica si localStorage está disponible
 * @returns {boolean} - true si está disponible
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
