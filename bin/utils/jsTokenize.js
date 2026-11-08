/**
 * @file bin/utils/jsTokenize.js
 * @description A small JavaScript tokenizer shared by the lint and format
 * commands, so both read the same tokens instead of each inventing its own
 * idea of where a string ends or a regex begins.
 *
 * It is not a parser. It does not build an AST, it does not resolve names and
 * it does not evaluate anything. Each token carries its kind, its exact text
 * and where it starts, so a rule can ask "what is the text between these two
 * tokens" or "which tokens sit on this line" without re-scanning the source.
 *
 * Each token's `line` is the 1-based line it starts on, and a string, comment
 * or regex is one token however many lines it spans, so a template literal
 * that runs from line 100 to 200 is one token anchored at 100 and nothing the
 * scanner does between its ends may invent a token inside it.
 *
 * Node core only: `bin/` may not import a devDependency at module scope.
 */

/** Characters after which a `/` opens a regex rather than dividing. */
const REGEX_AFTER = new Set([
  "(", ",", "=", ":", "[", "!", "&", "|", "?", "{", "}", ";", "+", "-", "*", "%", "^", "~", "<", ">",
]);

/** Keywords after which a `/` opens a regex rather than dividing. */
const KEYWORD_BEFORE = new Set([
  "return", "typeof", "instanceof", "in", "of", "new", "case", "do", "delete", "void", "else", "yield", "await",
]);

/**
 * One scanned unit of the source. `line` is the 1-based line it starts on;
 * a token that spans several lines (a block comment, a template literal)
 * carries `spansLines`, so the formatter can emit it verbatim instead of
 * re-spacing its interior.
 *
 * @typedef {{kind: string, text: string, start: number, end: number, line: number, column: number, newlinesBefore: number, spansLines: boolean}} JsToken
 */
const isIdentStart = (ch) => /[A-Za-z_$]/.test(ch) || (ch && ch.charCodeAt(0) > 127);
const isIdentPart = (ch) => /[A-Za-z0-9_$]/.test(ch) || (ch && ch.charCodeAt(0) > 127);
const isDigit = (ch) => ch >= "0" && ch <= "9";

/**
 * Scan the source into tokens.
 *
 * @param {string} code Source text.
 * @returns {JsToken[]}
 */
export const tokenize = (code) => {
  const tokens = [];
  let i = 0;
  const n = code.length;
  let line = 1;

  const columnAt = (offset) => offset - code.lastIndexOf("\n", offset - 1) - 1;

  let pendingNewlines = 0;
  const takeWhitespace = () => {
    while (i < n && /\s/.test(code[i])) {
      if (code[i] === "\n") {
        pendingNewlines++;
        line++;
      }
      i++;
    }
  };

  /**
   * Consume a literal that started at `start` (`'`/`"`/`` ` ``) and return
   * the index one past its close, counting newlines, honouring backslash
   * escapes, and nesting `${ ... }` holes.
   *
   * A hole is code, so inside one a quote opens a nested string and a
   * backtick opens a nested template; outside one (in the literal text)
   * quotes are plain text. A regex inside a hole (`.replace(/'/g, …)`) is
   * consumed whole: without this, the apostrophe inside `/'/g` opens a
   * nested string the scan would never close and the literal would swallow
   * the rest of the file.
   *
   * @param {number} start Offset of the opening quote.
   * @returns {number} Offset one past the closing quote.
   */
  const consumeLiteral = (start) => {
    const quote = code[start];
    i = start + 1;
    // A delimiter the parser is still waiting to close: `}` while a
    // `${ … }` hole is open, or the quote of a nested string/template.
    // A `}` pushed for a plain `{` is `}` too, so a hole and an object
    // literal share the same closer and cannot be told apart.
    const expected = [];
    const holeOpen = () => expected.includes("}");
    // A `/` opens a regex only after an operator/keyword/keyword-adjacent
    // position; after a value it divides. Decided from the previous
    // non-whitespace byte so `a / b` never becomes a regex.
    const prevChar = () => {
      let j = i - 1;
      while (j >= 0 && /[ \t\r\n]/.test(code[j])) j--;
      return j >= 0 ? code[j] : "";
    };
    const prevWord = () => {
      let j = i - 1;
      while (j >= 0 && /[ \t\r\n]/.test(code[j])) j--;
      let k = j;
      while (k >= 0 && /[A-Za-z0-9_$]/.test(code[k])) k--;
      return code.slice(k + 1, j + 1);
    };
    // Consume a `/…/` regex (with flags) at `i`, or return false.
    const consumeRegex = () => {
      const p = prevChar();
      const w = prevWord();
      const isKw = ["return", "typeof", "in", "of", "new", "case", "do", "delete", "void", "else", "yield", "await", "instanceof"].includes(w);
      const looksRegex = REGEX_AFTER.has(p) || KEYWORD_BEFORE.has(w) || isKw || p === "";
      if (!looksRegex) return false;
      const ch = code[i + 1];
      if (ch === "/" || ch === "*" || ch === "=" || ch === "\n" || ch === undefined) return false;
      let j = i + 1;
      let inClass = false;
      let closed = false;
      while (j < n) {
        const rc = code[j];
        if (rc === "\n") break;
        if (rc === "\\") {
          j += 2;
          continue;
        }
        if (rc === "[") inClass = true;
        else if (rc === "]") inClass = false;
        else if (rc === "/" && !inClass) {
          closed = true;
          break;
        }
        j++;
      }
      if (!closed) return false;
      j++;
      while (j < n && /[a-zA-Z]/.test(code[j])) j++;
      i = j;
      return true;
    };
    while (i < n) {
      const c = code[i];
      const innermost = expected[expected.length - 1];
      if (innermost !== undefined) {
        // Inside a nested literal or a hole.
        if (innermost === "`") {
          // A nested template's literal text: `${` opens a hole inside it,
          // a backtick closes it, anything else is literal text.
          if (c === "`") {
            expected.pop();
            i++;
            continue;
          }
          if (c === "$" && code[i + 1] === "{") {
            expected.push("}");
            i += 2;
            continue;
          }
          // Anything else in a template's literal text is plain text:
          // `{`, `}` and quotes are not holes, braces or strings there.
          if (c === "\\") {
            if (code[i + 1] === "\n") line++;
            i += 2;
            continue;
          }
          if (c === "\n") line++;
          i++;
          continue;
        }
        if (innermost === "'" || innermost === '"') {
          if (c === "\\") {
            if (code[i + 1] === "\n") line++;
            i += 2;
            continue;
          }
          if (c === innermost) {
            expected.pop();
            i++;
            continue;
          }
          if (c === "\n") line++;
          i++;
          continue;
        }
        // innermost === "}": inside a `${ … }` hole (code, not text).
        if (c === "`") {
          expected.push("`");
          i++;
          continue;
        }
        if (c === "'" || c === '"') {
          expected.push(c);
          i++;
          continue;
        }
        if (c === "{") {
          expected.push("}");
          i++;
          continue;
        }
        if (c === "}") {
          expected.pop();
          i++;
          continue;
        }
        if (c === "/") {
          if (consumeRegex()) continue;
          i++;
          continue;
        }
        if (c === "\\") {
          i += 2;
          continue;
        }
        if (c === "\n") line++;
        i++;
        continue;
      }
      if (c === "\\") {
        if (code[i + 1] === "\n") line++;
        i += 2;
        continue;
      }
      if (c === "\n") {
        line++;
        i++;
        continue;
      }
      // The literal's own closer.
      if (c === quote) {
        i++;
        return i;
      }
      // A template's `${` opens a hole; the rest of the literal text is
      // plain characters (an apostrophe is text, not a string opener).
      if (quote === "`" && c === "$" && code[i + 1] === "{") {
        expected.push("}");
        i += 2;
        continue;
      }
      i++;
    }
    return i;
  };

  // A hashbang (`#!/usr/bin/env node`) opens an executable script, not a `#`
  // operator. It closes on its own line: scan it as one comment token so the
  // formatter keeps it glued to the shebang marker instead of re-spacing it.
  if (code.startsWith("#!", 0)) {
    let j = 0;
    while (j < n && code[j] !== "\n") j++;
    tokens.push({
      kind: "comment",
      text: code.slice(0, j),
      start: 0,
      end: j,
      line: 1,
      column: 0,
      newlinesBefore: 0,
      spansLines: false,
    });
    i = j;
  }

  while (i < n) {
    takeWhitespace();
    if (i >= n) break;
    const start = i;
    const startLine = line;
    const ch = code[i];
    const next = code[i + 1];

    if (ch === "/" && next === "/") {
      while (i < n && code[i] !== "\n") i++;
      const text = code.slice(start, i);
      tokens.push({ kind: "comment", text, start, end: i, line: startLine, column: columnAt(start), newlinesBefore: pendingNewlines, spansLines: false });
      pendingNewlines = 0;
      continue;
    }
    if (ch === "/" && next === "*") {
      i += 2;
      while (i < n && !(code[i] === "*" && code[i + 1] === "/")) {
        if (code[i] === "\n") line++;
        i++;
      }
      i = Math.min(n, i + 2);
      const text = code.slice(start, i);
      tokens.push({ kind: "comment", text, start, end: i, line: startLine, column: columnAt(start), newlinesBefore: pendingNewlines, spansLines: true });
      pendingNewlines = 0;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      i = consumeLiteral(start);
      const text = code.slice(start, i);
      tokens.push({ kind: "string", text, start, end: i, line: startLine, column: columnAt(start), newlinesBefore: pendingNewlines, spansLines: text.includes("\n") });
      pendingNewlines = 0;
      continue;
    }

    if (ch === "/") {
      const prev = tokens.length ? tokens[tokens.length - 1] : null;
      const prevText = prev ? prev.text : "";
      const last = prevText[prevText.length - 1];
      const isValue = prevText && (isIdentPart(last) || last === ")" || last === "]" || last === "++" || last === "--");
      const asRegex = !prev
        ? true
        : isValue
          ? (KEYWORD_BEFORE.has(prevText) || ["this", "super"].includes(prevText))
          : true;
      if (asRegex && (REGEX_AFTER.has(last) || !prev || KEYWORD_BEFORE.has(prevText))) {
        let j = i + 1;
        let inClass = false;
        let closed = false;
        while (j < n) {
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
          j++;
          while (j < n && /[a-z]/i.test(code[j])) j++;
          const text = code.slice(start, j);
          tokens.push({ kind: "regex", text, start, end: j, line: startLine, column: columnAt(start), newlinesBefore: pendingNewlines, spansLines: false });
          i = j;
          pendingNewlines = 0;
          continue;
        }
      }
      const len = next === "=" ? 2 : 1;
      tokens.push({ kind: "punct", text: code.slice(start, start + len), start, end: start + len, line: startLine, column: columnAt(start), newlinesBefore: pendingNewlines, spansLines: false });
      i += len;
      pendingNewlines = 0;
      continue;
    }

    if (isDigit(ch) || (ch === "." && isDigit(next))) {
      let j = i;
      if (code[j] === "0" && (code[j + 1] === "x" || code[j + 1] === "X")) {
        j += 2;
        while (j < n && /[0-9a-fA-F_]/.test(code[j])) j++;
      } else if (code[j] === "0" && (code[j + 1] === "b" || code[j + 1] === "B")) {
        j += 2;
        while (j < n && /[01_]/.test(code[j])) j++;
      } else if (code[j] === "0" && (code[j + 1] === "o" || code[j + 1] === "O")) {
        j += 2;
        while (j < n && /[0-7_]/.test(code[j])) j++;
      } else {
        while (j < n && /[0-9_]/.test(code[j])) j++;
        if (code[j] === ".") {
          j++;
          while (j < n && /[0-9_]/.test(code[j])) j++;
        }
        if (code[j] === "e" || code[j] === "E") {
          let k = j + 1;
          if (code[k] === "+" || code[k] === "-") k++;
          if (k < n && isDigit(code[k])) {
            while (k < n && /[0-9_]/.test(code[k])) k++;
            j = k;
          }
        }
      }
      if (code[j] === "n") j++;
      tokens.push({ kind: "number", text: code.slice(start, j), start, end: j, line: startLine, column: columnAt(start), newlinesBefore: pendingNewlines, spansLines: false });
      i = j;
      pendingNewlines = 0;
      continue;
    }

    if (isIdentStart(ch)) {
      let j = i + 1;
      while (j < n && isIdentPart(code[j])) j++;
      tokens.push({ kind: "ident", text: code.slice(start, j), start, end: j, line: startLine, column: columnAt(start), newlinesBefore: pendingNewlines, spansLines: false });
      i = j;
      pendingNewlines = 0;
      continue;
    }

    const three = code.slice(i, i + 3);
    const two = code.slice(i, i + 2);
    let len = 1;
    if (["**=", "===", "!==", ">>>", "...", "&&=", "||=", "??=", "<<=", ">>="].includes(three)) len = 3;
    else if (
      ["=>", "==", "!=", "<=", ">=", "&&", "||", "++", "--", "+=", "-=", "*=", "/=", "%=",
       "**", "<<", ">>", "?.", "??", "&=", "|=", "^="].includes(two)
    ) len = 2;
    tokens.push({ kind: "punct", text: code.slice(start, start + len), start, end: start + len, line: startLine, column: columnAt(start), newlinesBefore: pendingNewlines, spansLines: false });
    i += len;
    pendingNewlines = 0;
  }

  return tokens;
};

/**
 * The tokens a rule can measure without re-scanning: everything except the
 * whitespace the formatter owns.
 *
 * @param {string} code
 * @returns {JsToken[]}
 */
export const significant = (code) => tokenize(code);

/**
 * Which tokens sit on one line, by line number.
 *
 * @param {JsToken[]} tokens
 * @returns {Map<number, JsToken[]>}
 */
export const tokensByLine = (tokens) => {
  const byLine = new Map();
  for (const token of tokens) {
    const list = byLine.get(token.line) || [];
    list.push(token);
    byLine.set(token.line, list);
  }
  return byLine;
};

export default { tokenize, significant, tokensByLine };
