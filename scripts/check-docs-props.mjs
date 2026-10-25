#!/usr/bin/env node
/**
 * @file check-docs-props.mjs
 * @description
 * Guards the documentation surface (`docs/widget/*.md` prop tables) against the
 * runtime, so a documented prop can never be a promise the framework does not
 * keep. It closes the gap `check-prop-registry.mjs` leaves open: that script
 * starts from the registry and from call sites, so a prop that exists only in
 * prose and in `src/index.d.ts` — never in the registry, never read by a widget
 * — is invisible to it. That is exactly how `visible`, `wrap: true`,
 * `passwordToggle` and `alignment` shipped as documented-but-dead props.
 *
 * Findings:
 *   DOC_NOT_DECLARED a docs table row is absent from the widget's `*Props`
 *                    interface: the generator was bypassed or hand-edited a page.
 *   DECLARED_NOT_DOC the reverse: the type offers a prop the page never documents.
 *   DEAD             a documented prop the engine cannot classify and no
 *                    implementation (or delegate) reads -> it does nothing.
 *   BOOL_STYLE       a documented `boolean` that maps to a CSS property without
 *                    `boolValues`: `true` becomes `1` in the stylesheet, which is
 *                    a lie for keyword-valued properties (`flex-wrap`).
 *
 * Usage:
 *   node scripts/check-docs-props.mjs            # summary, exit 1 on DEAD/BOOL_STYLE
 *   node scripts/check-docs-props.mjs --full     # list every finding
 *   node scripts/check-docs-props.mjs --json     # machine-readable
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_PROPS } from "../src/widget-factory/translateProps.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const docsDir = join(root, "docs", "widget");

const args = process.argv.slice(2);
const showFull = args.includes("--full");
const asJson = args.includes("--json");

/** Pages that document something other than a single widget implementation. */
const SKIP_PAGES = new Set([
  "README.md",
  "START_HERE.md",
  "COMMON_PROPS.md",
  "_template.md",
]);

/**
 * Keys the engine consumes on its own, whatever the widget does with them.
 * Mirrors `ENGINE_HANDLED` in `check-prop-registry.mjs`; keep the two in step.
 */
const ENGINE_HANDLED = new Set([
  "tag",
  "widgetName",
  "child",
  "children",
  "ref",
  "data",
  "disableTransform",
  "value",
  "variant",
  "visible",
]);

/**
 * Props that live on the engine but are written by `assignProps`/`effects.js`
 * directly instead of through a registry entry.
 */
const engineText = [
  "assignProps.js",
  "processProps.js",
  "widgetFactory.js",
  "WidgetFactory.js",
  "effects.js",
  "reactiveValue.js",
  "stackPosition.js",
  "defineReactiveProps.js",
  "translateProps.js",
]
  .map((f) => {
    try {
      return readFileSync(join(root, "src/widget-factory", f), "utf8");
    } catch {
      return "";
    }
  })
  .join("\n");

// ---------------------------------------------------------------------------
// 1. Registry
// ---------------------------------------------------------------------------
const PROP_MAP = new Map();
for (const def of ALL_PROPS) {
  // Alias pairs register the same prop more than once; the first entry defines
  // the routing, so keep it and ignore the duplicate rather than letting the
  // last one silently win.
  if (!PROP_MAP.has(def.prop)) PROP_MAP.set(def.prop, def);
}

// ---------------------------------------------------------------------------
// 2. Declared API (index.d.ts)
// ---------------------------------------------------------------------------
const dts = readFileSync(join(root, "src", "index.d.ts"), "utf8");

function matchBalanced(text, openIdx, open, close) {
  let depth = 0;
  for (let i = openIdx; i < text.length; i++) {
    if (text[i] === open) depth++;
    else if (text[i] === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

const interfaces = new Map();
{
  const ifaceRe = /interface\s+(\w+)\s*(extends\s+[A-Za-z_$][\w$]*[^{]*)?\{/g;
  let im;
  while ((im = ifaceRe.exec(dts))) {
    const open = dts.indexOf("{", im.index + im[0].length - 1);
    const close = matchBalanced(dts, open, "{", "}");
    if (close === -1) continue;
    const props = new Map();
    for (
      const m of dts
        .slice(open + 1, close)
        .matchAll(/^\s*([A-Za-z_$][\w$]*)\??\s*:\s*([^;\n]+)/gm)
    ) {
      props.set(m[1], m[2].trim());
    }
    interfaces.set(im[1], { props, parents: parseExtends(im[2]) });
    ifaceRe.lastIndex = close;
  }
}

/**
 * `extends CommonProps`, `extends A, B` and `extends Omit<ListViewProps, 'a' | 'b'>`
 * all appear in this file; `Omit<…>` has to be unpacked or the inherited props
 * look undeclared (that is how GridView's whole table read as phantom).
 */
function parseExtends(clause) {
  const out = [];
  if (!clause) return out;
  for (const m of clause.matchAll(/\bOmit<\s*([A-Za-z_$][\w$]*)\s*,\s*([^>]*?)>/g)) {
    out.push({
      name: m[1],
      omit: new Set([...m[2].matchAll(/['"]([^'"]+)['"]/g)].map((q) => q[1])),
    });
  }
  const bare = clause
    .replace(/Omit<[^>]*>/g, "")
    .match(/[A-Za-z_$][\w$]*/g);
  for (const name of bare ?? []) out.push({ name, omit: new Set() });
  return out;
}

function interfaceProps(name, seen = new Set(), omit = new Set()) {
  const iface = interfaces.get(name);
  if (!iface || seen.has(name)) return new Map();
  seen.add(name);
  const out = new Map();
  for (const parent of iface.parents) {
    for (const [k, v] of interfaceProps(parent.name, seen, parent.omit)) {
      if (!omit.has(k)) out.set(k, v);
    }
  }
  for (const [k, v] of iface.props) if (!omit.has(k)) out.set(k, v);
  return out;
}

const COMMON_PROPS = interfaceProps("CommonProps");

// ---------------------------------------------------------------------------
// 3. Implementations: what each widget (and anything it delegates to) reads
// ---------------------------------------------------------------------------
const IMPL_DIRS = ["widgets", "navigations", "animations"];

/** Resolve a doc page name to its implementation file. */
function implPath(name) {
  for (const dir of IMPL_DIRS) {
    const p = join(root, "src", dir, `${name}.js`);
    if (existsSync(p)) return { path: p, rel: `${dir}/${name}.js` };
  }
  return null;
}

/**
 * Source text that can legitimately consume a prop: the widget itself plus every
 * widget it forwards its leftover props into. `GridView` is a thin wrapper around
 * `ListView`, so a prop GridView spreads is not dead just because the word never
 * appears in `GridView.js`.
 */
function reachableText(name, seen = new Set()) {
  if (seen.has(name)) return "";
  seen.add(name);
  const impl = implPath(name);
  if (!impl) return "";
  const src = readFileSync(impl.path, "utf8");
  let out = src;
  for (const m of src.matchAll(/\.\.\.\s*(rest|props|filteredProps|widgetProps|baseProps)\b/g)) {
    const call = src.slice(0, m.index).match(/([A-Z][\w$]*)\s*\(\s*\{[^{}]*$/);
    if (!call) continue;
    const callee = call[1];
    if (callee === "WidgetFactory") {
      out += engineText;
      continue;
    }
    out += reachableText(callee, seen);
  }
  return out;
}

/** Every implementation source, for the engine-wide "is this word used?" test. */
const allImplText = [];
for (const dir of IMPL_DIRS) {
  const abs = join(root, "src", dir);
  for (const f of readdirSync(abs)) {
    if (f.endsWith(".js") && f !== "index.js") {
      allImplText.push(readFileSync(join(abs, f), "utf8"));
    }
  }
}
const IMPL_CORPUS = allImplText.join("\n");

const isReadIn = (text, prop) =>
  new RegExp(
    `\\b${prop.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
  ).test(stripComments(text));

/**
 * Comments blanked, offsets otherwise preserved. A widget's own JSDoc block
 * lists every prop it accepts, so matching against raw source would let a
 * documented-but-unread prop pass as "read" simply because it is written down.
 * String bodies stay: shorthand destructuring and object keys are what this
 * predicate is really after, and dropping strings would not remove any of them.
 */
function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/^[ \t]*\/\/.*$/gm, "");
}

// ---------------------------------------------------------------------------
// 4. Docs tables
// ---------------------------------------------------------------------------
/** Read the prop names out of the `| \`prop\` | type | description |` rows. */
function documentedProps(md) {
  const own = new Set();
  const common = new Set();
  let section = "";
  for (const line of md.split("\n")) {
    const h = /^##+\s+(.*)$/.exec(line);
    if (h) section = h[1].trim().toLowerCase();
    const row = /^\|\s*`([A-Za-z_$][\w$]*)`\s*\|/.exec(line);
    if (!row) continue;
    (section.includes("common") ? common : own).add(row[1]);
  }
  return { own, common };
}

const findings = { DOC_NOT_DECLARED: [], DECLARED_NOT_DOC: [], DEAD: [], BOOL_STYLE: [] };
const pages = readdirSync(docsDir)
  .filter((f) => f.endsWith(".md") && !SKIP_PAGES.has(f))
  .sort();

for (const page of pages) {
  const name = basename(page, ".md");
  const md = readFileSync(join(docsDir, page), "utf8");
  const { own } = documentedProps(md);
  const impl = implPath(name);

  const ifaceName = `${name}Props`;
  const declared = interfaces.has(ifaceName) ? interfaceProps(ifaceName) : null;

  // 4a. docs vs the declared type. The generator derives the table from
  // `index.d.ts`, so any difference means the page or the type was edited by hand.
  if (declared) {
    for (const prop of own) {
      if (!declared.has(prop) && !COMMON_PROPS.has(prop)) {
        findings.DOC_NOT_DECLARED.push({ prop, widget: name, loc: `docs/widget/${page}` });
      }
    }
    for (const prop of declared.keys()) {
      if (!own.has(prop) && !COMMON_PROPS.has(prop)) {
        findings.DECLARED_NOT_DOC.push({ prop, widget: name, loc: `src/index.d.ts:${ifaceName}` });
      }
    }
  }

  // 4b. is the documented prop real at runtime?
  const reach = impl ? reachableText(name) : IMPL_CORPUS;
  for (const prop of own) {
    const def = PROP_MAP.get(prop);
    if (!def) {
      if (ENGINE_HANDLED.has(prop)) continue;
      if (isReadIn(reach, prop)) continue;
      findings.DEAD.push({
        prop,
        widget: name,
        why: impl ? "not in the registry and not read by the widget" : "no implementation file",
        loc: impl ? `src/${impl.rel}` : `docs/widget/${page}`,
      });
      continue;
    }
    if (def.type !== "special") {
      // A style/attribute/event/text entry is routed by the engine itself, so the
      // widget never needs to mention it.
      continue;
    }
    if (ENGINE_HANDLED.has(prop) || isReadIn(reach, prop)) continue;
    findings.DEAD.push({
      prop,
      widget: name,
      why: "`special` in the registry but nothing handles it",
      loc: impl ? `src/${impl.rel}` : `docs/widget/${page}`,
    });
  }

  // 4c. boolean props that land on a CSS property. `applyUnit` turns `true` into
  // `1`, which is only correct for numeric properties; keyword properties need a
  // `boolValues` map or the documented `true` writes an invalid declaration.
  // Only props that actually reach the engine can be mangled this way: a widget
  // that destructures the prop (`AppBar.shadow`) interprets the boolean itself.
  const ownText = impl ? readFileSync(impl.path, "utf8") : "";
  for (const prop of own) {
    const def = PROP_MAP.get(prop);
    if (!def || def.type !== "style" || def.boolValues) continue;
    if (ownText && isReadIn(ownText, prop)) continue;
    const type = declared?.get(prop) ?? COMMON_PROPS.get(prop);
    if (!type || !/\bboolean\b/.test(type)) continue;
    const numeric = /(opacity|flex|order|zIndex|weight|scale|layers)/i.test(def.domProp);
    if (numeric) continue;
    findings.BOOL_STYLE.push({
      prop,
      widget: name,
      why: `true becomes \`1\` in CSS (${def.domProp}) without boolValues`,
      loc: `src/widget-factory/translateProps.js`,
    });
  }
}

// ---------------------------------------------------------------------------
// 5. Report
// ---------------------------------------------------------------------------
if (asJson) {
  console.log(JSON.stringify(findings, null, 2));
} else {
  const labels = {
    DOC_NOT_DECLARED: "documented but absent from the widget's *Props interface",
    DECLARED_NOT_DOC: "declared in *Props but the page never documents it",
    DEAD: "documented but neither routed by the engine nor read by the widget -> does nothing",
    BOOL_STYLE: "documented as boolean but written to CSS as 1/0 without boolValues",
  };
  for (const [key, rows] of Object.entries(findings)) {
    console.log(`\n=== ${key} (${rows.length}) — ${labels[key]}`);
    if (!rows.length) {
      console.log("  none");
      continue;
    }
    const shown = showFull ? rows : rows.slice(0, 40);
    for (const r of shown) console.log(`  ${r.widget}.${r.prop}  [${r.why}]  ${r.loc}`);
    if (!showFull && rows.length > shown.length) {
      console.log(`  … ${rows.length - shown.length} more (use --full)`);
    }
  }
}

const counts = Object.fromEntries(
  Object.entries(findings).map(([k, v]) => [k, v.length]),
);
console.log(
  `\nScanned ${pages.length} doc pages. Summary: ` +
    Object.entries(counts)
      .map(([k, v]) => `${k}=${v}`)
      .join(" "),
);
// DOC_NOT_DECLARED is a generator/authoring mistake the docs pipeline can heal by
// re-running the generator, so it warns; the runtime-facing classes block the test.
process.exit(counts.DEAD + counts.BOOL_STYLE ? 1 : 0);
