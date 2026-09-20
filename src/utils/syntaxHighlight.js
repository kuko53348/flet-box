// utils/syntaxHighlight.js

// ========== FLETBOX COLORS ==========
const fletboxColors = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  background: "#ffffff",
  surface: "#f8fafc",
  text: "#0f172a",
  textSecondary: "#64748b",
  border: "#e2e8f0",
};

// ========== FLETBOX KEYWORDS ==========
const fletboxKeywords = [
  "Container",
  "Row",
  "Column",
  "Stack",
  "ListView",
  "GridView",
  "Text",
  "Button",
  "Icon",
  "Image",
  "Avatar",
  "Card",
  "ListTile",
  "Input",
  "Checkbox",
  "Radio",
  "Switch",
  "Slider",
  "Dropdown",
  "ProgressBar",
  "Rating",
  "Chip",
  "Badge",
  "Divider",
  "Accordion",
  "Modal",
  "BottomSheet",
  "AlertDialog",
  "SnackBar",
  "Scaffold",
  "AppBar",
  "Drawer",
  "BottomNavigation",
  "Tabs",
  "DraggBox",
  "DroppBox",
  "AnimatedBox",
  "AnimatedText",
  "colors",
  "runApp",
  "goTo",
  "useState",
  "httpGet",
  "httpPost",
];

// ========== JAVASCRIPT KEYWORDS ==========
const jsKeywords = [
  "const",
  "let",
  "var",
  "function",
  "return",
  "if",
  "else",
  "for",
  "while",
  "do",
  "switch",
  "case",
  "break",
  "continue",
  "try",
  "catch",
  "finally",
  "throw",
  "new",
  "this",
  "typeof",
  "instanceof",
  "delete",
  "in",
  "of",
  "class",
  "extends",
  "super",
  "import",
  "export",
  "default",
  "from",
  "as",
  "async",
  "await",
  "true",
  "false",
  "null",
  "undefined",
];

// ========== TOKEN TYPES ==========
const TokenType = {
  KEYWORD: "keyword",
  STRING: "string",
  NUMBER: "number",
  COMMENT: "comment",
  PROPERTY: "property",
  FUNCTION: "function",
  BRACKET: "bracket",
  PUNCTUATION: "punctuation",
  FLETBOX_COLOR: "fletbox-color",
  FLETBOX_WIDGET: "fletbox-widget",
};

// ========== COLORS PER TOKEN ==========
export const highlightColors = {
  [TokenType.KEYWORD]: "#c678dd", // purple
  [TokenType.STRING]: "#98c379", // green
  [TokenType.NUMBER]: "#d19a66", // orange
  [TokenType.COMMENT]: "#5c6370", // gray
  [TokenType.PROPERTY]: "#e06c75", // red
  [TokenType.FUNCTION]: "#61afef", // blue
  [TokenType.BRACKET]: "#abb2bf", // light gray
  [TokenType.PUNCTUATION]: "#abb2bf", // light gray
  [TokenType.FLETBOX_COLOR]: "#56b6c2", // cyan
  [TokenType.FLETBOX_WIDGET]: "#e5c07b", // yellow
};

// ========== DETECT FLETBOX COLORS ==========
/**
 * Returns `true` when the given word represents a FletBox color token.
 * Matches palette keys, `colors.<name>` expressions, hex literals, and `rgb`/`rgba` values.
 * @param {string} word - Token text to test.
 * @returns {boolean}
 * @private
 */
const isFletboxColor = (word) => {
  return (
    fletboxColors.hasOwnProperty(word) ||
    word.match(/^colors\.\w+$/) ||
    word.match(/^#[0-9A-Fa-f]{3,6}$/) ||
    word.match(/^rgba?\(/)
  );
};

// ========== DETECT FLETBOX WIDGETS ==========
/**
 * Returns `true` when the given word is a known FletBox widget or utility identifier.
 * @param {string} word - Token text to test.
 * @returns {boolean}
 * @private
 */
const isFletboxWidget = (word) => {
  return fletboxKeywords.includes(word);
};

// ========== MAIN TOKENIZER ==========
/**
 * Tokenizes a JavaScript/FletBox source string into an array of typed tokens.
 *
 * Token types: `keyword`, `string`, `number`, `comment`, `property`,
 * `function`, `bracket`, `punctuation`, `fletbox-color`, `fletbox-widget`,
 * `whitespace`, `text`.
 *
 * @param {string} code - Source code to tokenize.
 * @returns {Array<{type: string, value: string}>} Ordered token array.
 * @example
 * tokenize('const x = 42;')
 * // [
 * //   { type: 'keyword', value: 'const' },
 * //   { type: 'whitespace', value: ' ' },
 * //   { type: 'property', value: 'x' },
 * //   ...
 * // ]
 */
export const tokenize = (code) => {
  const tokens = [];
  let i = 0;
  const len = code.length;

  while (i < len) {
    const char = code[i];

    // ========== STRINGS ==========
    if (char === '"' || char === "'" || char === "`") {
      const quote = char;
      let start = i;
      i++;
      while (i < len && code[i] !== quote) {
        if (code[i] === "\\" && i + 1 < len) i++;
        i++;
      }
      i++;
      tokens.push({
        type: TokenType.STRING,
        value: code.substring(start, i),
      });
      continue;
    }

    // ========== COMMENTS ==========
    if (char === "/" && code[i + 1] === "/") {
      let start = i;
      while (i < len && code[i] !== "\n") i++;
      tokens.push({
        type: TokenType.COMMENT,
        value: code.substring(start, i),
      });
      continue;
    }

    if (char === "/" && code[i + 1] === "*") {
      let start = i;
      i += 2;
      while (i < len && !(code[i - 1] === "*" && code[i] === "/")) i++;
      i++;
      tokens.push({
        type: TokenType.COMMENT,
        value: code.substring(start, i),
      });
      continue;
    }

    // ========== NUMBERS ==========
    if (/[0-9]/.test(char)) {
      let start = i;
      while (i < len && /[0-9.]/.test(code[i])) i++;
      tokens.push({
        type: TokenType.NUMBER,
        value: code.substring(start, i),
      });
      continue;
    }

    // ========== WORDS (identifiers) ==========
    if (/[a-zA-Z_$]/.test(char)) {
      let start = i;
      while (i < len && /[a-zA-Z0-9_$]/.test(code[i])) i++;
      const word = code.substring(start, i);

      // Detect word type
      if (isFletboxWidget(word)) {
        tokens.push({ type: TokenType.FLETBOX_WIDGET, value: word });
      } else if (isFletboxColor(word)) {
        tokens.push({ type: TokenType.FLETBOX_COLOR, value: word });
      } else if (jsKeywords.includes(word)) {
        tokens.push({ type: TokenType.KEYWORD, value: word });
      } else if (word.match(/^[a-z][a-zA-Z0-9]*$/)) {
        // Possible property or function
        tokens.push({ type: TokenType.PROPERTY, value: word });
      } else {
        tokens.push({ type: TokenType.PROPERTY, value: word });
      }
      continue;
    }

    // ========== BRACKETS AND PUNCTUATION ==========
    if ("{}[]()".includes(char)) {
      tokens.push({ type: TokenType.BRACKET, value: char });
      i++;
      continue;
    }

    if (",;:.".includes(char)) {
      tokens.push({ type: TokenType.PUNCTUATION, value: char });
      i++;
      continue;
    }

    // ========== WHITESPACE (preserved for formatting) ==========
    if (/\s/.test(char)) {
      let start = i;
      while (i < len && /\s/.test(code[i])) i++;
      tokens.push({ type: "whitespace", value: code.substring(start, i) });
      continue;
    }

    // ========== ANY OTHER CHARACTER ==========
    tokens.push({ type: "text", value: char });
    i++;
  }

  return tokens;
};

// ========== GENERATE HTML WITH COLORS ==========
/**
 * Tokenizes `code` and wraps each token in a `<span>` with an inline `color`
 * style matching {@link highlightColors}. Whitespace and unrecognized tokens
 * are emitted without a wrapper.
 * @param {string} code - Source code to highlight.
 * @returns {string} HTML string safe for insertion into `innerHTML`.
 */
export const generateHighlightedHtml = (code) => {
  const tokens = tokenize(code);
  let html = "";

  for (const token of tokens) {
    if (token.type === "whitespace") {
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

// ========== ESCAPE HTML ==========
/**
 * Escapes HTML special characters so that token values can be safely inserted
 * into a `<span>` element's content.
 * @param {string} text - Raw token text.
 * @returns {string} HTML-safe string.
 * @private
 */
const escapeHtml = (text) => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

export default { tokenize, generateHighlightedHtml, highlightColors };
