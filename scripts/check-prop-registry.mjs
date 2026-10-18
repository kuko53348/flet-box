#!/usr/bin/env node
/**
 * @file check-prop-registry.mjs
 * @description
 * Cross-checks the three prop surfaces of FletBox so a prop never lies:
 *
 *   1. the registry (`src/widget-factory/translateProps.js` `ALL_PROPS`),
 *   2. the implementations (`src/widgets/*.js`, `src/navigations/*.js`),
 *   3. the declared API (`src/index.d.ts` `<Widget>Props` interfaces).
 *
 * Findings:
 *   UNKNOWN      a key literally passed to a widget/factory call that is not in
 *                the registry -> runtime "unknown prop" warning + junk inline style.
 *   DROPPED      a key registered as `special` that the target widget never reads
 *                -> the prop silently does nothing.
 *   UNDOCUMENTED a key a caller passes that is not in the target `<Widget>Props`.
 *   INTERNAL     a prop the widget itself reads but the registry does not know:
 *                harmless only while it is destructured, and a warning the moment
 *                a caller leaks it through `...rest`.
 *   CONFLICT     two registry entries for the same prop name disagree.
 *   DEAD         a `special` entry no widget reads: because the registry is
 *                global, it silences an invented prop instead of warning.
 *
 * Usage:
 *   node scripts/check-prop-registry.mjs             # summary, exit 1 on UNKNOWN/CONFLICT
 *   node scripts/check-prop-registry.mjs --full      # list every finding
 *   node scripts/check-prop-registry.mjs --json      # machine-readable
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_PROPS } from "../src/widget-factory/translateProps.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const srcDir = join(root, "src");

const args = process.argv.slice(2);
const showFull = args.includes("--full");
const asJson = args.includes("--json");

/**
 * Keys the factory or the engine consumes on its own. They are never "dropped":
 * `child`/`children` go to addChildren, `ref` is invoked, `disableTransform` is
 * read by effects.js, `value`/`variant` by applySpecial.
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
]);

// ---------------------------------------------------------------------------
// Scanner helpers: work on a mask (comments + string bodies blanked, offsets
// preserved) so braces and regexes never see punctuation coming from user text.
// ---------------------------------------------------------------------------
function mask(src) {
  const out = src.split("");
  let i = 0;
  // Last significant code token, used to tell a regex literal from a division.
  let prevToken = "";
  const blank = (from, to) => {
    for (let k = from; k < to && k < out.length; k++) {
      if (out[k] !== "\n") out[k] = " ";
    }
  };
  const REGEX_AFTER_PUNCT = new Set([
    "", "(", ",", "=", ":", "[", "!", "&", "|", "?", "{", "}", ";",
    "+", "-", "%", "~", "^", "<", ">",
  ]);
  const REGEX_AFTER_WORD = new Set([
    "return", "typeof", "instanceof", "in", "of", "new", "delete", "void",
    "case", "do", "else", "yield", "await", "if", "while",
  ]);
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (c === "/" && n === "/") {
      let j = i + 2;
      while (j < src.length && src[j] !== "\n") j++;
      blank(i, j);
      i = j;
      continue;
    }
    if (c === "/" && n === "*") {
      let j = src.indexOf("*/", i + 2);
      j = j === -1 ? src.length : j + 2;
      blank(i, j);
      i = j;
      continue;
    }
    // Identifier or keyword run.
    if (/[A-Za-z_$]/.test(c)) {
      let j = i;
      while (j < src.length && /[\w$]/.test(src[j])) j++;
      prevToken = src.slice(i, j);
      i = j;
      continue;
    }
    if (/\d/.test(c)) {
      let j = i;
      while (j < src.length && /[\w.]/.test(src[j])) j++;
      prevToken = "number";
      i = j;
      continue;
    }
    // Regex literal: a `/` where an operand is expected. Without this rule the
    // quotes inside `/["']/` open a fake string and blank the rest of the file.
    const canStartRegex =
      REGEX_AFTER_PUNCT.has(prevToken) || REGEX_AFTER_WORD.has(prevToken);
    if (c === "/" && canStartRegex) {
      let j = i + 1;
      let inClass = false;
      let ok = false;
      while (j < src.length) {
        const r = src[j];
        if (r === "\\") { j += 2; continue; }
        if (r === "\n") break;
        if (r === "[") inClass = true;
        else if (r === "]") inClass = false;
        else if (r === "/" && !inClass) { ok = true; break; }
        j++;
      }
      if (ok) {
        blank(i + 1, j);
        // flags after the closing slash are part of the literal, not code
        while (j + 1 < src.length && /[a-z]/.test(src[j + 1])) j++;
        i = j + 1;
        prevToken = "regex";
        continue;
      }
    }
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < src.length) {
        if (src[j] === "\\") { j += 2; continue; }
        if (src[j] === c) break;
        if (c === "`" && src[j] === "$" && src[j + 1] === "{") {
          // keep template interpolation live: it can contain nested calls
          j += 2;
          let depth = 1;
          while (j < src.length && depth > 0) {
            if (src[j] === "{") depth++;
            else if (src[j] === "}") depth--;
            else if (src[j] === "`" || src[j] === '"' || src[j] === "'") {
              const q = src[j];
              j++;
              while (j < src.length && src[j] !== q) {
                if (src[j] === "\\") j++;
                j++;
              }
            }
            j++;
          }
          continue;
        }
        j++;
      }
      blank(i + 1, Math.min(j, src.length));
      i = j + 1;
      prevToken = "string";
      continue;
    }
    if (!/\s/.test(c)) prevToken = c;
    i++;
  }
  return out.join("");
}

function matchBalanced(masked, openIdx, open, close) {
  let depth = 0;
  for (let i = openIdx; i < masked.length; i++) {
    if (masked[i] === open) depth++;
    else if (masked[i] === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Split a masked slice on commas that sit at brace/bracket/paren depth 0. */
function splitTopLevel(masked, from, to) {
  const parts = [];
  let depth = 0;
  let start = from;
  for (let i = from; i < to; i++) {
    const c = masked[i];
    if (c === "{" || c === "[" || c === "(") depth++;
    else if (c === "}" || c === "]" || c === ")") depth--;
    else if (c === "," && depth === 0) {
      parts.push([start, i]);
      start = i + 1;
    }
  }
  if (to > start) parts.push([start, to]);
  return parts;
}

/** Collect prop names out of a destructuring pattern slice. */
function addPatternNames(masked, from, to, into) {
  for (const [s, e] of splitTopLevel(masked, from, to)) {
    const t = masked.slice(s, e).trim();
    if (!t || t.startsWith("...")) continue;
    // `name`, `name = default`, `key: localAlias` -> the prop is the leading key.
    const m = /^([A-Za-z_$][\w$]*)/.exec(t);
    if (m) into.add(m[1]);
    else console.error(`⚠️ [check-prop-registry] unparsed destructuring entry: ${JSON.stringify(t)}`);
  }
}

/** Top-level keys of an object literal plus whether it spreads anything. */
function objectLiteralKeys(masked, braceOpenIdx) {
  const close = matchBalanced(masked, braceOpenIdx, "{", "}");
  if (close === -1) return { keys: [], spreads: false };
  const keys = [];
  let spreads = false;
  for (const [s, e] of splitTopLevel(masked, braceOpenIdx + 1, close)) {
    const slice = masked.slice(s, e).trim();
    if (!slice) continue;
    if (slice.startsWith("...")) { spreads = true; continue; }
    const m = /^([A-Za-z_$][\w$]*)\s*:/.exec(slice);
    if (m) keys.push(m[1]);
    else {
      // shorthand: `{ width }`
      const short = /^([A-Za-z_$][\w$]*)$/.exec(slice);
      if (short) keys.push(short[1]);
    }
  }
  return { keys, spreads };
}

function lineOf(src, idx) {
  let line = 1;
  for (let i = 0; i < idx; i++) if (src[i] === "\n") line++;
  return line;
}

// ---------------------------------------------------------------------------
// 1. Registry
// ---------------------------------------------------------------------------
const PROP_MAP = new Map();
const conflicts = [];
for (const def of ALL_PROPS) {
  const prev = PROP_MAP.get(def.prop);
  if (prev) {
    const differs =
      prev.type !== def.type ||
      prev.domProp !== def.domProp ||
      prev.unit !== def.unit ||
      Boolean(prev.reactive) !== Boolean(def.reactive);
    if (differs) {
      conflicts.push({
        prop: def.prop,
        a: `${prev.type}/${prev.domProp}/${prev.unit ?? "-"}`,
        b: `${def.type}/${def.domProp}/${def.unit ?? "-"}`,
      });
    }
  }
  PROP_MAP.set(def.prop, def);
}

// ---------------------------------------------------------------------------
// 2. Implementations: what each widget actually reads
// ---------------------------------------------------------------------------
const files = [];
for (const dir of ["widgets", "navigations", "animations"]) {
  const abs = join(srcDir, dir);
  for (const f of readdirSync(abs)) {
    if (f.endsWith(".js") && f !== "index.js") {
      files.push({ name: basename(f, ".js"), rel: `${dir}/${f}`, path: join(abs, f) });
    }
  }
}

/** @type {Map<string,{consumed:Set<string>,rel:string}>} */
const impls = new Map();
const parsed = new Map();
const entryNames = new Set();

for (const f of files) {
  const raw = readFileSync(f.path, "utf8");
  const masked = mask(raw);
  const consumed = new Set();

  // 2a. `const { ... } = props` inside the widget body.
  const openRe = /\{/g;
  let om;
  while ((om = openRe.exec(masked))) {
    const openIdx = om.index;
    const close = matchBalanced(masked, openIdx, "{", "}");
    if (close === -1) continue;
    const rhs = /^\s*=\s*([A-Za-z_$][\w$]*)/.exec(masked.slice(close + 1, close + 48));
    if (rhs && /prop|option|config|param|arg/i.test(rhs[1])) {
      addPatternNames(masked, openIdx + 1, close, consumed);
    }
  }

  // 2b. the exported widget entry signature: `export const X = ({ a, b }) =>` or
  //     `export function X({ a, b })`. Only this position counts as props:
  //     helper functions also take destructured objects (`renderTable({ head })`)
  //     and their keys are not widget props.
  const entryRe =
    /export\s+(?:default\s+)?(?:async\s+)?(?:const|let|function)\s+(\w+)\s*(?:=\s*(?:async\s*)?)?\(\s*(?=\{)/g;
  let em;
  while ((em = entryRe.exec(masked))) {
    const braceIdx = masked.indexOf("{", em.index + em[0].length - 1);
    const close = matchBalanced(masked, braceIdx, "{", "}");
    if (close === -1) continue;
    addPatternNames(masked, braceIdx + 1, close, consumed);
    entryNames.add(em[1]);
  }

  // 2c. direct reads: props.foo / props?.foo / props["foo"], plus props that are
  //     exposed as accessors or read from a props-like local.
  const READ_HOSTS = "(?:props|options|config|params|args|widgetProps)";
  for (const re of [
    new RegExp(`\\b${READ_HOSTS}\\s*\\.\\s*([A-Za-z_$][\\w$]*)`, "g"),
    new RegExp(`\\b${READ_HOSTS}\\s*\\[\\s*["']([^"']+)["']\\s*\\]`, "g"),
    /\bObject\.defineProperty\(\s*[\w$.]+\s*,\s*["']([^"']+)["']/g,
  ]) {
    let r;
    while ((r = re.exec(masked))) consumed.add(r[1]);
  }

  impls.set(f.name, { consumed, rel: f.rel });
  parsed.set(f.name, { raw, masked, rel: f.rel });
}

// Self-check: a widget file whose entry signature was not parsed would silently
// contribute nothing to the audit, so say so instead of reporting a clean run.
// Router/animate are engines, Inspector is a debug utility: neither takes props.
const NOT_WIDGET_FILES = new Set(["Router", "animate", "Inspector"]);
const unparsed = files.filter(
  (f) => !NOT_WIDGET_FILES.has(f.name) && impls.get(f.name).consumed.size === 0,
);
if (unparsed.length) {
  console.error(`⚠️ [check-prop-registry] no props read from: ${unparsed.map((f) => f.name).join(", ")}`);
}

// ---------------------------------------------------------------------------
// 3. Declared API (index.d.ts)
// ---------------------------------------------------------------------------
const dts = readFileSync(join(srcDir, "index.d.ts"), "utf8");
const interfaces = new Map();
const ifaceRe = /interface\s+(\w+)\s*(extends\s+[A-Za-z_$][\w$]*[^{]*)?\{/g;
let im;
while ((im = ifaceRe.exec(dts))) {
  const name = im[1];
  const parents = /extends\s+([A-Za-z_$][\w$]*)/.exec(im[2] || "")?.[1] ?? null;
  const open = dts.indexOf("{", im.index + im[0].length - 1);
  const close = matchBalanced(dts, open, "{", "}");
  if (close === -1) continue;
  const props = new Map();
  for (const m of dts.slice(open + 1, close).matchAll(/^\s*([A-Za-z_$][\w$]*)\??\s*:\s*([^;\n]+)/gm)) {
    props.set(m[1], m[2].trim());
  }
  interfaces.set(name, { props, parents });
  ifaceRe.lastIndex = close;
}

function interfaceProps(name, seen = new Set()) {
  const iface = interfaces.get(name);
  if (!iface || seen.has(name)) return new Map();
  seen.add(name);
  const out = new Map(interfaceProps(iface.parents, seen));
  for (const [k, v] of iface.props) out.set(k, v);
  return out;
}

/** True when any declared interface carries this prop (i.e. it is public API). */
function interfacesHasProp(prop) {
  for (const { props } of interfaces.values()) if (props.has(prop)) return true;
  return false;
}

// ---------------------------------------------------------------------------
// 4. Call-site audit: every literal prop key passed to a widget or the factory
// ---------------------------------------------------------------------------
const knownTargets = new Set([...impls.keys(), "WidgetFactory"]);
const findings = { UNKNOWN: [], DROPPED: [], UNDOCUMENTED: [], INTERNAL: [], DEAD: [], CONFLICT: conflicts };

for (const [callerName, { raw, masked, rel }] of parsed) {
  const callRe = new RegExp(`\\b(${[...knownTargets].join("|")})\\s*\\(`, "g");
  let c;
  while ((c = callRe.exec(masked))) {
    const callee = c[1];
    const openParen = masked.indexOf("(", c.index + callee.length);
    const closeParen = matchBalanced(masked, openParen, "(", ")");
    if (closeParen === -1) continue;
    const argStart = openParen + 1;
    const head = masked.slice(argStart, argStart + 60);
    const trimmed = head.replace(/^\s+/, "");
    if (!trimmed.startsWith("{")) continue;
    const braceIdx = argStart + (head.length - trimmed.length);
    const { keys } = objectLiteralKeys(masked, braceIdx);
    if (!keys.length) continue;

    const info = impls.get(callee);
    const ifaceName = `${callee}Props`;
    const declared = interfaces.has(ifaceName) ? interfaceProps(ifaceName) : null;
    const loc = `${rel}:${lineOf(raw, c.index)}`;

    for (const key of keys) {
      if (ENGINE_HANDLED.has(key)) continue;
      const def = PROP_MAP.get(key);
      if (!def) {
        findings.UNKNOWN.push({ prop: key, target: callee, via: callerName, loc });
        continue;
      }
      const consumedByWidget = !info || info.consumed.has(key);
      if (def.type === "special" && !consumedByWidget) {
        findings.DROPPED.push({ prop: key, target: callee, via: callerName, loc });
        continue;
      }
      if (declared && !declared.has(key) && def.type === "special") {
        findings.UNDOCUMENTED.push({ prop: key, target: callee, via: callerName, loc });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Registry coverage: props a widget reads that the registry does not know
// ---------------------------------------------------------------------------
for (const [widgetName, { consumed, rel }] of impls) {
  // The router is not a widget: its `config` keys are route descriptors.
  if (widgetName === "Router") continue;
  const ifaceName = `${widgetName}Props`;
  const declared = interfaces.has(ifaceName) ? interfaceProps(ifaceName) : new Map();
  for (const prop of consumed) {
    if (!/^[A-Za-z_$][\w$]*$/.test(prop)) continue;
    if (PROP_MAP.has(prop) || ENGINE_HANDLED.has(prop)) continue;
    findings.INTERNAL.push({
      prop,
      target: widgetName,
      loc: rel,
      documented: declared.has(prop),
    });
  }
}

// ---------------------------------------------------------------------------
// 6. Dead registry entries: `special` props no implementation reads. The
//    registry is global, so such an entry silences the warning for a prop that
//    no widget implements -> the caller gets neither a warning nor behaviour.
//
//    Presence is decided from real access syntax anywhere in `src` (a prop name
//    can appear as `prop: value`, `.prop`, `prop = default` or `["prop"]`),
//    because destructuring patterns alone miss defineProperty-based props.
// ---------------------------------------------------------------------------
function allSourceText(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) allSourceText(p, acc);
    else if (entry.name.endsWith(".js") && entry.name !== "translateProps.js") {
      acc.push(readFileSync(p, "utf8"));
    }
  }
  return acc;
}
const implCorpus = allSourceText(srcDir).join("\n");
const QUOTES = '["\'`]';
const isRead = (name) => {
  const id = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // `prop:` / `prop =` (key or destructuring default), `.prop` (read), or
  // "prop" (quoted access / key list).
  const source = [
    `\\b${id}\\s*[:=]`,
    `\\.\\s*${id}\\b`,
    `${QUOTES}${id}${QUOTES}`,
  ].join("|");
  return new RegExp(source).test(implCorpus);
};
const consumedAnywhere = new Set();
for (const { consumed } of impls.values()) for (const p of consumed) consumedAnywhere.add(p);

for (const def of ALL_PROPS) {
  if (def.type !== "special") continue;
  if (consumedAnywhere.has(def.prop) || isRead(def.prop)) continue;
  findings.DEAD.push({
    prop: def.prop,
    kind: interfacesHasProp(def.prop) ? "unimplemented" : "orphan",
  });
}

// ---------------------------------------------------------------------------
// 7. Report
// ---------------------------------------------------------------------------
const dedupe = (rows, keyFn) => {
  const map = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    if (!map.has(k)) map.set(k, { ...r, count: 0, sites: [] });
    const e = map.get(k);
    e.count++;
    if (e.sites.length < 5 && !e.sites.includes(r.loc)) e.sites.push(r.loc);
  }
  return [...map.values()].sort((a, b) => a.prop.localeCompare(b.prop));
};

const groups = {
  UNKNOWN: dedupe(findings.UNKNOWN, (r) => `${r.prop}\u0000${r.target}`),
  DROPPED: dedupe(findings.DROPPED, (r) => `${r.prop}\u0000${r.target}`),
  UNDOCUMENTED: dedupe(findings.UNDOCUMENTED, (r) => `${r.prop}\u0000${r.target}`),
  INTERNAL: dedupe(findings.INTERNAL, (r) => `${r.prop}\u0000${r.target}`),
  DEAD: dedupe(findings.DEAD, (r) => r.prop),
  CONFLICT: findings.CONFLICT,
};

if (asJson) {
  console.log(JSON.stringify(groups, null, 2));
  process.exit(groups.UNKNOWN.length + groups.CONFLICT.length ? 1 : 0);
} else {
  const labels = {
    UNKNOWN: "passed but not in the registry -> runtime warning + junk inline style",
    DROPPED: "`special` prop passed to a widget that never reads it -> silently ignored",
    UNDOCUMENTED: "passed but absent from the target's declared *Props interface",
    INTERNAL: "widget reads it but the registry does not know it -> leaks a warning via ...rest",
    DEAD: "in the registry as `special` but no widget reads it -> silences invented props",
    CONFLICT: "duplicate registry entries that disagree",
  };
  for (const [key, rows] of Object.entries(groups)) {
    console.log(`\n=== ${key} (${rows.length}) — ${labels[key]}`);
    if (!rows.length) { console.log("  none"); continue; }
    const shown = showFull ? rows : rows.slice(0, 40);
    for (const r of shown) {
      if (key === "CONFLICT") {
        console.log(`  ${r.prop}: ${r.a}  vs  ${r.b}`);
        continue;
      }
      if (key === "DEAD") {
        console.log(`  ${r.prop}  [${r.kind}]`);
        continue;
      }
      const extra = key === "INTERNAL" ? ` [${r.documented ? "documented" : "undocumented"}]` : "";
      console.log(`  ${r.prop} -> ${r.target}${r.via && r.via !== r.target ? ` (from ${r.via})` : ""} x${r.count}${extra}`);
      for (const s of r.sites) console.log(`      ${s}`);
    }
    if (!showFull && rows.length > shown.length) console.log(`  … ${rows.length - shown.length} more (use --full)`);
  }
}

const blocking = groups.UNKNOWN.length + groups.CONFLICT.length;
console.log(
  `\nSummary: UNKNOWN=${groups.UNKNOWN.length} DROPPED=${groups.DROPPED.length} UNDOCUMENTED=${groups.UNDOCUMENTED.length} INTERNAL=${groups.INTERNAL.length} DEAD=${groups.DEAD.length} CONFLICT=${groups.CONFLICT.length}`,
);
process.exit(blocking ? 1 : 0);
