#!/usr/bin/env node
/**
 * Cross-file duplicate-function report for a JavaScript tree.
 *
 * A line-similarity tool says `Checkbox` and `Radio` share 25% of their lines,
 * which is not a duplicate: they share a layout idea. This compares the
 * *normalised body* of every function in two or more files, so a hit means the
 * same code, not the same shape.
 *
 * The report is evidence for a decision, not a gate: exit 0 whether or not it
 * finds anything. The gate that keeps the extraction in place belongs in the
 * repo (`scripts/check-shared-helpers.mjs` in flet-box).
 *
 * Usage:
 *   node find-duplicate-functions.mjs --root <checkout> [--min-lines 3] [--min-chars 60]
 *   node find-duplicate-functions.mjs --root <copy> --ts <path/to/lib/typescript.js>
 *
 * Why the `--ts` flag exists: flet-box's devDependency is TypeScript 7, whose
 * package ships `lib/tsc.js` (the native compiler) and no classic compiler API.
 * The scanner therefore accepts a TypeScript 5-or-older `lib/typescript.js`,
 * passed explicitly or found beside the checkout (a sibling install, which is a
 * property of the machine and never a dependency of this skill).
 *
 * Thresholds: run >= 5 lines first to see the loud duplicates, then >= 3 before
 * declaring the tree clean — the second pass is what found the 5-line focus
 * release wrapper pasted into three overlays.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};

const root = path.resolve(opt("--root", "."));
const srcDir = path.join(root, "src");
const minLines = Number(opt("--min-lines", "3"));
const minChars = Number(opt("--min-chars", "60"));

if (!fs.existsSync(srcDir)) {
  console.error(`find-duplicate-functions: no src/ under ${root}`);
  process.exit(1);
}

const require = createRequire(path.join(root, "noop.js"));

// TypeScript 5 or older may be installed beside the checkout rather than inside
// it. Which sibling that is belongs to the machine, so the scan names none.
const siblingTypeScript = () => {
  const parent = path.dirname(root);
  try {
    return fs
      .readdirSync(parent, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(parent, entry.name, "node_modules", "typescript", "lib", "typescript.js"))
      .filter((candidate) => fs.existsSync(candidate));
  } catch {
    return [];
  }
};

const candidates = [
  opt("--ts", null),
  process.env.FLETBOX_TS || null,
  path.join(root, "node_modules", "typescript", "lib", "typescript.js"),
  ...siblingTypeScript(),
  "typescript",
].filter(Boolean);

let ts = null;
let tsPath = null;
for (const candidate of candidates) {
  try {
    const loaded = require(candidate);
    if (typeof loaded.createSourceFile !== "function") continue;
    ts = loaded;
    tsPath = candidate;
    break;
  } catch {
    // Next candidate: a missing file and a package without the compiler API are
    // both "this one cannot answer", not a reason to stop.
  }
}

if (!ts) {
  console.error(
    "find-duplicate-functions: no TypeScript compiler API found.\n" +
      "  TypeScript 7 ships the native compiler only (lib/tsc.js, no createSourceFile);\n" +
      "  this scanner needs a TypeScript 5-or-older lib/typescript.js. Pass it explicitly:\n" +
      "    --ts /path/to/node_modules/typescript/lib/typescript.js\n" +
      "  or set FLETBOX_TS to that path.",
  );
  process.exit(2);
}

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "node_modules" ? [] : walk(full);
    return entry.name.endsWith(".js") || entry.name.endsWith(".mjs") ? [full] : [];
  });

const normalise = (text) =>
  text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\s+/g, "");

const files = walk(srcDir);
const groups = new Map();

for (const file of files) {
  const source = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.ES2020, true, ts.ScriptKind.JS);
  const relative = path.relative(root, file);

  const visit = (node) => {
    const isFunction =
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node) ||
      ts.isMethodDeclaration(node);
    if (isFunction && node.body) {
      const body = normalise(node.body.getText(sf));
      const first = sf.getLineAndCharacterOfPosition(node.body.getStart()).line;
      const last = sf.getLineAndCharacterOfPosition(node.body.getEnd()).line;
      const lines = last - first + 1;
      if (lines >= minLines && body.length >= minChars) {
        let name = node.name && ts.isIdentifier(node.name) ? node.name.text : "";
        if (!name && node.parent && ts.isVariableDeclaration(node.parent) && ts.isIdentifier(node.parent.name)) {
          name = node.parent.name.text;
        }
        const hit = { file: relative, line: first + 1, name: name || "(anon)", lines };
        groups.set(body, [...(groups.get(body) || []), hit]);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

const hits = [...groups.values()]
  .filter((group) => new Set(group.map((item) => item.file)).size >= 2)
  .sort((a, b) => b[0].lines - a[0].lines || b.length - a.length);

console.log(`compiler: ${tsPath} (${ts.version})`);
console.log(`scanned: ${files.length} files under ${path.relative(process.cwd(), srcDir) || "."}`);
console.log(`cross-file identical bodies (>=${minLines} lines, >=${minChars} chars): ${hits.length}`);

for (const group of hits) {
  console.log(`\n  ${group[0].lines} lines x${group.length}:`);
  for (const item of group) console.log(`    ${item.file}:${item.line}  ${item.name}`);
}

if (hits.length) {
  console.log(
    "\n  Read each group before extracting: an identical body can still have a different\n" +
      "  contract (different escaping set, different fallback). Same behaviour, one module.\n",
  );
}
