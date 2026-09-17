// src/modules/FletBox/services/Session.js

/**
 * Session - Almacenamiento temporal para DOM (síncrono, similar a sessionStorage)
 *
 * @description Usa sessionStorage del navegador para persistir datos solo durante la sesión.
 * Los datos se eliminan al cerrar la pestaña o el navegador.
 * Soporta strings, objetos, arrays, números, booleanos.
 *
 * @example
 * import { saveSession, getSession, deleteSession, clearAllSession, getAllSessionKeys, getAllSessionData } from './services/Session.js';
 *
 * // Guardar
 * saveSession('user', { name: 'Juan', age: 30 });
 *
 * // Leer
 * const user = getSession('user');
 *
 * // Eliminar
 * deleteSession('user');
 *
 * // Limpiar todo
 * clearAllSession();
 *
 * // Obtener todas las claves
 * const keys = getAllSessionKeys();
 *
 * // Obtener todos los datos
 * const allData = getAllSessionData();
 */

// ========== CREATE / UPDATE ==========
/**
 * Guarda o actualiza un dato en sessionStorage
 * @param {string} key - Clave del dato
 * @param {any} value - Valor a guardar (string, object, array, number, boolean)
 * @returns {boolean} - true si se guardó correctamente
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
 * Obtiene un dato de sessionStorage
 * @param {string} key - Clave del dato
 * @returns {any} - El valor guardado o null si no existe
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

// ========== READ (síncrono directo) ==========
/**
 * Obtiene un dato de sessionStorage de forma síncrona (alias de getSession)
 * @param {string} key - Clave del dato
 * @returns {any} - El valor guardado o null si no existe
 */
export const getSessionSync = (key) => {
  return getSession(key);
};

// ========== UPDATE ==========
/**
 * Actualiza un dato existente (solo si existe)
 * @param {string} key - Clave del dato
 * @param {any} newValue - Nuevo valor
 * @returns {boolean} - true si se actualizó, false si no existía
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
 * Elimina un dato de sessionStorage
 * @param {string} key - Clave del dato
 * @returns {boolean} - true si se eliminó correctamente
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
 * Elimina TODOS los datos de sessionStorage
 * @returns {boolean} - true si se limpió correctamente
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
 * Verifica si existe una clave en sessionStorage
 * @param {string} key - Clave a verificar
 * @returns {boolean} - true si existe
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
 * Obtiene todas las claves guardadas en sessionStorage
 * @returns {string[]} - Array de claves
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
 * Obtiene todos los datos guardados en sessionStorage
 * @returns {Object} - Objeto con todas las claves y valores
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
 * Obtiene el tamaño aproximado usado en sessionStorage (en bytes)
 * @returns {number} - Tamaño en bytes
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
 * Elimina datos por prefijo de clave
 * @param {string} prefix - Prefijo de las claves a eliminar
 * @returns {number} - Cantidad de elementos eliminados
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
 * Elimina datos por sufijo de clave
 * @param {string} suffix - Sufijo de las claves a eliminar
 * @returns {number} - Cantidad de elementos eliminados
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
 * Obtiene el número total de items en sessionStorage
 * @returns {number} - Número de items
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
 * Verifica si sessionStorage está disponible
 * @returns {boolean} - true si está disponible
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
