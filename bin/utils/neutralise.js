/**
 * @file bin/utils/neutralise.js
 * @description Comment/string/regex stripper that preserves character offsets.
 */

/**
 * Characters after which a `/` starts a regex literal rather than a division.
 */
const REGEX_AFTER = new Set([
  "(",
  ",",
  "=",
  ":",
  "[",
  "!",
  "&",
  "|",
  "?",
  "{",
  "}",
  ";",
  "+",
  "-",
  "*",
  "%",
  "^",
  "~",
  "<",
  ">",
]);

const KEYWORD_BEFORE = /(?:^|[^\w$])(?:return|typeof|instanceof|in|of|new|case|do|void|delete|else)$/;

/**
 * @param {string} emitted Text produced so far (same length as the source prefix).
 * @returns {boolean} `true` when a `/` here opens a regex literal.
 */
const regexPosition = (emitted) => {
  const text = emitted.replace(/\s+$/, "");
  if (!text) return true;
  return REGEX_AFTER.has(text[text.length - 1]) || KEYWORD_BEFORE.test(text);
};

/**
 * Strip comments, string/regex bodies and template placeholders, keeping
 * character offsets.
 *
 * Two passes are needed: imports must read their module specifier, while the
 * call-site scanner must not see braces inside string literals. Skipped content
 * is replaced by an equal-length filler so line numbers stay correct.
 *
 * Three constructs desynchronise a naive quote scanner, and each one has shown
 * up in this repo's own source:
 *   - a regex containing a quote (`value.replace(/'/g, "\\'")`), which looks
 *     exactly like a string start to a scanner that only tracks quotes;
 *   - a template placeholder (`${ … }`), which is code, not string text, and
 *     can itself hold quotes or another backtick.
 * Both are scanned here instead of being treated as characters.
 *
 * @param {string} code
 * @param {{ keepStrings?: boolean }} [options]
 * @returns {string}
 */
export const neutralise = (code, { keepStrings = false } = {}) => {
  let out = "";
  let i = 0;
  const copy = (value) => {
    out += keepStrings ? value : value === "\n" ? "\n" : " ";
  };
  while (i < code.length) {
    const ch = code[i];
    const next = code[i + 1];
    if (ch === "/" && next === "/") {
      while (i < code.length && code[i] !== "\n") {
        out += " ";
        i++;
      }
      continue;
    }
    if (ch === "/" && next === "*") {
      while (i < code.length && !(code[i] === "*" && code[i + 1] === "/")) {
        out += code[i] === "\n" ? "\n" : " ";
        i++;
      }
      out += "  ";
      i += 2;
      continue;
    }
    if (ch === "/" && regexPosition(out)) {
      // Regex literal: ends at the unescaped `/` outside its character class.
      let j = i + 1;
      let inClass = false;
      let closed = false;
      while (j < code.length) {
        const c = code[j];
        if (c === "\n") break;
        if (c === "\\") {
          j += 2;
          continue;
        }
        if (c === "[") inClass = true;
        else if (c === "]") inClass = false;
        else if (c === "/" && !inClass) {
          closed = true;
          break;
        }
        j++;
      }
      if (closed) {
        j++; // flags (g, i, m, u, s, y) live right after the closing slash
        while (j < code.length && /[a-z]/i.test(code[j])) j++;
        for (let k = i; k < j; k++) {
          out += keepStrings ? code[k] : code[k] === "\n" ? "\n" : " ";
        }
        i = j;
        continue;
      }
      // Unterminated on this line: it was division after all.
      out += ch;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      out += ch;
      i++;
      while (i < code.length) {
        if (code[i] === "\\") {
          out += keepStrings ? code.slice(i, i + 2) : "  ";
          i += 2;
          continue;
        }
        if (code[i] === quote) {
          out += quote;
          i++;
          break;
        }
        if (quote === "`" && code[i] === "$" && code[i + 1] === "{") {
          out += keepStrings ? "${" : "  ";
          i += 2;
          let depth = 1;
          while (i < code.length && depth > 0) {
            const inner = code[i];
            if (inner === "{") depth++;
            else if (inner === "}") depth--;
            if (depth === 0) {
              out += keepStrings ? inner : " ";
              i++;
              break;
            }
            copy(inner);
            i++;
          }
          continue;
        }
        copy(code[i]);
        i++;
      }
      continue;
    }
    out += ch;
    i++;
  }
  return out;
};

export default neutralise;
