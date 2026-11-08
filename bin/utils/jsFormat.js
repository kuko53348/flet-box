/**
 * @file bin/utils/jsFormat.js
 * @description A conservative JavaScript formatter, Node core only.
 *
 * The formatter never rewrites a token's text: a string keeps its quotes, a
 * comment keeps its words, a number keeps its digits. What it normalises is
 * the whitespace BETWEEN two tokens on one line, which is what makes two
 * people editing one file diff against each other rather than against the
 * code. A token that spans lines — a block comment, a template literal — is
 * emitted verbatim, so its interior lines stay where the author put them:
 * the formatter never moves a line it did not start, and it never re-indents.
 *
 * Its rules are the ones this repository already follows: a comma, a colon in
 * an object, an operator and a `(` after a keyword take one space; no space
 * sits inside `()` or `[]`, and none sits before a `.` or `;`; a ternary
 * colon keeps the space before it, a property colon does not; braces carry
 * one inner space (`{ a, b }`, `{}`) and an empty pair carries none; a line
 * comment starts after one space, unless it opens a line; no line keeps
 * trailing spaces, and the file ends in one newline.
 *
 * Indentation is not part of the contract: it is the author's, line by line,
 * and re-deriving it from bracket depth cannot reproduce the continuations
 * (`&&`, a call split over three lines, a case label) without re-implementing
 * prettier's layout engine, which would fight the repository it serves. A
 * formatter that moves every line but one is a restyle, not a normaliser.
 *
 * Node core only: `bin/` may not import a devDependency at module scope.
 */

import { tokenize } from "./jsTokenize.js";

/** Keywords that take a space before a following `(`: `if (`, not `foo(`. */
const KEYWORD_PAREN = new Set(["if", "for", "while", "switch", "with", "catch"]);

/** Keywords after which a `(` is preceded by a space even though the text
 *  looks like a call: `return (`, `throw (`, `case (`. The same set guards
 * `[`: `for (const x of [` is an array literal, while `arr[` is an index. */
const VALUE_PAREN = new Set([
  "return", "throw", "case", "typeof", "new", "void", "delete", "yield", "await",
  "of", "in", "instanceof",
]);

/** Operators a space sits around. `?.`, `...` and the member/dot family are
 *  deliberately absent: they glue their neighbours. */
const SPACED_OPERATOR = new Set([
  "=", "+=", "-=", "*=", "/=", "%=", "**=", "&&=", "||=", "??=",
  "+", "-", "*", "/", "%", "**", "==", "!=", "===", "!==",
  "<", ">", "<=", ">=", "<<", ">>", ">>>", "&", "|", "^",
  "&&", "||", "??", "=>", "?",
]);

/**
 * Whether a single space sits between `prev` and `token`.
 *
 * `ternary` is the running balance of `?` minus `:` across the file, read by
 * the caller between tokens so a property colon (`{ a: 1 }`) keeps its
 * no-space-before while a ternary colon (`a ? b : c`) keeps its space.
 * `before` is the token before `prev`, so a unary `-`/`+` can tell `return
 * -1` (a sign in front of a value) from `a - b` (a binary operator).
 *
 * @param {import("./jsTokenize.js").JsToken} prev The preceding token.
 * @param {import("./jsTokenize.js").JsToken} token The token being appended.
 * @param {number} ternary How many `?` are still waiting for their `:`.
 * @param {import("./jsTokenize.js").JsToken|null} before The token before `prev`, for unary decisions.
 * @returns {boolean}
 */
const needsSpace = (prev, token, ternary, before = null) => {
  if (!prev) return false;
  const t = token.text;
  const p = prev.text;

  // A unary `-`/`+` before a number glues to it (`-1`); after a value or a
  // closer it is binary and keeps its space (`a - b`).
  if ((p === "-" || p === "+") && token.kind === "number") {
    const binary =
      before &&
      ((before.kind === "ident" && !VALUE_PAREN.has(before.text)) ||
        before.kind === "number" ||
        before.kind === "string" ||
        before.kind === "regex" ||
        before.text === ")" ||
        before.text === "]" ||
        before.text === "}" ||
        before.text === "++" ||
        before.text === "--");
    if (!binary) return false;
  }

  if (token.kind === "comment") return true;
  if (t === ")" || t === "]" || t === "," || t === ";" || t === "." || t === "?.") return false;
  if (t === "}") return p !== "{";
  if (p === "(" || p === "[") return false;
  if (p === "!" || p === "~" || p === "++" || p === "--" || p === "...") return false;
  if (p === "{") return t !== "}";

  if (t === "(") {
    if (prev.kind === "ident") return KEYWORD_PAREN.has(p) || VALUE_PAREN.has(p);
    if (prev.kind === "number" || prev.kind === "string" || prev.kind === "regex") return false;
    if (p === ")" || p === "]") return false;
    return true;
  }
  if (t === "[") {
    if (p === "const" || p === "let" || p === "var" || VALUE_PAREN.has(p)) return true;
    if (prev.kind === "ident" || prev.kind === "number" || p === ")" || p === "]" || p === "}") return false;
  }

  if (t === "}") return true;
  if (p === "}") return t !== "}" && t !== ";" && t !== "," && t !== ")" && t !== "]" && t !== ".";
  if (t === ":") return ternary > 0;

  if (p === ";") return t !== ";";
  if (SPACED_OPERATOR.has(p) || SPACED_OPERATOR.has(t)) return true;
  if (p === "," || p === ":") return true;

  if (
    (prev.kind === "ident" || prev.kind === "number" || prev.kind === "string" || prev.kind === "regex") &&
    (token.kind === "ident" || token.kind === "number" || token.kind === "string" || token.kind === "regex" || t === "{" || t === "function" || t === "class")
  ) {
    return true;
  }

  if ((p === ")" || p === "]") && (t === "{" || token.kind === "ident")) return true;
  return false;
};

/**
 * @param {string} code Source text.
 * @returns {string} The formatted text, ending in a newline.
 */
export const formatCode = (code) => {
  const normalized = code.replace(/\r\n?/g, "\n");
  const tokens = tokenize(normalized);
  const sourceLines = normalized.split("\n");

  // Emit as a token stream, not per source line. A token that spans several
  // lines carries its own interior newlines as literal text: the line a
  // following token starts on decides whether it joins the current output
  // line or opens a fresh one, so code after the token's end on its family
  // line is never lost and a covered line is never blanked. That is what
  // makes the formatter settle: formatting its own output re-tokenises to
  // the same stream and emits the same text.
  //
  // Indentation is the author's: a freshly started output line takes the
  // leading whitespace of the source line its first token came from.
  let ternary = 0;
  let prev = null;
  let prevPrev = null;
  let cur = "";
  const out = [];
  const closeLine = () => out.push(cur.replace(/[ \t]+$/, ""));
  if (tokens.length) {
    cur = (/^[ \t]*/.exec(sourceLines[tokens[0].line - 1] || "") || [""])[0];
  }
  for (const token of tokens) {
    let lineStart = false;
    if (token.newlinesBefore >= 1) {
      // One newline ends the line; each further one is a blank line. A
      // multi-line token's own interior is already inside its text, so only
      // the whitespace between tokens carries this count.
      const blanks = token.newlinesBefore - 1;
      closeLine();
      for (let k = 0; k < blanks; k++) out.push("");
      cur = (/^[ \t]*/.exec(sourceLines[token.line - 1] || "") || [""])[0];
      lineStart = true;
      // The first token on a fresh line never takes the inter-token space:
      // the newline already separated it from the previous token, however
      // long that token was.
      prev = null;
      prevPrev = null;
    }
    if (prev && needsSpace(prev, token, ternary, prevPrev)) cur += " ";
    cur += token.text;
    if (token.text === "?") ternary++;
    else if (token.text === ":" && ternary > 0) ternary--;
    prevPrev = prev;
    prev = token;
  }
  if (tokens.length) closeLine();
  while (out.length && out[out.length - 1] === "") out.pop();
  return out.join("\n") + "\n";
};

/**
 * @param {string} code
 * @returns {boolean} true when the text is already in canonical form.
 */
export const isFormatted = (code) => formatCode(code) === code;

export default { formatCode, isFormatted };
