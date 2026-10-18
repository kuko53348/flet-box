#!/usr/bin/env node
/**
 * @file check-snippets.mjs
 * @description
 * Contract checker for the VSCode snippet files shipped in
 * `tools/snippets-creator-flet-box/`. A snippet is code a developer pastes
 * without reading, so every symbol it references must exist in the published
 * API and every prop it passes must be one the engine or the target widget
 * actually understands — the same rule `check-prop-registry.mjs` enforces on the
 * library itself.
 *
 * Usage:
 *   node scripts/check-snippets.mjs            # check, fail on breakage
 *   node scripts/check-snippets.mjs --full     # list every finding
 *   node scripts/check-snippets.mjs --json     # machine-readable report
 *
 * Findings (the first three fail the build):
 * - SYNTAX           — the body is not valid JavaScript at all.
 * - BROKEN_IMPORT    — it imports a name the package does not export.
 * - DEAD_SNIPPET     — the widget it builds does not exist.
 * - UNKNOWN_PROP     — a prop the registry does not know and the target widget
 *                      never mentions in its source.
 * - BROKEN_CALL      — a free call that is neither exported nor declared
 *                      locally; most of these are example-local placeholders
 *                      (`fetchMore()`), so the tier only informs.
 * - DUPLICATE_PREFIX — two category files claim the same prefix.
 * - AGGREGATE_DRIFT  — FletBox.json differs from the union of the category files.
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");

const args = process.argv.slice(2);
const showFull = args.includes("--full");
const asJson = args.includes("--json");
// --dir lets the checkers' own detectors be exercised against a scratch copy of
// the library without touching what the editor loads.
const dirArg = args.indexOf("--dir");
const snippetDir =
  dirArg !== -1 && args[dirArg + 1]
    ? resolve(args[dirArg + 1])
    : join(root, "tools/snippets-creator-flet-box");
const srcDir = join(root, "src");

const SNIPPET_FILES = [
  "FletBox.json",
  "FletBox_widgets.json",
  "FletBox_attribute_widgets.json",
  "FletBox_modules_widgets.json",
];

// ---------------------------------------------------------------------------
// 1. The published API: exports + prop registry
// ---------------------------------------------------------------------------
const api = await import(join(srcDir, "index.js"));
const EXPORTS = new Set(Object.keys(api));

const { PROP_MAP } = await import(
  join(srcDir, "widget-factory", "translateProps.js")
);
const REGISTRY = new Set(Object.keys(PROP_MAP));

// Keys the factory consumes structurally rather than through the prop database.
const ENGINE_KEYS = new Set([
  "tag",
  "widgetName",
  "child",
  "children",
  "key",
  "style",
  "props",
  "value",
  "variant",
  "ref",
  "on",
]);

// JavaScript / DOM builtins a snippet body may legitimately call.
const BUILTINS = new Set([
  "if", "for", "while", "switch", "catch", "return", "function", "typeof",
  "new", "String", "Number", "Boolean", "Array", "Object", "JSON", "Math",
  "Date", "Map", "Set", "Promise", "parseInt", "parseFloat", "isNaN",
  "console", "document", "window", "localStorage", "setTimeout",
  "clearTimeout", "setInterval", "clearInterval", "requestAnimationFrame",
  "alert", "log", "warn", "error", "push", "map", "filter", "forEach",
  "join", "split", "slice", "concat", "find", "some", "every", "reduce",
  "sort", "reverse", "includes", "indexOf", "toFixed", "toString", "keys",
  "values", "entries", "assign", "stringify", "parse", "round", "floor",
  "ceil", "random", "max", "min", "abs", "then", "catch", "resolve",
  "reject", "addEventListener", "removeEventListener", "preventDefault",
  "stopPropagation", "querySelector", "getElementById", "createElement",
  "appendChild", "removeChild", "test", "replace", "match", "trim",
  "toUpperCase", "toLowerCase", "padStart", "repeat", "at", "flat",
]);

/**
 * Reads the source of every widget so a prop a widget handles privately counts
 * as real even when it lives outside the database. Keyed by the exported name,
 * because helpers do not always live in a file of the same name — `ThemeProvider`
 * is exported from `utils/themes.js`.
 */
const widgetSources = new Map();
for (const dir of ["widgets", "navigations", "animations", "utils", "tools"]) {
  for (const name of readdirSync(join(srcDir, dir))) {
    if (!name.endsWith(".js") || name === "index.js") continue;
    const source = readFileSync(join(srcDir, dir, name), "utf8");
    widgetSources.set(name, source);
    for (const [, exported] of source.matchAll(/^export (?:const|function|class) ([A-Za-z0-9_$]+)/gm)) {
      widgetSources.set(exported, source);
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Snippet body parsing
// ---------------------------------------------------------------------------

/** Blanks string contents so braces and colons inside literals are ignored. */
const mask = (src) => {
  const out = src.split("");
  let i = 0;
  while (i < out.length) {
    const c = src[i];
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < out.length) {
        if (out[j] === "\\") {
          out[j] = " ";
          if (j + 1 < out.length) out[j + 1] = " ";
          j += 2;
          continue;
        }
        if (src[j] === c) break;
        out[j] = " ";
        j++;
      }
      i = j + 1;
      continue;
    }
    i++;
  }
  return out.join("");
};

/**
 * Collects the keys written at the first level of the object literal that opens
 * at `openIdx`, i.e. the props of one widget call.
 */
const topLevelKeys = (masked, openIdx) => {
  const keys = [];
  let depth = 0;
  for (let i = openIdx; i < masked.length; i++) {
    const c = masked[i];
    if (c === "{" || c === "(" || c === "[") depth++;
    else if (c === "}" || c === ")" || c === "]") {
      depth--;
      if (depth === 0) break;
    } else if (depth === 1) {
      const m = /^([A-Za-z_$][\w$]*)\s*:/.exec(masked.slice(i));
      if (m) {
        keys.push(m[1]);
        i += m[0].length - 1;
      }
    }
  }
  return keys;
};

const CALL_RE = /([A-Za-z_$][\w$]*)\s*\(\s*\{/g;
// A call site is only a flet-box symbol reference when it is not a method call
// (`colors.get(`), not an object-literal method (`get() {`), and not preceded by
// `.` or `new` handled separately below.
const CALL_SITE_RE = /(^|[^\w$.])\b([A-Za-z_$][\w$]*)\s*\(/g;
const IMPORT_RE = /import\s*\{([^}]*)\}\s*from\s*["']flet-box["']/g;

/** @returns {{widget: string, keys: string[]}[]} one entry per widget call */
const callsIn = (masked) => {
  const found = [];
  let m;
  CALL_RE.lastIndex = 0;
  while ((m = CALL_RE.exec(masked))) {
    const open = masked.indexOf("{", m.index + m[1].length);
    found.push({ widget: m[1], keys: topLevelKeys(masked, open) });
  }
  return found;
};

/** Every identifier called like a free function (method calls excluded). */
const calledNames = (masked) => {
  const names = new Set();
  let m;
  CALL_SITE_RE.lastIndex = 0;
  while ((m = CALL_SITE_RE.exec(masked))) names.add(m[2]);
  return names;
};

/** Names a snippet imports from the package — they must exist to be importable. */
const importedNames = (masked) => {
  const names = new Set();
  let m;
  IMPORT_RE.lastIndex = 0;
  while ((m = IMPORT_RE.exec(masked))) {
    for (const part of m[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0].trim();
      if (name) names.add(name);
    }
  }
  return names;
};

/** Names declared inside the snippet itself (`const x = ...`). */
const declaredNames = (masked) => {
  const names = new Set();
  for (const re of [/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)/g, /function\s+([A-Za-z_$][\w$]*)/g, /\b([A-Za-z_$][\w$]*)\s*=\s*(?:\([^)]*\)|[\w$]+)\s*=>/g]) {
    let m;
    while ((m = re.exec(masked))) names.add(m[1]);
  }
  return names;
};

// ---------------------------------------------------------------------------
// 3. Audit
// ---------------------------------------------------------------------------

/**
 * A snippet body must be JavaScript the user can paste. Bodies come in three
 * shapes — a statement block, a bare expression, or an object-member fragment
 * (`padding: padding(8),`) — so each is tried, with imports/exports removed
 * because `new Function` cannot parse module syntax.
 *
 * @returns {string|null} the parse error, or null when some shape works
 */
const syntaxError = (body) => {
  // The trailing newline matters: a body ending in a `//` comment would
  // otherwise swallow the closing brace of every wrapper below.
  const stripped =
    body
      .replace(/^\s*import\s[^;]*;/gm, "")
      .replace(/^\s*export\s+(?=const|let|var|function|class)/gm, "") + "\n";
  const shapes = [
    `async function _probe(){${stripped}}`,
    `({ _probe: ${stripped} })`,
    `(${stripped})`,
    `({${stripped}})`,
  ];
  let last = null;
  for (const src of shapes) {
    try {
      new Function(src);
      return null;
    } catch (err) {
      last = err.message;
    }
  }
  return last;
};

const findings = {
  syntax: [],
  brokenImport: [],
  brokenCall: [],
  unknownProp: [],
  positionalArg: [],
  deadSnippet: [],
  duplicatePrefix: [],
  aggregateDrift: [],
  unparsable: [],
};
const prefixOwner = new Map();
const allPrefixes = new Map(); // prefix -> Set<file>
const aggregate = "FletBox.json";
let snippetCount = 0;

/** The widget a snippet is about: the first PascalCase call in its body. */
const headlineOf = (masked, prefix) => {
  for (const c of callsIn(masked)) if (/^[A-Z]/.test(c.widget)) return c.widget;
  const tail = (prefix.split(/\s+/).pop() || prefix).split(".")[0];
  return /^[A-Z]/.test(tail) && new RegExp(`\\b${tail}\\s*\\(`).test(masked) ? tail : null;
};

for (const file of SNIPPET_FILES) {
  let data;
  try {
    data = JSON.parse(readFileSync(join(snippetDir, file), "utf8"));
  } catch (err) {
    findings.unparsable.push({ file, detail: err.message });
    continue;
  }

  for (const [key, snippet] of Object.entries(data)) {
    snippetCount++;
    const prefix = snippet?.prefix || key;

    if (!allPrefixes.has(prefix)) allPrefixes.set(prefix, new Set());
    allPrefixes.get(prefix).add(file);

    const body = Array.isArray(snippet?.body) ? snippet.body.join("\n") : String(snippet?.body || "");
    if (!body.trim()) continue;

    const masked = mask(body);
    const locals = declaredNames(masked);

    const syntax = syntaxError(body);
    if (syntax) findings.syntax.push({ file, prefix, detail: syntax });

    // Widgets read their config by destructuring, so a positional string is not a
    // shorthand — it silently builds an empty widget (`Text("Hello")` renders "")
    // and spreads the characters into the style object.
    for (const [, widget, quote] of body.matchAll(/\b([A-Z][A-Za-z0-9]*)\s*\(\s*(["'`])/g)) {
      if (!EXPORTS.has(widget)) continue;
      findings.positionalArg.push({ file, prefix, widget, quote: { '"': "string", "'": "string", "`": "template" }[quote] });
    }

    // Anything imported from the package must be importable.
    for (const name of importedNames(masked)) {
      if (!EXPORTS.has(name)) findings.brokenImport.push({ file, prefix, symbol: name });
    }

    const headline = headlineOf(masked, prefix);
    if (headline && !EXPORTS.has(headline) && !locals.has(headline)) {
      findings.deadSnippet.push({ file, prefix, symbol: headline });
    }

    for (const name of calledNames(masked)) {
      if (BUILTINS.has(name)) continue;
      if (locals.has(name)) continue;
      if (EXPORTS.has(name)) continue;
      if (findings.deadSnippet.some((d) => d.prefix === prefix && d.file === file && d.symbol === name)) continue;
      findings.brokenCall.push({ file, prefix, symbol: name });
    }

    for (const call of callsIn(masked)) {
      // Only widgets go through the prop database; helper functions such as
      // `padding({ horizontal: 8 })` take their own argument shape.
      if (!EXPORTS.has(call.widget) || !/^[A-Z]/.test(call.widget)) continue;
      const source = widgetSources.get(call.widget) || widgetSources.get(`${call.widget}.js`) || "";
      for (const prop of call.keys) {
        if (ENGINE_KEYS.has(prop) || REGISTRY.has(prop)) continue;
        if (new RegExp(`\\b${prop}\\b`).test(source)) continue;
        findings.unknownProp.push({ file, prefix, widget: call.widget, prop });
      }
    }
  }
}

// The aggregate file is what the editor actually loads: it must contain exactly
// the union of the category files, or a fix applied to a category file silently
// stops reaching users.
const categoryPrefixes = new Set(
  SNIPPET_FILES.filter((f) => f !== aggregate).flatMap((f) =>
    Object.keys(JSON.parse(readFileSync(join(snippetDir, f), "utf8"))),
  ),
);
const aggregateKeys = new Set(Object.keys(JSON.parse(readFileSync(join(snippetDir, aggregate), "utf8"))));
for (const k of categoryPrefixes) if (!aggregateKeys.has(k)) findings.aggregateDrift.push({ file: aggregate, key: k, issue: "missing from aggregate" });
for (const k of aggregateKeys) if (!categoryPrefixes.has(k)) findings.aggregateDrift.push({ file: aggregate, key: k, issue: "only in aggregate" });

// Same key with a different body means the aggregate the editor loads was built
// from another revision of the category file.
const bodyOf = (data, key) => {
  const b = data[key]?.body;
  return (Array.isArray(b) ? b.join("\n") : String(b || "")).trim();
};
const aggregateData = JSON.parse(readFileSync(join(snippetDir, aggregate), "utf8"));
for (const file of SNIPPET_FILES.filter((f) => f !== aggregate)) {
  const data = JSON.parse(readFileSync(join(snippetDir, file), "utf8"));
  for (const key of Object.keys(data)) {
    if (!aggregateKeys.has(key)) continue;
    if (bodyOf(data, key) !== bodyOf(aggregateData, key)) {
      findings.aggregateDrift.push({ file: aggregate, key, issue: `body differs from ${file}` });
    }
  }
}

// Two category files claiming the same prefix is a generator collision.
for (const [prefix, files] of allPrefixes) {
  const categories = [...files].filter((f) => f !== aggregate);
  if (categories.length > 1) findings.duplicatePrefix.push({ prefix, files: categories });
}

// ---------------------------------------------------------------------------
// 4. Report
// ---------------------------------------------------------------------------
const unique = (rows, keyFn) => {
  const seen = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    if (!seen.has(k)) seen.set(k, r);
  }
  return [...seen.values()];
};

const groups = {
  SYNTAX: unique(findings.syntax, (r) => `${r.file}:${r.prefix}`),
  BROKEN_IMPORT: unique(findings.brokenImport, (r) => r.symbol),
  DEAD_SNIPPET: unique(findings.deadSnippet, (r) => r.symbol),
  UNKNOWN_PROP: unique(findings.unknownProp, (r) => `${r.widget}.${r.prop}`),
  BROKEN_CALL: unique(findings.brokenCall, (r) => r.symbol),
  POSITIONAL_ARG: unique(findings.positionalArg, (r) => `${r.file}:${r.prefix}:${r.widget}`),
  DUPLICATE_PREFIX: unique(findings.duplicatePrefix, (r) => r.prefix),
  AGGREGATE_DRIFT: unique(findings.aggregateDrift, (r) => `${r.key}:${r.issue}`),
  UNPARSABLE: findings.unparsable,
};

if (asJson) {
  console.log(JSON.stringify({ snippetCount, ...groups }, null, 2));
  process.exit(blockingCount() ? 1 : 0);
}

const LABELS = {
  SYNTAX: "body is not valid JavaScript — pasting it breaks the file",
  BROKEN_IMPORT: "snippet imports a name the package does not export",
  DEAD_SNIPPET: "the widget a snippet builds does not exist",
  UNKNOWN_PROP: "prop unknown to the registry and never mentioned by the widget",
  POSITIONAL_ARG: "widget called with a positional string instead of a props object — builds an empty widget",
  BROKEN_CALL: "free call that is neither exported nor declared locally (usually an example-local placeholder)",
  DUPLICATE_PREFIX: "same prefix claimed by two category files — editor load order decides",
  AGGREGATE_DRIFT: "FletBox.json (what the editor loads) differs from the category files",
  UNPARSABLE: "snippet file is not valid JSON",
};

/**
 * Findings that make a snippet unusable, or that mean the fix never reaches the
 * editor. BROKEN_CALL is deliberately not here: examples are allowed to call a
 * placeholder they describe (`Header()`, `refresh()`).
 */
function blockingCount() {
  return (
    findings.syntax.length +
    findings.brokenImport.length +
    findings.deadSnippet.length +
    findings.unknownProp.length +
    findings.positionalArg.length +
    findings.duplicatePrefix.length +
    findings.aggregateDrift.length +
    findings.unparsable.length
  );
}

console.log(`\nFletBox snippets — ${snippetCount} snippets in ${SNIPPET_FILES.length} files`);

for (const [name, rows] of Object.entries(groups)) {
  console.log(`\n=== ${name} (${rows.length}) — ${LABELS[name]}`);
  if (!rows.length) {
    console.log("  none");
    continue;
  }
  const shown = showFull ? rows : rows.slice(0, 15);
  for (const r of shown) {
    if (name === "SYNTAX") console.log(`  · ${r.prefix}  (${r.file})\n      ${r.detail}`);
    else if (name === "UNKNOWN_PROP") console.log(`  · ${r.widget}.${r.prop}  (${r.file} · ${r.prefix})`);
    else if (name === "POSITIONAL_ARG") console.log(`  · ${r.widget}(<${r.quote} literal>)  (${r.file} · ${r.prefix})`);
    else if (name === "DUPLICATE_PREFIX") console.log(`  · ${r.prefix}  (${r.files.join(" + ")})`);
    else if (name === "AGGREGATE_DRIFT") console.log(`  · ${r.key} — ${r.issue}`);
    else if (name === "UNPARSABLE") console.log(`  · ${r.file}: ${r.detail}`);
    else console.log(`  · ${r.symbol}  (${r.file} · ${r.prefix})`);
  }
  if (shown.length < rows.length) console.log(`  … ${rows.length - shown.length} más (use --full)`);
}

console.log(
  `\nSummary: SYNTAX=${groups.SYNTAX.length} BROKEN_IMPORT=${groups.BROKEN_IMPORT.length} DEAD_SNIPPET=${groups.DEAD_SNIPPET.length} UNKNOWN_PROP=${groups.UNKNOWN_PROP.length} POSITIONAL_ARG=${groups.POSITIONAL_ARG.length} BROKEN_CALL=${groups.BROKEN_CALL.length} DUPLICATE_PREFIX=${groups.DUPLICATE_PREFIX.length} AGGREGATE_DRIFT=${groups.AGGREGATE_DRIFT.length}`,
);
process.exit(blockingCount() ? 1 : 0);
