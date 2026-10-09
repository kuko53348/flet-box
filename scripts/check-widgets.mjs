#!/usr/bin/env node
/**
 * @file check-widgets.mjs
 * @description
 * Static contract checker for the FletBox widget library. It enforces the
 * canonical widget structure documented in `docs/guides/widget-structure.md`
 * so every new widget is written the same modular way and no Tier C regression
 * slips back in.
 *
 * Usage:
 *   node scripts/check-widgets.mjs                # check, fail on NEW violations
 *   node scripts/check-widgets.mjs --write-baseline  # snapshot current state
 *   node scripts/check-widgets.mjs --list          # print per-file violations
 *
 * The baseline (`scripts/widget-contract-baseline.json`) records the widgets
 * that predate the contract. Refactors should shrink it; adding a widget to it
 * is never the fix.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const widgetsDir = join(root, "src/widgets");
const baselinePath = join(scriptDir, "widget-contract-baseline.json");

/**
 * Each check receives the widget source and returns `true` when the file
 * complies. Keep these name-based so a failure points to the exact rule.
 */
const CHECKS = {
  "@file-header": {
    test: (src) => /@file/.test(src),
    hint: "add a `/** @file <Name>.js */` header describing the widget",
  },
  "default-export": {
    test: (src) => /export default\s+\w+/.test(src),
    hint: "export the widget as `export default <Name>`",
  },
  "no-update-overwrite": {
    test: (src) => !/^\s*[\w$.]+\.update\s*=\s*/m.test(src),
    hint: "compose with the factory update via `composeUpdate()` instead of overwriting `container.update`",
  },
  "no-global-style": {
    test: (src) => !/document\.head\.appendChild/.test(src),
    hint: "scope injected styles with `<style data-widget=\"<Name>\">` and remove them on `onUnmount`",
  },
  "no-style-prop": {
    test: (src) => !/\bstyle\s*:/.test(src),
    hint: "pass CSS props flat and aliased (backgroundColor, padding, flexDirection); `style: {...}` is not part of the API",
  },
  "no-console": {
    test: (src) => !/\bconsole\.log\s*\(/.test(src),
    hint: "remove debug output (`console.log`); use `console.warn`/`console.error` only for real diagnostics",
  },
  "widget-name": {
    test: (src) => /widgetName:\s*["'`]/.test(src),
    hint: "pass `widgetName: \"<Name>\"` to the root `WidgetFactory` call so Inspector shows the real name",
  },
  "no-cleanup-chain": {
    test: (src) => !/\._cleanup\s*=\s*/.test(src),
    hint: "register resource release with `container.onUnmount(fn)` (idempotent), not `_cleanup` monkey-patching",
  },
};

const args = process.argv.slice(2);
const writeBaseline = args.includes("--write-baseline");
const listAll = args.includes("--list");

// Files that are not widgets and therefore exempt from the shape rules:
// Inspector is a debug utility, controller widgets return objects instead of
// an element (they manage transient UI outside the tree).
const NON_WIDGET_FILES = new Set(["Inspector.js"]);
const CONTROLLER_FILES = new Set([
  "AlertDialog.js",
  "SnackBar.js",
  "BottomSheet.js",
  "Modal.js",
]);

const files = readdirSync(widgetsDir)
  .filter((f) => f.endsWith(".js") && f !== "index.js" && !NON_WIDGET_FILES.has(f))
  .sort();

/** @returns {Record<string, string[]>} file → failing check names */
const collectViolations = () => {
  const violations = {};
  for (const file of files) {
    const src = readFileSync(join(widgetsDir, file), "utf8");
    const failing = Object.entries(CHECKS)
      .filter(([name, check]) => {
        // Controllers have no single element root, so `widgetName` does not apply.
        if (name === "widget-name" && CONTROLLER_FILES.has(file)) return false;
        return !check.test(src);
      })
      .map(([name]) => name);
    if (failing.length) violations[file] = failing;
  }
  return violations;
};

const violations = collectViolations();

if (writeBaseline) {
  writeFileSync(baselinePath, JSON.stringify(violations, null, 2) + "\n");
  const total = Object.values(violations).reduce((n, v) => n + v.length, 0);
  console.log(`Baseline escrito: ${Object.keys(violations).length} archivos, ${total} violaciones.`);
  process.exit(0);
}

const baseline = existsSync(baselinePath)
  ? JSON.parse(readFileSync(baselinePath, "utf8"))
  : {};

const newViolations = [];
const staleBaseline = [];
const errors = [];

for (const [file, failing] of Object.entries(violations)) {
  const allowed = new Set(baseline[file] || []);
  for (const check of failing) {
    if (!allowed.has(check)) newViolations.push({ file, check, hint: CHECKS[check].hint });
  }
}

// Stale entries: baselined violations that are now fixed. Surfaced so the
// baseline can be regenerated and keeps shrinking as widgets are refactored.
for (const [file, allowed] of Object.entries(baseline)) {
  const failing = new Set(violations[file] || []);
  for (const check of allowed) {
    if (!failing.has(check)) staleBaseline.push({ file, check });
  }
}

const nonCompliant = Object.keys(violations).length;

if (listAll) {
  for (const [file, failing] of Object.entries(violations)) {
    console.log(`${file}: ${failing.join(", ")}`);
  }
}

console.log(
  `\nFletBox widget contract — ${files.length} archivos · ${nonCompliant} con deuda técnica (baseline)`,
);

if (staleBaseline.length) {
  console.log(
    `\n${staleBaseline.length} entradas del baseline ya están resueltas — regenera con --write-baseline:`,
  );
  for (const { file, check } of staleBaseline) console.log(`  · ${file}: ${check}`);
}

if (newViolations.length) {
  console.error(`\n${newViolations.length} violación(es) NUEVA(s) del contrato:\n`);
  for (const { file, check, hint } of newViolations) {
    console.error(`  ✗ ${file} → ${check}\n    ${hint}`);
  }
  process.exit(1);
}

console.log("\nSin violaciones nuevas del contrato. ✔");
