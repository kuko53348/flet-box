// src/modules/FletBox/utils/units.js
// import { toREM, setBaseFontSize, toPX } from './utils/units.js';
//
// // Configuración global (opcional)
// setBaseFontSize(16);  // 1rem = 16px (por defecto)
//
// // Conversiones automáticas
// toREM(16)    // "1rem"
// toREM(24)    // "1.5rem"
// toREM(8)     // "0.5rem"
//
// // Strings pasan directo
// toREM('16px')  // "16px"
// toREM('1rem')  // "1rem"
// toREM('50%')   // "50%"
//
// // Para píxeles exactos
// toPX(16)     // "16px"
// toPX(24)     // "24px"
// toPX('1rem') // "1rem"

let BASE_FONT_SIZE = 16;

/**
 * Establece el tamaño base de fuente para la conversión rem
 * @param {number} size - Tamaño base en píxeles (por defecto 16)
 * @example
 * setBaseFontSize(16); // 1rem = 16px
 * setBaseFontSize(20); // 1rem = 20px
 */
export const setBaseFontSize = (size) => {
    BASE_FONT_SIZE = size;
    document.documentElement.style.fontSize = `${size}px`;
};

/**
 * Convierte un valor numérico a rem, o mantiene strings como están
 * @param {number|string} value - Valor a convertir
 * @returns {string} Valor convertido (ej: "1rem", "16px", "50%")
 * @example
 * toREM(16)     // "1rem"
 * toREM(8)      // "0.5rem"
 * toREM('16px') // "16px"
 * toREM('1rem') // "1rem"
 * toREM('50%')  // "50%"
 */
export const toREM = (value) => {
    if (value === undefined || value === null) return undefined;
    
    // Si es número, convertir a rem
    if (typeof value === 'number') {
        return `${value / BASE_FONT_SIZE}rem`;
    }
    
    // Si es string, devolverlo tal cual
    if (typeof value === 'string') {
        return value;
    }
    
    // Para otros tipos (objetos, booleanos, etc.)
    return String(value);
};

/**
 * Convierte un valor a píxeles si es número, o mantiene strings
 * @param {number|string} value - Valor a convertir
 * @returns {string} Valor en píxeles o string original
 * @example
 * toPX(16)     // "16px"
 * toPX('1rem') // "1rem"
 * toPX('50%')  // "50%"
 */
export const toPX = (value) => {
    if (value === undefined || value === null) return undefined;
    
    if (typeof value === 'number') {
        return `${value}px`;
    }
    
    return value;
};

/**
 * Obtiene el tamaño base actual
 * @returns {number} Tamaño base en píxeles
 */
export const getBaseFontSize = () => BASE_FONT_SIZE;
