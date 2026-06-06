// utils/syntaxHighlight.js

// ========== COLORES PARA FLETBOX ==========
const fletboxColors = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0'
};

// ========== PALABRAS CLAVE FLETBOX ==========
const fletboxKeywords = [
    'Container', 'Row', 'Column', 'Stack', 'ListView', 'GridView',
    'Text', 'Button', 'Icon', 'Image', 'Avatar', 'Card', 'ListTile',
    'Input', 'Checkbox', 'Radio', 'Switch', 'Slider', 'Dropdown',
    'ProgressBar', 'Rating', 'Chip', 'Badge', 'Divider', 'Accordion',
    'Modal', 'BottomSheet', 'AlertDialog', 'SnackBar',
    'Scaffold', 'AppBar', 'Drawer', 'BottomNavigation', 'Tabs',
    'DraggBox', 'DroppBox', 'AnimatedBox', 'AnimatedText',
    'colors', 'runApp', 'goTo', 'useState', 'httpGet', 'httpPost'
];

// ========== PALABRAS CLAVE JAVASCRIPT ==========
const jsKeywords = [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for',
    'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch',
    'finally', 'throw', 'new', 'this', 'typeof', 'instanceof', 'delete',
    'in', 'of', 'class', 'extends', 'super', 'import', 'export', 'default',
    'from', 'as', 'async', 'await', 'true', 'false', 'null', 'undefined'
];

// ========== TIPOS DE TOKENS ==========
const TokenType = {
    KEYWORD: 'keyword',
    STRING: 'string',
    NUMBER: 'number',
    COMMENT: 'comment',
    PROPERTY: 'property',
    FUNCTION: 'function',
    BRACKET: 'bracket',
    PUNCTUATION: 'punctuation',
    FLETBOX_COLOR: 'fletbox-color',
    FLETBOX_WIDGET: 'fletbox-widget'
};

// ========== COLORES PARA CADA TOKEN ==========
export const highlightColors = {
    [TokenType.KEYWORD]: '#c678dd',      // púrpura
    [TokenType.STRING]: '#98c379',        // verde
    [TokenType.NUMBER]: '#d19a66',        // naranja
    [TokenType.COMMENT]: '#5c6370',       // gris
    [TokenType.PROPERTY]: '#e06c75',      // rojo
    [TokenType.FUNCTION]: '#61afef',      // azul
    [TokenType.BRACKET]: '#abb2bf',       // gris claro
    [TokenType.PUNCTUATION]: '#abb2bf',   // gris claro
    [TokenType.FLETBOX_COLOR]: '#56b6c2', // cyan
    [TokenType.FLETBOX_WIDGET]: '#e5c07b' // amarillo
};

// ========== DETECTAR COLORES DE FLETBOX ==========
const isFletboxColor = (word) => {
    return fletboxColors.hasOwnProperty(word) || 
           word.match(/^colors\.\w+$/) ||
           word.match(/^#[0-9A-Fa-f]{3,6}$/) ||
           word.match(/^rgba?\(/);
};

// ========== DETECTAR WIDGETS DE FLETBOX ==========
const isFletboxWidget = (word) => {
    return fletboxKeywords.includes(word);
};

// ========== TOKENIZADOR PRINCIPAL ==========
export const tokenize = (code) => {
    const tokens = [];
    let i = 0;
    const len = code.length;
    
    while (i < len) {
        const char = code[i];
        
        // ========== STRINGS ==========
        if (char === '"' || char === "'" || char === '`') {
            const quote = char;
            let start = i;
            i++;
            while (i < len && code[i] !== quote) {
                if (code[i] === '\\' && i + 1 < len) i++;
                i++;
            }
            i++;
            tokens.push({
                type: TokenType.STRING,
                value: code.substring(start, i)
            });
            continue;
        }
        
        // ========== COMENTARIOS ==========
        if (char === '/' && code[i + 1] === '/') {
            let start = i;
            while (i < len && code[i] !== '\n') i++;
            tokens.push({
                type: TokenType.COMMENT,
                value: code.substring(start, i)
            });
            continue;
        }
        
        if (char === '/' && code[i + 1] === '*') {
            let start = i;
            i += 2;
            while (i < len && !(code[i - 1] === '*' && code[i] === '/')) i++;
            i++;
            tokens.push({
                type: TokenType.COMMENT,
                value: code.substring(start, i)
            });
            continue;
        }
        
        // ========== NÚMEROS ==========
        if (/[0-9]/.test(char)) {
            let start = i;
            while (i < len && /[0-9.]/.test(code[i])) i++;
            tokens.push({
                type: TokenType.NUMBER,
                value: code.substring(start, i)
            });
            continue;
        }
        
        // ========== PALABRAS (identificadores) ==========
        if (/[a-zA-Z_$]/.test(char)) {
            let start = i;
            while (i < len && /[a-zA-Z0-9_$]/.test(code[i])) i++;
            const word = code.substring(start, i);
            
            // Detectar tipo de palabra
            if (isFletboxWidget(word)) {
                tokens.push({ type: TokenType.FLETBOX_WIDGET, value: word });
            } else if (isFletboxColor(word)) {
                tokens.push({ type: TokenType.FLETBOX_COLOR, value: word });
            } else if (jsKeywords.includes(word)) {
                tokens.push({ type: TokenType.KEYWORD, value: word });
            } else if (word.match(/^[a-z][a-zA-Z0-9]*$/)) {
                // Posible propiedad o función
                tokens.push({ type: TokenType.PROPERTY, value: word });
            } else {
                tokens.push({ type: TokenType.PROPERTY, value: word });
            }
            continue;
        }
        
        // ========== BRACKETS Y PUNTUACIÓN ==========
        if ('{}[]()'.includes(char)) {
            tokens.push({ type: TokenType.BRACKET, value: char });
            i++;
            continue;
        }
        
        if (',;:.'.includes(char)) {
            tokens.push({ type: TokenType.PUNCTUATION, value: char });
            i++;
            continue;
        }
        
        // ========== ESPACIOS (los preservamos para formato) ==========
        if (/\s/.test(char)) {
            let start = i;
            while (i < len && /\s/.test(code[i])) i++;
            tokens.push({ type: 'whitespace', value: code.substring(start, i) });
            continue;
        }
        
        // ========== CUALQUIER OTRO CARÁCTER ==========
        tokens.push({ type: 'text', value: char });
        i++;
    }
    
    return tokens;
};

// ========== GENERAR HTML CON COLORES ==========
export const generateHighlightedHtml = (code) => {
    const tokens = tokenize(code);
    let html = '';
    
    for (const token of tokens) {
        if (token.type === 'whitespace') {
            html += token.value;
        } else {
            const color = highlightColors[token.type];
            if (color) {
                html += `<span style="color: ${color};">${escapeHtml(token.value)}</span>`;
            } else {
                html += escapeHtml(token.value);
            }
        }
    }
    
    return html;
};

// ========== ESCAPAR HTML ==========
const escapeHtml = (text) => {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

export default { tokenize, generateHighlightedHtml, highlightColors };
