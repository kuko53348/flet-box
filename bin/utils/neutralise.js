/**
 * @file bin/utils/neutralise.js
 * @description Comment/string stripper that preserves character offsets.
 */

/**
 * Strip comments, and optionally string bodies, keeping character offsets.
 *
 * Two passes are needed: imports must read their module specifier, while the
 * call-site scanner must not see braces inside string literals. String contents
 * are replaced by an equal-length filler so line numbers stay correct.
 *
 * @param {string} code
 * @param {{ keepStrings?: boolean }} [options]
 * @returns {string}
 */
export const neutralise = (code, { keepStrings = false } = {}) => {
  let out = "";
  let i = 0;
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
        const fill = keepStrings ? code[i] : code[i] === "\n" ? "\n" : " ";
        out += fill;
        i++;
      }
      continue;
    }
    out += ch;
    i++;
  }
  return out;
};
