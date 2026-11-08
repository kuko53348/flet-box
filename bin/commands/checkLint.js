/**
 * @file bin/commands/checkLint.js
 * @description The lint gate — the rules a formatter does not decide.
 *
 * `flet-box format` normalises the whitespace *between* tokens: an operator
 * takes its space, a call keeps its parens glued, a trailing space disappears.
 * It deliberately does not re-indent — indentation is the author's, and
 * re-deriving it from bracket depth cannot reproduce multi-line calls,
 * continuation lines and case labels without a layout engine. So four
 * findings need a rule of their own, and all four are mechanical:
 *
 *   TRAILING_WS    a line ends in a space or tab. The formatter rewrites the
 *                  line, so `flet-box format --write` fixes it — but a file
 *                  that earns it once earns it again, and the gate names it.
 *   TAB_INDENT     a line indents with a tab. Every other file in a project
 *                  indents with spaces (two), and a tab paints a different
 *                  width on the next editor that opens the file. Not
 *                  auto-fixed: the formatter never moves an indent.
 *   CRLF           the file mixes or uses CRLF line endings. The formatter
 *                  normalises them; the gate names the file so the change is
 *                  a decision, not an accident.
 *   NO_FINAL_NL    the file does not end in a newline. `git diff` paints the
 *                  marker, and POSIX text files end with one.
 *
 * Node core only: this file ships inside every app `flet-box create` builds.
 */

import fs from "node:fs";
import path from "node:path";
import { c } from "../utils/colors.js";
import { tokenize } from "../utils/jsTokenize.js";
import { syntaxFiles } from "./checkSyntax.js";

/**
 * One lint finding. The `lint` gate ships it to the report unchanged, so its
 * fields are the contract: a file, a position, the rule, the reading and the
 * fix.
 *
 * @typedef {{file: string, line: number, column: number, code: string, message: string, suggestion: string}} LintFinding
 */
export const LINT_CODES = {
  TRAILING_WS: "trailing whitespace",
  TAB_INDENT: "tab indentation",
  CRLF: "CRLF line endings",
  NO_FINAL_NL: "missing final newline",
};

/**
 * Findings for one source text. Pure: callers pass the file's text and decide
 * what to do with the findings, which is what makes the contract testable.
 *
 * @param {string} text
 * @returns {Omit<LintFinding, "file">[]} findings, without `file`
 */
export const lintText = (text) => {
  const findings = [];
  const add = (line, column, code, message, suggestion) =>
    findings.push({ line, column, code, message, suggestion });

  const lines = text.split("\n");
  // A whitespace that lives inside a multi-line string or comment is the
  // literal's content, not the line's style: `templates.js` ships a generated
  // screen as a template literal, and stripping a trailing space inside one
  // would change the screen the template generates.
  const covered = new Set();
  for (const token of tokenize(text)) {
    if (!token.spansLines) continue;
    const interior = (token.text.match(/\n/g) || []).length;
    for (let k = 1; k <= interior; k++) covered.add(token.line + k);
  }
  let firstCrlf = -1;
  let firstLoneCr = -1;
  for (let i = 0; i < lines.length; i++) {
    if (firstCrlf < 0 && lines[i].endsWith("\r")) firstCrlf = i + 1;
    if (firstLoneCr < 0 && lines[i].includes("\r")) firstLoneCr = i + 1;
    if (covered.has(i + 1)) continue;
    if (/[ \t]$/.test(lines[i])) {
      add(
        i + 1,
        lines[i].replace(/[ \t]+$/, "").length + 1,
        "TRAILING_WS",
        "this line ends with whitespace the formatter would remove",
        "run `flet-box format --write`, or delete the spaces",
      );
    }
    const lead = /^[\t ]*/.exec(lines[i])[0];
    if (lead.includes("\t")) {
      add(
        i + 1,
        lead.indexOf("\t") + 1,
        "TAB_INDENT",
        "this line is indented with a tab; the project uses two spaces",
        "replace the tab with two spaces per indent level",
      );
    }
  }
  // CRLF first: a CRLF file also ends every line with "\r", which TRAILING_WS
  // would otherwise double-report on every line.
  const crlf = firstCrlf >= 0 ? firstCrlf : firstLoneCr;
  if (crlf >= 0) {
    add(
      crlf,
      1,
      "CRLF",
      "this file uses CRLF line endings; the project uses LF",
      "run `flet-box format --write` to normalise them to LF",
    );
  }
  if (text.length && !text.endsWith("\n")) {
    add(
      lines.length,
      lines[lines.length - 1].length + 1,
      "NO_FINAL_NL",
      "this file does not end with a newline",
      "add one trailing newline (run `flet-box format --write`)",
    );
  }
  return findings;
};

/**
 * Lint every module the project owns.
 *
 * @param {string} root
 * @returns {Promise<LintFinding[]>} findings, each with an absolute `file`
 */
export const scanLint = async(root) => {
  const findings = [];
  for (const file of syntaxFiles(root)) {
    let text;
    try {
      text = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    for (const finding of lintText(text)) findings.push({ ...finding, file });
  }
  return findings.sort((a, b) =>
    a.file === b.file ? a.line - b.line || a.column - b.column : a.file.localeCompare(b.file),
  );
};

/**
 * `flet-box lint` — rules the formatter does not decide.
 *
 * @param {string[]} argv
 * @param {{print?: (line: string) => void}} [io]
 * @returns {Promise<{findings: LintFinding[], exitCode: number}>}
 */
export const checkLint = async(argv = [], io = {}) => {
  const print = io.print ?? ((line) => console.log(line));
  const rootIndex = argv.indexOf("--root");
  const root = path.resolve(
    rootIndex >= 0 && argv[rootIndex + 1] ? argv[rootIndex + 1] : process.cwd(),
  );
  const asJson = argv.includes("--json");

  const findings = await scanLint(root);
  if (asJson) {
    print(
      JSON.stringify(
        findings.map((finding) => ({
          ...finding,
          file: path.relative(root, finding.file).split(path.sep).join("/"),
        })),
        null,
        2,
      ),
    );
  } else if (!findings.length) {
    print(c("green", "✅ no lint findings"));
  } else {
    print(c("red", `❌ ${findings.length} lint finding(s)`));
    for (const finding of findings) {
      const file = path.relative(root, finding.file).split(path.sep).join("/");
      print(
        `  ${c("red", `${file}:${finding.line}:${finding.column}`)} ${c("gray", `[${finding.code}]`)} ${finding.message}`,
      );
      print(`    ${c("gray", `→ ${finding.suggestion}`)}`);
    }
  }
  return { findings, exitCode: findings.length ? 1 : 0 };
};

export default checkLint;
