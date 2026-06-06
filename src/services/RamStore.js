// src/components/flet-box/services/RamStore.js

/**
 * RamStore - Almacenamiento en RAM (memoria viva) con reactividad
 * 
 * @description
 * Misma API que Storage.js y Session.js, pero guarda en RAM.
 * Los datos se pierden al recargar la página.
 * Incluye subscribe() para reactividad entre widgets.
 */

// ========== ESTADO INTERNO (en RAM) ==========
const ramStore = new Map();

// ========== SUSCRIPTORES (para reactividad) ==========
let subscribers = [];

// ========== FUNCIÓN INTERNA PARA NOTIFICAR ==========
const notifySubscribers = (key, newValue, oldValue) => {
    subscribers.forEach(callback => {
        try {
            callback(key, newValue, oldValue);
        } catch (e) {
            console.error('[RamStore] Error en subscriber:', e);
        }
    });
};

// ========== CREATE / UPDATE ==========

/**
 * Guarda o actualiza un dato en RAM
 * @param {string} key - Clave del dato
 * @param {any} value - Valor a guardar
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
        console.error('Error saving to RAM:', error);
        return false;
    }
};

// ========== READ ==========

/**
 * Obtiene un dato de RAM
 * @param {string} key - Clave del dato
 * @returns {any}
 */
export const getRam = (key) => {
    try {
        return ramStore.has(key) ? ramStore.get(key) : null;
    } catch (error) {
        console.error('Error reading from RAM:', error);
        return null;
    }
};

/**
 * Obtiene todos los datos de RAM
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
        console.error('Error getting all RAM data:', error);
        return {};
    }
};

/**
 * Obtiene todas las claves de RAM
 * @returns {string[]}
 */
export const getAllRamKeys = () => {
    try {
        return Array.from(ramStore.keys());
    } catch (error) {
        console.error('Error getting RAM keys:', error);
        return [];
    }
};

/**
 * Verifica si existe una clave en RAM
 * @param {string} key
 * @returns {boolean}
 */
export const hasRam = (key) => {
    return ramStore.has(key);
};

// ========== UPDATE ==========

/**
 * Actualiza un dato existente (solo si existe)
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
        console.error('Error updating RAM:', error);
        return false;
    }
};

// ========== DELETE ==========

/**
 * Elimina un dato de RAM
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
        console.error('Error deleting from RAM:', error);
        return false;
    }
};

/**
 * Elimina TODOS los datos de RAM
 * @returns {boolean}
 */
export const clearAllRam = () => {
    try {
        ramStore.clear();
        notifySubscribers(null, null, null);
        return true;
    } catch (error) {
        console.error('Error clearing RAM:', error);
        return false;
    }
};

// ========== SUSCRIBIRSE (REACTIVIDAD) ==========

/**
 * Suscribe un callback a cambios en RAM
 * @param {Function} callback - (key, newValue, oldValue) => void
 * @returns {Function} - unsubscribe function
 */
export const subscribeRam = (callback) => {
    subscribers.push(callback);
    // console.log(`[RamStore] Subscriber added. Total: ${subscribers.length}`);
    
    // Retornar función para desuscribirse
    return () => {
        subscribers = subscribers.filter(s => s !== callback);
        console.log(`[RamStore] Subscriber removed. Total: ${subscribers.length}`);
    };
};

// ========== UTILS ==========

/**
 * Obtiene el número de items en RAM
 * @returns {number}
 */
export const getRamItemCount = () => {
    return ramStore.size;
};

/**
 * Verifica si RamStore está disponible
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
    isRamAvailable
};

export default RamStore;
