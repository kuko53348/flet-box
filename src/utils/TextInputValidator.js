// src/modules/FletBox/core/TextInputValidator.js

/**
 * TextInputValidator - Validates and sanitizes text inputs
 * 
 * @description Provides functions to validate and sanitize inputs
 * - onlyLetters()       → only letters A-Z a-z (with accents and Ñ)
 * - onlyNumbers()       → only numbers 0-9
 * - isEmail()           → valid email format
 * - onlyAlphanumeric()  → letters and numbers
 * - sanitize()          → removes malicious code (XSS protection)
 * - escapeHtml()        → escapes HTML characters
 * - safeText()          → combines sanitize + escapeHtml
 * - isSafe()            → detects malicious patterns
 * - filter()            → custom pattern filter
 * - limitLength()       → limits text length
 * - isOnlyLetters()     → validates if only letters
 * - isOnlyNumbers()     → validates if only numbers
 * - filterEmail()       → filters email characters
 */

export const TextInputValidator = {
    /**
     * Filters only letters (A-Z, a-z, with accents and Ñ)
     * @param {string} value - Text to filter
     * @returns {string} Only letters
     */
    onlyLetters: (value) => {
        if (!value) return '';
        return value.replace(/[^A-Za-záéíóúüñÁÉÍÓÚÜÑ\s]/g, '');
    },
    
    /**
     * Filters only numbers (0-9)
     * @param {string} value - Text to filter
     * @returns {string} Only numbers
     */
    onlyNumbers: (value) => {
        if (!value) return '';
        return value.replace(/[^0-9]/g, '');
    },
    
    /**
     * Validates email format
     * @param {string} value - Email to validate
     * @returns {boolean} true if valid email
     */
    isEmail: (value) => {
        if (!value) return false;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(value);
    },
    
    /**
     * Filters email (only allowed characters in email)
     * @param {string} value - Text to filter
     * @returns {string} Filtered email
     */
    filterEmail: (value) => {
        if (!value) return '';
        // Only allows: letters, numbers, @, ., _, -, +, %
        return value.replace(/[^a-zA-Z0-9@._\-+%]/g, '');
    },
    
    /**
     * Filters only letters and numbers
     * @param {string} value - Text to filter
     * @returns {string} Only alphanumeric
     */
    onlyAlphanumeric: (value) => {
        if (!value) return '';
        return value.replace(/[^a-zA-Z0-9]/g, '');
    },
    
    /**
     * Custom pattern filter
     * @param {string} value - Text to filter
     * @param {string} pattern - Allowed characters (without ^)
     * @returns {string} Filtered text
     */
    filter: (value, pattern) => {
        if (!value) return '';
        return value.replace(new RegExp(`[^${pattern}]`, 'g'), '');
    },
    
    /**
     * Limits text length
     * @param {string} value - Text to limit
     * @param {number} maxLength - Maximum length
     * @returns {string} Truncated text
     */
    limitLength: (value, maxLength) => {
        if (!value) return '';
        return value.slice(0, maxLength);
    },
    
    /**
     * Validates if text contains only letters
     * @param {string} value - Text to validate
     * @returns {boolean} true if only letters
     */
    isOnlyLetters: (value) => {
        if (!value) return true;
        return /^[A-Za-záéíóúüñÁÉÍÓÚÜÑ\s]+$/.test(value);
    },
    
    /**
     * Validates if text contains only numbers
     * @param {string} value - Text to validate
     * @returns {boolean} true if only numbers
     */
    isOnlyNumbers: (value) => {
        if (!value) return true;
        return /^[0-9]+$/.test(value);
    },
    
    /**
     * Sanitizes text to prevent XSS and malicious code
     * Removes/escapes: <script>, javascript:, onload=, onerror=, etc.
     * @param {string} value - Text to sanitize
     * @returns {string} Safe text
     */
    sanitize: (value) => {
        if (!value) return '';
        
        let safe = String(value);
        
        // Remove <script> tags and content
        safe = safe.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        // Remove javascript: protocol
        safe = safe.replace(/javascript:/gi, '');
        
        // Remove onload=, onerror=, onclick=, etc.
        safe = safe.replace(/on\w+\s*=/gi, '');
        
        // Remove alert(), confirm(), prompt()
        safe = safe.replace(/alert\s*\(/gi, '');
        safe = safe.replace(/confirm\s*\(/gi, '');
        safe = safe.replace(/prompt\s*\(/gi, '');
        
        // Remove eval()
        safe = safe.replace(/eval\s*\(/gi, '');
        
        // Remove document.write
        safe = safe.replace(/document\.write/gi, '');
        
        // Remove <iframe>
        safe = safe.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
        
        // Remove <object>, <embed>
        safe = safe.replace(/<\/?(object|embed)[^>]*>/gi, '');
        
        // Remove <img> with onerror
        safe = safe.replace(/<img[^>]+onerror\s*=[^>]*>/gi, '');
        
        // Remove <link> with javascript
        safe = safe.replace(/<link[^>]+href\s*=\s*['"]javascript:[^'"]*['"][^>]*>/gi, '');
        
        // Remove <meta> with refresh or http-equiv
        safe = safe.replace(/<meta[^>]+(refresh|http-equiv)[^>]*>/gi, '');
        
        // Remove &{...} expressions (template injection)
        safe = safe.replace(/&\{[^}]*\}/g, '');
        
        // Remove {{...}} expressions (template injection)
        safe = safe.replace(/\{\{[^}]*\}\}/g, '');
        
        // Remove backticks with expressions
        safe = safe.replace(/\${[^}]*}/g, '');
        
        return safe;
    },
    
    /**
     * Escapes HTML special characters
     * Converts < > & " ' to HTML entities
     * @param {string} value - Text to escape
     * @returns {string} Escaped text safe for innerHTML
     */
    escapeHtml: (value) => {
        if (!value) return '';
        
        const htmlEntities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        
        return String(value).replace(/[&<>"'/`=]/g, (char) => htmlEntities[char]);
    },
    
    /**
     * Complete sanitization for user input
     * Combines sanitize() + escapeHtml()
     * @param {string} value - Text to sanitize
     * @returns {string} Completely safe text
     */
    safeText: (value) => {
        if (!value) return '';
        let safe = TextInputValidator.sanitize(value);
        safe = TextInputValidator.escapeHtml(safe);
        return safe;
    },
    
    /**
     * Validates if text contains any malicious patterns
     * @param {string} value - Text to check
     * @returns {boolean} true if safe, false if contains malicious code
     */
    isSafe: (value) => {
        if (!value) return true;
        
        const maliciousPatterns = [
            /<script\b/i,
            /javascript:/i,
            /on\w+\s*=/i,
            /alert\s*\(/i,
            /confirm\s*\(/i,
            /prompt\s*\(/i,
            /eval\s*\(/i,
            /document\.write/i,
            /<iframe\b/i,
            /<object\b/i,
            /<embed\b/i,
            /<link[^>]+javascript:/i,
            /<meta[^>]+refresh/i,
            /&\{[^}]*\}/,
            /\{\{[^}]*\}\}/,
            /\${[^}]*}/
        ];
        
        for (const pattern of maliciousPatterns) {
            if (pattern.test(value)) {
                return false;
            }
        }
        return true;
    }
};

export default TextInputValidator;
