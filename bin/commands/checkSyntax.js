/**
 * @file bin/commands/checkSyntax.js
 * @description The parse gate — every module is handed to the parser Node runs.
 *
 * The other gates read code as text: `check-api` resolves names, `check-ui`
 * scans literals, `check-structure` follows imports. None of them compiles a
 * file, so a missing brace or an unclosed backtick passed all four and the app
 * failed in the browser with a blank screen and one console line — after an
 * agent had already been told the code was legal.
 *
 * `node --check` is the parser the runtime itself uses, run through
 * `process.execPath` so the gate cannot be kinder than the Node that will load
 * the file. It parses without executing, which matters: importing an app module
 * in a check would run its side effects and need a DOM.
 *
 * A failure carries the file, the line, the column, the source line with a
 * caret under the character the parser stopped at, and a suggestion drawn from
 * the message. The suggestion is the point: an agent reads "a backtick is never
 * closed" and fixes the line, instead of reading `Unexpected token` and
 * guessing.
 *
 * Node core only: this file ships inside every app `flet-box create` builds.
 */

import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";

export const SYNTAX_CODES = { SYNTAX_ERROR: "error" };

/** Build output, dependencies and another toolchain's sources. */
const IGNORED_FOLDERS = new Set([
  "node_modules",
  "www",
  "dist",
  "build",
  "coverage",
  "android",
  "ios",
  "Pods",
  "DerivedData",
]);

/**
 * Hidden folders that are a database or somebody else's cache. Everything else
 * that starts with a dot is walked: `.qoder/skills`, `.claude/skills` and
 * `.fletbox` hold scripts this project runs, and skipping every dot-folder let a
 * broken probe live in the repo without the gate that exists to parse it.
 */
const HIDDEN_IGNORED = new Set([
  ".git",
  ".hg",
  ".svn",
  ".cache",
  ".next",
  ".nuxt",
  ".output",
  ".turbo",
  ".yarn",
  ".pnpm-store",
  ".venv",
  ".idea",
]);

const MODULE_FILE = /\.(?:mjs|cjs|js)$/;

/**
 * The recurring parse errors, and what the line above usually got wrong.
 *
 * Only the message is matched — the caret and the source line are the parser's
 * own and are printed as it wrote them.
 */
const HINTS = [
  [
    /Unexpected end of input|Unexpected token '\}'/,
    "a brace, bracket or parenthesis opens and never closes — start at the unclosed block above this line",
  ],
  [
    /missing \) after argument list/,
    "a call is not closed — count the parentheses of the call that ends on this line",
  ],
  [
    /missing \} after/,
    "a block or an object literal is not closed — find the '{' this line was meant to close",
  ],
  [
    /Unterminated template/,
    "a backtick is never closed — and a backtick inside a template literal must be escaped",
  ],
  [/Unterminated string/, "a quote is never closed on that line"],
  [
    /Cannot use import statement outside a module|Unexpected token 'export'|Unexpected token 'import'/,
    'the file is parsed as CommonJS — package.json needs "type": "module"',
  ],
  [
    /Invalid or unexpected token/,
    "a character the parser cannot read — a smart quote, a non-breaking space or a backtick that only looks like the ASCII one",
  ],
  [
    /Identifier '.*' has already been declared/,
    "the same name is declared twice in one scope — rename one of them",
  ],
  [
    /Unexpected identifier/,
    "a comma, an operator or a closing bracket is missing on the line before",
  ],
  [
    /Invalid left-hand side/,
    "the left of '=' cannot be assigned — it is a call, a literal or a `const`",
  ],
  [/Missing semicolon/, "two statements are not separated"],
];

/**
 * Every module a project owns, sorted, with build output left out.
 *
 * Symlinked folders are not followed: a link back up the tree would loop, and
 * a linked dependency is not the project's own code.
 *
 * Hidden folders are walked, because a script under `.qoder/skills` or
 * `.claude/skills` is code the project runs. Only the database and the vendor
 * caches in HIDDEN_IGNORED are skipped.
 *
 * @param {string} root
 * @returns {string[]}
 */
export const syntaxFiles = (root) => {
  const files = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (HIDDEN_IGNORED.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_FOLDERS.has(entry.name)) walk(full);
      } else if (entry.isFile() && MODULE_FILE.test(entry.name)) {
        files.push(full);
      }
    }
  };
  walk(root);
  return files.sort();
};

/**
 * The hint a parse message deserves.
 *
 * @param {string} message
 * @returns {string}
 */
const hintFor = (message) =>
  HINTS.find(([pattern]) => pattern.test(message))?.[1] ??
  "the parser stopped at the marked character — the cause is on that line or the one above";

/**
 * Read `node --check` output into a finding.
 *
 * @param {string} file Absolute path, as it was passed to the parser.
 * @param {string} stderr
 * @returns {object|null} null when the output does not name the file
 */
export const parseFailure = (file, stderr) => {
  const lines = String(stderr).split(/\r?\n/);
  // The parser prints the path it resolved, which on macOS can differ from the
  // one we passed (`/var` is `/private/var`), so the file is matched by name:
  // one process parses one file, and its header is the first line that says so.
  const base = path.basename(file);
  const header = lines.findIndex((line) => {
    const match = line.match(/^(.*):(\d+)$/);
    return Boolean(match) && path.basename(match[1]) === base;
  });
  if (header < 0) return null;
  const line = Number(lines[header].match(/:(\d+)$/)[1]);
  const source = lines[header + 1] ?? "";
  const caretLine = lines[header + 2] ?? "";
  const column = caretLine.indexOf("^") + 1;
  const errorLine = lines.slice(header + 2).find((text) => /^\w*Error: /.test(text)) ?? "";
  const message = errorLine.replace(/^\w*Error: /, "").trim() || "the file does not parse";
  return {
    code: "SYNTAX_ERROR",
    file,
    line,
    column,
    message,
    detail: source ? `${source}\n${column > 0 ? " ".repeat(column - 1) : ""}^` : "",
    suggestion: hintFor(message),
  };
};

/**
 * Sharpen a parse failure with what only the file can tell.
 *
 * `Unexpected end of input` is what a backtick that never closes looks like
 * from the parser's side — the template literal swallows the rest of the file
 * and the end arrives inside it. The parity of the backticks says which one it
 * is, and that is the hint that fixes the line in one edit.
 *
 * @param {object} failure
 * @param {string} file
 * @returns {object}
 */
const refine = (failure, file) => {
  if (!/Unexpected end of input/.test(failure.message)) return failure;
  let text = "";
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    return failure;
  }
  const backticks = text.split("`").length - 1;
  if (backticks % 2 === 0) return failure;
  return {
    ...failure,
    suggestion:
      "a backtick opens and never closes — the template literal swallows everything below it",
  };
};

/**
 * Parse one module. Resolves to a finding, or null when it parses.
 *
 * @param {string} file
 * @returns {Promise<object|null>}
 */
const checkOne = (file) =>
  new Promise((resolve) => {
    execFile(
      process.execPath,
      ["--check", file],
      { timeout: 20000 },
      (error, _stdout, stderr) => {
        if (!error) {
          resolve(null);
          return;
        }
        const failure = parseFailure(file, stderr);
        resolve(
          failure
            ? refine(failure, file)
            : {
                code: "SYNTAX_ERROR",
                file,
                line: 0,
                column: 0,
                message: error.message,
                detail: "",
                suggestion: "the parser could not run — try `node --check` on that file yourself",
              },
        );
      },
    );
  });

/**
 * Run a worker over a list with a fixed number of slots.
 *
 * @template T, R
 * @param {T[]} items
 * @param {number} slots
 * @param {(item: T) => Promise<R>} worker
 * @returns {Promise<R[]>}
 */
const pool = async (items, slots, worker) => {
  const results = new Array(items.length);
  let next = 0;
  const run = async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await worker(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(slots, items.length) }, run));
  return results;
};

/**
 * Parse every module of a project.
 *
 * @param {string} root
 * @param {{concurrency?: number}} [options]
 * @returns {Promise<object[]>}
 */
export const scanSyntax = async (root, { concurrency = 8 } = {}) => {
  const files = syntaxFiles(root);
  const findings = (await pool(files, concurrency, checkOne)).filter(Boolean);
  return findings.sort((a, b) => (a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file)));
};
