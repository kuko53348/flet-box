// tools/string.js

/**
 * Capitalize first letter of a string
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 * @example capitalize('hello') // "Hello"
 */
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Capitalize each word in a string
 * @param {string} str - Input string
 * @returns {string} String with each word capitalized
 * @example capitalizeWords('hello world') // "Hello World"
 */
export const capitalizeWords = (str) => {
    if (!str) return '';
    return str.split(' ').map(word => capitalize(word)).join(' ');
};

/**
 * Convert string to lowercase
 * @param {string} str - Input string
 * @returns {string} Lowercase string
 */
export const lowerCase = (str) => {
    if (!str) return '';
    return str.toLowerCase();
};

/**
 * Convert string to uppercase
 * @param {string} str - Input string
 * @returns {string} Uppercase string
 */
export const upperCase = (str) => {
    if (!str) return '';
    return str.toUpperCase();
};

/**
 * Reverse a string
 * @param {string} str - Input string
 * @returns {string} Reversed string
 * @example reverse('hello') // "olleh"
 */
export const reverseString = (str) => {
    if (!str) return '';
    return str.split('').reverse().join('');
};

/**
 * Truncate string to max length
 * @param {string} str - Input string
 * @param {number} length - Max length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated string
 */
export const truncate = (str, length = 50, suffix = '...') => {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.slice(0, length) + suffix;
};

export default { capitalize, capitalizeWords, lowerCase, upperCase, reverseString, truncate };
