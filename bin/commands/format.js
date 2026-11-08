/**
 * @file bin/commands/format.js
 * @description The formatter gate and the formatter command, one scan.
 *
 * `bin/utils/jsFormat.js` knows how to normalise one file's whitespace. This
 * command decides what a project does with that knowledge: report every file
 * the formatter would change (`FORMAT_NEEDED`), or rewrite them
 * (`--write`). The verify gate runs the read-only half, so a `verify` run can
 * say "this file is not canonical" without ever touching it.
 *
 * ```bash
 * flet-box format            # list files that need formatting (exit 1 if any)
 * flet-box format --write    # rewrite them in place
 * flet-box format --json     # machine-readable findings
 * flet-box format --root DIR # work on another project
 * ```
 *
 * Node core only: this file ships inside every app `flet-box create` builds.
 */

import fs from "node:fs";
import path from "node:path";
import { c } from "../utils/colors.js";
import { formatCode } from "../utils/jsFormat.js";
import { syntaxFiles } from "./checkSyntax.js";

/**
 * The formatting plan for one file: what is there, what should be there, and
 * whether the two differ.
 *
 * @typedef {{file: string, needs: boolean, original: string, formatted: string}} FormatPlan
 */
export const FORMAT_CODES = { FORMAT_NEEDED: "not formatted" };

/**
 * One file, formatted or not. Pure apart from reading the file, so the check
 * is testable without touching the tree.
 *
 * @param {string} file Absolute path.
 * @returns {FormatPlan|null}
 *   null when the file cannot be read.
 */
export const planFormat = (file) => {
  let original;
  try {
    original = fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
  const formatted = formatCode(original);
  return { file, needs: formatted !== original, original, formatted };
};

/**
 * Every module the project owns, with its formatting plan.
 *
 * @param {string} root
 * @returns {FormatPlan[]}
 */
export const scanFormat = (root) =>
  syntaxFiles(root).map(planFormat).filter(Boolean);

/**
 * The read-only gate `verify` runs: one finding per file to format.
 *
 * @param {string} root
 * @returns {object[]} findings, each with an absolute `file`
 */
export const scanFormatNeeded = (root) =>
  scanFormat(root)
    .filter((plan) => plan.needs)
    .map((plan) => ({
      file: plan.file,
      line: 1,
      column: 1,
      code: "FORMAT_NEEDED",
      message: "this file is not in canonical form",
      suggestion: "run `flet-box format --write`",
    }));

/**
 * `flet-box format [--write] [--root DIR] [--json]`
 *
 * @param {string[]} argv
 * @param {{print?: (line: string) => void}} [io]
 * @returns {Promise<{findings: object[], exitCode: number}>}
 */
export const formatFiles = async(argv = [], io = {}) => {
  const print = io.print ?? ((line) => console.log(line));
  const rootIndex = argv.indexOf("--root");
  const root = path.resolve(
    rootIndex >= 0 && argv[rootIndex + 1] ? argv[rootIndex + 1] : process.cwd(),
  );
  const asJson = argv.includes("--json");
  const write = argv.includes("--write");

  const plans = scanFormat(root);
  const findings = plans
    .filter((plan) => plan.needs)
    .map((plan) => ({
      file: plan.file,
      code: "FORMAT_NEEDED",
      message: "this file is not in canonical form",
    }));

  if (write) {
    let count = 0;
    for (const plan of plans) {
      if (!plan.needs) continue;
      fs.writeFileSync(plan.file, plan.formatted, "utf8");
      count++;
    }
    if (asJson) {
      print(JSON.stringify({ written: count, findings: findings.length }, null, 2));
    } else if (count) {
      print(c("green", `✅ formatted ${count} file(s)`));
    } else {
      print(c("green", "✅ nothing to format"));
    }
    return { findings, exitCode: 0 };
  }

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
    print(c("green", "✅ all files are formatted"));
  } else {
    print(c("red", `❌ ${findings.length} file(s) need formatting`));
    for (const finding of findings) {
      const file = path.relative(root, finding.file).split(path.sep).join("/");
      print(`  ${c("red", file)} ${c("gray", `[${finding.code}]`)} ${finding.message}`);
      print(`    ${c("gray", "→ run `flet-box format --write`")}`);
    }
  }
  return { findings, exitCode: findings.length ? 1 : 0 };
};

export default formatFiles;
