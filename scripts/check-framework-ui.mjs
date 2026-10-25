#!/usr/bin/env node
/**
 * @file check-framework-ui.mjs
 * @description
 * Runs the clean-UI gate over the framework's own `src/`, so the defaults it
 * ships obey the rules it teaches an app.
 *
 * `flet-box check-ui` was written for app screens; nobody ran it on this repo,
 * and the drift it would have caught was real: a tab badge wrote white on the
 * signal red (2.77:1 in the dark theme), a ListTile description took the
 * "disabled" grey (2.57:1), a cancel button painted a second primary, and
 * eleven widget defaults sat off the spacing, radius or type scale. An app
 * cannot be more consistent than the widgets it is built from.
 *
 * The baseline (`scripts/framework-ui-baseline.json`) is shrink-only: every
 * entry carries the reason it is not a defect. A new finding fails the run, and
 * `--write-baseline` refuses to record one without a justification — a fresh
 * entry is a decision someone has to write down, not a snapshot.
 *
 * Usage:
 *   node scripts/check-framework-ui.mjs                  # fail on NEW findings
 *   node scripts/check-framework-ui.mjs --list            # print every finding
 *   node scripts/check-framework-ui.mjs --write-baseline  # snapshot current debt
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { checkUi } from "../bin/commands/checkUi.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const baselinePath = join(scriptDir, "framework-ui-baseline.json");

const args = process.argv.slice(2);
const writeBaseline = args.includes("--write-baseline");
const listAll = args.includes("--list");

/**
 * A line number is not part of the key: editing anything above a finding would
 * make the baseline churn and teach the next author to regenerate it blindly.
 * `file:code` is what the justification is actually about.
 */
const keyOf = (finding) =>
  `${relative(root, finding.file).split("\\").join("/")}:${finding.code}`;

const { findings } = await checkUi(["--root", root, "--json"], { print: () => {} });

const found = new Map();
for (const finding of findings) {
  const key = keyOf(finding);
  if (!found.has(key)) found.set(key, []);
  found.get(key).push(finding);
}

if (writeBaseline) {
  const previous = existsSync(baselinePath)
    ? JSON.parse(readFileSync(baselinePath, "utf8"))
    : {};
  const next = {};
  for (const key of [...found.keys()].sort()) {
    next[key] = previous[key] ?? "";
  }
  writeFileSync(baselinePath, JSON.stringify(next, null, 2) + "\n");
  const unjustified = Object.entries(next)
    .filter(([, why]) => !why.trim())
    .map(([key]) => key);
  console.log(
    `framework-ui-baseline.json escrito: ${found.size} hallazgo(s) en ${new Set([...found.keys()].map((k) => k.split(":")[0])).size} archivo(s).`,
  );
  if (unjustified.length) {
    console.log(
      `\nSin justificar (${unjustified.length}) — escribe el motivo en el JSON o arregla el hallazgo:`,
    );
    for (const key of unjustified) console.log(`  · ${key}`);
    process.exit(1);
  }
  process.exit(0);
}

const baseline = existsSync(baselinePath)
  ? JSON.parse(readFileSync(baselinePath, "utf8"))
  : {};

const fresh = [...found.keys()].filter((key) => !(key in baseline)).sort();
const stale = Object.keys(baseline)
  .filter((key) => !found.has(key))
  .sort();

const total = findings.length;
console.log(
  `\nFletBox framework-UI contract — ${total} hallazgo(s) en src/, ${Object.keys(baseline).length} aceptado(s)`,
);

if (listAll) {
  for (const [key, list] of [...found.entries()].sort()) {
    for (const finding of list) {
      const line = relative(root, finding.file).split("\\").join("/") + ":" + finding.line;
      console.log(`  ${line}  ${finding.code}  ${finding.message}`);
    }
  }
}

if (fresh.length) {
  console.log(`\nNUEVOS HALLAZGOS (${fresh.length}) — los defaults que el framework envía rompen su propia regla:`);
  for (const key of fresh) {
    for (const finding of found.get(key)) {
      console.log(`  · ${key.split(":")[0]}:${finding.line}  ${finding.code}`);
      console.log(`    ${finding.message}`);
      if (finding.detail) console.log(`    ${finding.detail}`);
    }
  }
  console.log(
    "\n  Arregla el default. Una entrada nueva en el baseline necesita el motivo escrito en el JSON.",
  );
}

if (stale.length) {
  console.log(
    `\n${stale.length} entrada(s) del baseline ya están resueltas — regenera con --write-baseline:`,
  );
  for (const key of stale) console.log(`  · ${key}`);
}

const failing = fresh.length > 0;
if (!failing) console.log("\n✔ los defaults del framework pasan su propia puerta");
process.exit(failing ? 1 : 0);
