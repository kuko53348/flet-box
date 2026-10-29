/**
 * @file doc-table-audit.mjs
 * Parses the prop tables in docs/widget/*.md and flags every documented prop
 * that neither the registry nor the widget implementation nor index.d.ts knows:
 * the "phantom row" class of defect. Static checkers miss these because their
 * fixtures never pass the prop, so `UNKNOWN=0` says nothing about the docs.
 *
 * A phantom is a docs/registry defect, NOT a widget bug, until Chrome proves
 * otherwise: confirm each row with prop-probe.mjs before reporting it.
 *
 * Usage:
 *   node doc-table-audit.mjs              # summary
 *   node doc-table-audit.mjs --full       # every occurrence with its page
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { resolveRoot } from "./lib.mjs";

const root = resolveRoot();
const showFull = process.argv.includes("--full");
// --docs points the scanner at a scratch copy of docs/widget, for the negative
// control, without touching what the repo publishes.
const docsArg = process.argv.indexOf("--docs");
const docsDir =
  docsArg !== -1 && process.argv[docsArg + 1]
    ? resolve(process.argv[docsArg + 1])
    : join(root, "docs", "widget");
const { PROP_MAP } = await import(join(root, "src", "widget-factory", "translateProps.js"));

const registry = new Set(Object.keys(PROP_MAP));
const dts = readFileSync(join(root, "src", "index.d.ts"), "utf8");
const declaredInTypes = (name) => new RegExp(`^\\s*${name}\\??\\s*[:,]`, "m").test(dts);

// Widget source corpus, comments blanked so prose cannot make a prop look read.
const blankComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/^\s*\/\/.*$/gm, " ");
const sourceDirs = ["src/widgets", "src/navigations", "src/widget-factory", "src/utils", "src/tools"];
const corpus = sourceDirs
  .flatMap((dir) => {
    try {
      return readdirSync(join(root, dir)).map((f) => readFileSync(join(root, dir, f), "utf8"));
    } catch {
      return [];
    }
  })
  .map(blankComments)
  .join("\n");

const QUOTE_CHARS = '["\'`]';
const readInSource = (name) => {
  const id = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = ["\\.\\s*" + id + "\\b", "\\b" + id + "\\s*=\\s*[^=]", QUOTE_CHARS + id + QUOTE_CHARS].join("|");
  return new RegExp(pattern).test(corpus);
};

const ROW = /^\|\s*`([A-Za-z_$][\w$]*)`\s*\|/;
const rows = [];
for (const file of readdirSync(docsDir).filter((f) => f.endsWith(".md"))) {
  const text = readFileSync(join(docsDir, file), "utf8");
  for (const line of text.split("\n")) {
    const m = ROW.exec(line);
    if (m) rows.push({ page: file, prop: m[1] });
  }
}

const isLive = (prop) => registry.has(prop) || declaredInTypes(prop) || readInSource(prop);
const phantoms = rows.filter((r) => !isLive(r.prop));
const byProp = new Map();
for (const r of phantoms) {
  if (!byProp.has(r.prop)) byProp.set(r.prop, []);
  byProp.get(r.prop).push(r.page);
}

console.log(`pages: ${new Set(rows.map((r) => r.page)).size} | prop table rows: ${rows.length}`);
console.log(`phantom rows (documented, nothing reads them): ${byProp.size} distinct / ${phantoms.length} occurrences`);
for (const [prop, pages] of byProp) {
  console.log(`  · ${prop}  (${pages.length} pages)${showFull ? "\n      " + [...new Set(pages)].join("\n      ") : ""}`);
}
if (!phantoms.length) console.log("  none");
