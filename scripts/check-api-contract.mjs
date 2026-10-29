#!/usr/bin/env node
/**
 * @file check-api-contract.mjs
 * @description
 * Contract for the API surface: the disagreements between the places a prop
 * lives — the runtime barrel, the engine's prop registry, the declared
 * types and the widget's own source.
 *
 * `flet-box unpack` already names those disagreements. What it does not do is
 * stop them from growing: a prop that is declared and routed by nothing reads
 * as a feature in the editor and does nothing on the screen, and a prop the
 * engine routes for a widget whose interface never declares it underlines in
 * the editor even though it works. Both are silent until somebody writes the
 * app that trips over them.
 *
 * So this script does two things:
 *
 *   1. **It proves the detectors bite.** A fixture package is built in a temp
 *      directory — a real package, with a real barrel, a real `index.d.ts` and
 *      a real widget — carrying one prop of each kind. `unpackWidget` must
 *      report exactly those, and a clean widget must report none. A detector
 *      that always reports is as useless as one that never does.
 *
 *   2. **It pins the debt.** The real framework is measured and compared with
 *      `scripts/api-contract-baseline.json`. The baseline may only shrink: a
 *      new dead prop, a new invented prop, a new doc-only prop or a new
 *      undocumented prop fails the run, and fixing one is never a reason to
 *      write the baseline larger.
 *
 * The three absolute rules — DEAD, INVENTED and DOC-ONLY — have no baseline
 * entry on purpose: they are at zero, and a zero that grows is a defect, not
 * debt to be recorded.
 *
 * A fifth rule is absolute too: **OPTIONAL-CALL**. A declaration that writes
 * `props?:` promises the caller may leave the argument out, and a widget that
 * destructures its props cannot honour that promise unless the parameter
 * carries a default. `ThemePicker` was declared `props?:` and read `props`
 * unguarded, so the gallery that called it with no arguments threw a
 * `TypeError` and never published a fingerprint.
 *
 * Usage:
 *   node scripts/check-api-contract.mjs               # check, fail on new debt
 *   node scripts/check-api-contract.mjs --write-baseline
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { definitionIndex, propsSource, unpackWidget } from "../bin/commands/unpack.js";
import { loadApi } from "../bin/commands/checkApi.js";

const root = path.resolve(import.meta.dirname, "..");
const baselinePath = path.join(root, "scripts", "api-contract-baseline.json");

const failures = [];

/**
 * @param {string} name
 * @param {() => void | Promise<void>} fn
 */
const check = async (name, fn) => {
  try {
    await fn();
    console.log(`  ok   ${name}`);
  } catch (error) {
    failures.push(name);
    console.log(`  FAIL ${name} — ${error.message}`);
  }
};

/**
 * @param {object[]} findings
 * @param {string} code
 * @returns {object|undefined}
 */
const hit = (findings, code) => findings.find((item) => item.code === code);

// ---------------------------------------------------------------------------
// 1a. The optional call: a declaration that promises an omitted argument.
// ---------------------------------------------------------------------------

/**
 * The closing bracket that matches the one at `open`.
 *
 * @param {string} code
 * @param {number} open Index of the opening bracket.
 * @returns {number} The index of the closing bracket, or -1.
 */
const matchingBracket = (code, open) => {
  const pairs = { "(": ")", "[": "]", "{": "}" };
  const close = pairs[code[open]];
  if (!close) return -1;
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    if (code[i] === code[open]) depth++;
    else if (code[i] === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
};

/**
 * The parameter list of an exported factory, as its own source writes it.
 *
 * @param {string} source The widget's source text.
 * @param {string} name The exported name.
 * @returns {string | null} The text between the brackets, or null when the
 *   export is not a factory this reader understands.
 */
const factoryParams = (source, name) => {
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const shapes = [
    new RegExp(`export\\s+(?:async\\s+)?function\\s+${escaped}\\s*\\(`),
    new RegExp(
      `export\\s+(?:const|let|var)\\s+${escaped}\\s*=\\s*(?:async\\s*)?(?:function\\s*\\*?\\s*)?\\(`,
    ),
  ];
  for (const shape of shapes) {
    const found = shape.exec(code);
    if (!found) continue;
    const open = found.index + found[0].length - 1;
    const close = matchingBracket(code, open);
    if (close < 0) return null;
    return code.slice(open + 1, close);
  }
  return null;
};

/**
 * The parameter list of an export, following an alias to the function it
 * names.
 *
 * `export const parseMarkdownToWidgets = markdownToWidgets;` is a pointer:
 * the parameters live in the function it points at, so the rule has to follow
 * it or it would report a widget it never really read.
 *
 * @param {Map<string, string>} definitions Export name → source file.
 * @param {string} name The exported name.
 * @param {Set<string>} [seen] The names already visited.
 * @returns {string | null}
 */
const paramsOf = (definitions, name, seen = new Set()) => {
  if (seen.has(name)) return null;
  seen.add(name);
  const file = definitions.get(name);
  if (!file) return null;
  const source = fs.readFileSync(file, "utf8");
  const params = factoryParams(source, name);
  if (params !== null) return params;
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const alias = new RegExp(
    `export\\s+(?:const|let|var)\\s+${escaped}\\s*=\\s*([A-Za-z_$][\\w$]*)\\s*;`,
  ).exec(code);
  if (!alias) return null;
  return paramsOf(definitions, alias[1], seen);
};

/**
 * Does this parameter carry a default value?
 *
 * The `=` must sit at the top level of the parameter: the one inside
 * `{ a = 1 }` is a default for a destructured key, not for the argument
 * itself, and it does not make the argument optional.
 *
 * @param {string} param One parameter, as written.
 * @returns {boolean}
 */
const hasDefault = (param) => {
  let depth = 0;
  for (let i = 0; i < param.length; i++) {
    const ch = param[i];
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ")" || ch === "]" || ch === "}") depth--;
    else if (ch === "=" && depth === 0) {
      const next = param[i + 1];
      if (next === "=" || next === ">" || next === "!" || next === "<") continue;
      return true;
    }
  }
  return false;
};

/**
 * Split a parameter list into its parameters.
 *
 * @param {string} params The text between the brackets.
 * @returns {string[]}
 */
const splitParams = (params) => {
  const parts = [];
  let depth = 0;
  let current = "";
  for (const ch of params) {
    if (ch === "(" || ch === "[" || ch === "{") depth++;
    else if (ch === ")" || ch === "]" || ch === "}") depth--;
    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  parts.push(current);
  return parts;
};

/**
 * The widgets whose declaration promises an omitted argument the code cannot
 * honour.
 *
 * A parameter the type marks optional is `undefined` when the caller leaves it
 * out, so the implementation has to have decided what that means. A default is
 * that decision; without one the value is undefined in a way nobody chose.
 *
 * The scope is the **widgets** — the capitalized exports. A widget destructures
 * its props, so an omitted argument throws before the widget exists. The
 * lowercase tools (`join`, `range`, `border`) decide in their bodies what an
 * omitted argument means, and a static reader cannot tell that choice apart
 * from a missing one.
 *
 * @param {object} api
 * @param {Map<string, string>} definitions Export name → source file.
 * @returns {Array<{ name: string, why: string }>}
 */
const optionalCalls = (api, definitions) => {
  const found = [];
  for (const [name, signature] of api.signatures) {
    if (!/^[A-Z]/.test(name)) continue;
    const optional = signature.params
      .map((param, index) => ({ param, index }))
      .filter((entry) => entry.param.optional);
    if (!optional.length) continue;
    const params = paramsOf(definitions, name);
    if (params === null) {
      found.push({
        name,
        why: "the export is not a factory with a readable parameter list",
      });
      continue;
    }
    const parts = splitParams(params);
    for (const { param, index } of optional) {
      const part = parts[index];
      if (part === undefined) {
        found.push({
          name,
          why: `the declaration makes "${param.name}" optional but the implementation does not take it`,
        });
        continue;
      }
      if (hasDefault(part)) continue;
      found.push({
        name,
        why: `the declaration makes "${param.name}" optional but it has no default, so an omitted argument is undefined in a way the code never decided`,
      });
    }
  }
  return found;
};

// ---------------------------------------------------------------------------
// 1. The fixture: one prop of each kind, in a package that is really a package.
// ---------------------------------------------------------------------------

const FIXTURE = {
  "package.json": JSON.stringify({ name: "flet-box", version: "0.0.0" }, null, 2),
  "src/index.js": [
    'export { Clean } from "./widgets/Clean.js";',
    'export { Edge } from "./widgets/Edge.js";',
    'export { EdgeOk } from "./widgets/EdgeOk.js";',
    'export { Gap } from "./widgets/Gap.js";',
    'export { Optional } from "./widgets/Optional.js";',
    'export { OptionalOk } from "./widgets/OptionalOk.js";',
    'export { Promised } from "./widgets/Promised.js";',
    "",
  ].join("\n"),
  "src/index.d.ts": [
    "export interface GapProps {",
    "  label?: string;",
    "  ghostProp?: string;",
    "}",
    "export interface CleanProps {",
    "  label?: string;",
    "  padding?: number;",
    "}",
    "export interface PromisedProps {",
    "  label?: string;",
    "}",
    "export interface OptionalProps {",
    "  label?: string;",
    "}",
    "export interface OptionalOkProps {",
    "  label?: string;",
    "}",
    "export function Gap(props: GapProps): Widget;",
    "export function Clean(props: CleanProps): Widget;",
    "export function Promised(props: PromisedProps): Widget;",
    "export function Optional(props?: OptionalProps): Widget;",
    "export function OptionalOk(props?: OptionalOkProps): Widget;",
    "export function Edge(width?: number, color?: string): string;",
    "export function EdgeOk(width?: number, color?: string): string;",
    "",
  ].join("\n"),
  "src/widget-factory/translateProps.js": [
    "export const ALL_PROPS = [",
    '  { prop: "padding", type: "style", domProp: "padding", unit: "rem" },',
    "];",
    "export const PROP_MAP = { padding: ALL_PROPS[0] };",
    "",
  ].join("\n"),
  // `ghostProp` is declared and nothing reads it: DEAD.
  // `magicProp` is read and nothing declares it: INVENTED.
  // `padding` is routed by the engine and the interface hides it: UNDOCUMENTED.
  "src/widgets/Gap.js": [
    "export const Gap = (props = {}) => {",
    "  const { label, magicProp, padding } = props;",
    "  return { label, magicProp, padding };",
    "};",
    "",
  ].join("\n"),
  "src/widgets/Clean.js": [
    "export const Clean = (props = {}) => {",
    "  const { label, padding } = props;",
    "  return { label, padding };",
    "};",
    "",
  ].join("\n"),
  "src/widgets/Promised.js": [
    "export const Promised = (props = {}) => {",
    "  const { label } = props;",
    "  return { label };",
    "};",
    "",
  ].join("\n"),
  // Declared `props?:`, read without a default: an omitted argument throws.
  "src/widgets/Optional.js": [
    "export const Optional = (props) => {",
    "  const { label } = props;",
    "  return { label };",
    "};",
    "",
  ].join("\n"),
  // Declared `props?:` and the default keeps the promise.
  "src/widgets/OptionalOk.js": [
    "export const OptionalOk = (props = {}) => {",
    "  const { label } = props;",
    "  return { label };",
    "};",
    "",
  ].join("\n"),
  // The second optional parameter has no default: the promise breaks there.
  "src/widgets/Edge.js": [
    "export const Edge = (width = 1, color) => {",
    "  return `${width}px ${color}`;",
    "};",
    "",
  ].join("\n"),
  "src/widgets/EdgeOk.js": [
    "export const EdgeOk = (width = 1, color = \"red\") => {",
    "  return `${width}px ${color}`;",
    "};",
    "",
  ].join("\n"),
  "docs/widget/Gap.md": [
    "# Gap",
    "",
    "## Props",
    "",
    "| Prop | Type | Description |",
    "| --- | --- | --- |",
    "| `label` | `string` | The label. |",
    "",
  ].join("\n"),
  "docs/widget/Clean.md": [
    "# Clean",
    "",
    "## Props",
    "",
    "| Prop | Type | Description |",
    "| --- | --- | --- |",
    "| `label` | `string` | The label. |",
    "| `padding` | `number` | Space inside. |",
    "",
  ].join("\n"),
  // `phantomProp` is promised by the doc page and implemented nowhere: DOC-ONLY.
  "docs/widget/Promised.md": [
    "# Promised",
    "",
    "## Props",
    "",
    "| Prop | Type | Description |",
    "| --- | --- | --- |",
    "| `label` | `string` | The label. |",
    "| `phantomProp` | `string` | Promised here, implemented nowhere. |",
    "",
  ].join("\n"),
};

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "fletbox-api-contract-"));
const fixtureRoot = path.join(scratch, "app");
const fixturePkg = path.join(fixtureRoot, "node_modules", "flet-box");

for (const [name, source] of Object.entries(FIXTURE)) {
  const full = path.join(fixturePkg, name);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, source, "utf8");
}

const fixtureApi = await loadApi(fixtureRoot);
const fixtureDefinitions = definitionIndex(fixtureApi.dir);
const fixtureGap = unpackWidget(fixtureApi, "Gap", fixtureDefinitions);
const fixtureClean = unpackWidget(fixtureApi, "Clean", fixtureDefinitions);
const fixturePromised = unpackWidget(fixtureApi, "Promised", fixtureDefinitions);

await check("DEAD fires on a prop nobody reads", () => {
  const dead = fixtureGap.gaps.dead.map((p) => p.prop);
  if (!dead.includes("ghostProp")) {
    throw new Error(`no dead prop reported — got ${JSON.stringify(dead)}`);
  }
});

await check("INVENTED fires on a prop nobody declares", () => {
  const invented = fixtureGap.gaps.invented.map((p) => p.prop);
  if (!invented.includes("magicProp")) {
    throw new Error(`no invented prop reported — got ${JSON.stringify(invented)}`);
  }
});

await check("UNDOCUMENTED fires on a prop the interface hides", () => {
  const hidden = fixtureGap.gaps.hidden.map((p) => p.prop);
  if (!hidden.includes("padding")) {
    throw new Error(`no hidden prop reported — got ${JSON.stringify(hidden)}`);
  }
});

await check("DOC-ONLY fires on a prop the doc page promises", () => {
  if (!fixturePromised.gaps.docOnly.includes("phantomProp")) {
    throw new Error(
      `no doc-only prop reported — got ${JSON.stringify(fixturePromised.gaps.docOnly)}`,
    );
  }
});

await check("a widget whose surfaces agree reports nothing", () => {
  const gaps = fixtureClean.gaps;
  const found = [
    ...gaps.dead.map((p) => `DEAD ${p.prop}`),
    ...gaps.invented.map((p) => `INVENTED ${p.prop}`),
    ...gaps.hidden.map((p) => `UNDOCUMENTED ${p.prop}`),
    ...gaps.docOnly.map((p) => `DOC-ONLY ${p}`),
  ];
  if (found.length) throw new Error(`a clean widget was reported: ${found.join(", ")}`);
});

await check("the fixture is read as package code, not as app code", () => {
  if (!fixtureApi.dir.includes("node_modules")) {
    throw new Error("the fixture package was not resolved from node_modules");
  }
  if (!fixtureDefinitions.get("Gap")?.endsWith("widgets/Gap.js")) {
    throw new Error(
      `the widget was not mapped to its own file — got ${fixtureDefinitions.get("Gap")}`,
    );
  }
});

const fixtureOptional = optionalCalls(fixtureApi, fixtureDefinitions);

await check("OPTIONAL-CALL fires on a widget that cannot be called with no arguments", () => {
  const reported = fixtureOptional.map((item) => item.name);
  if (!reported.includes("Optional")) {
    throw new Error(`no optional-call reported — got ${JSON.stringify(reported)}`);
  }
});

await check("OPTIONAL-CALL fires on any optional parameter without a default", () => {
  const reported = fixtureOptional.map((item) => item.name);
  if (!reported.includes("Edge")) {
    throw new Error(
      `an optional second parameter with no default was accepted — got ${JSON.stringify(reported)}`,
    );
  }
});

await check("a widget that honours its promise is not reported", () => {
  const reported = fixtureOptional.map((item) => item.name);
  for (const name of ["OptionalOk", "EdgeOk"]) {
    if (reported.includes(name)) {
      throw new Error(`${name} has a default and was reported — got ${JSON.stringify(reported)}`);
    }
  }
});

fs.rmSync(scratch, { recursive: true, force: true });

// ---------------------------------------------------------------------------
// 2. The real framework: the debt is measured and pinned.
// ---------------------------------------------------------------------------

const api = await loadApi(root);
const definitions = definitionIndex(api.dir);
const widgets = api.exports
  .filter((name) => /^[A-Z]/.test(name) && propsSource(api, name))
  .sort();

/**
 * The debt, widget by widget, for the families that may only shrink.
 *
 * @returns {Record<string, string[]>}
 */
const measure = () => {
  const found = {};
  for (const name of widgets) {
    const data = unpackWidget(api, name, definitions);
    const hidden = data.gaps.hidden.map((p) => p.prop).sort();
    if (hidden.length) found[name] = hidden;
  }
  return found;
};

/**
 * The families that must be empty: a prop that does nothing, a prop nobody
 * declared, a prop the doc page promises and the code has never heard of.
 *
 * @returns {string[]}
 */
const absoluteGaps = () => {
  const found = [];
  for (const name of widgets) {
    const data = unpackWidget(api, name, definitions);
    for (const p of data.gaps.dead) found.push(`${name}: DEAD ${p.prop}`);
    for (const p of data.gaps.invented) found.push(`${name}: INVENTED ${p.prop}`);
    for (const p of data.gaps.docOnly) found.push(`${name}: DOC-ONLY ${p}`);
  }
  return found;
};

/**
 * The props the baseline does not cover: the debt that grew.
 *
 * @param {Record<string, string[]>} current
 * @param {Record<string, string[]>} baseline
 * @returns {string[]}
 */
const newDebt = (current, baseline) => {
  const fresh = [];
  for (const [name, list] of Object.entries(current)) {
    const allowed = new Set(baseline[name] || []);
    for (const prop of list) if (!allowed.has(prop)) fresh.push(`${name}: ${prop}`);
  }
  return fresh;
};

const writeBaseline = process.argv.includes("--write-baseline");

if (writeBaseline) {
  const current = measure();
  fs.writeFileSync(baselinePath, JSON.stringify(current, null, 2) + "\n", "utf8");
  const total = Object.values(current).reduce((n, list) => n + list.length, 0);
  console.log(
    `api-contract-baseline.json escrito: ${total} props sin declarar en ${Object.keys(current).length} widgets.`,
  );
  process.exit(0);
}

await check("the framework declares no dead prop, no invented prop, no doc-only prop", () => {
  const found = absoluteGaps();
  if (found.length) {
    throw new Error(`${found.length} disagreement(s): ${found.slice(0, 12).join("; ")}`);
  }
});

await check("every widget declared `props?:` can be called with no arguments", () => {
  const found = optionalCalls(api, definitions);
  if (found.length) {
    throw new Error(
      `${found.length} widget(s) promise an optional argument they cannot take: ` +
        found.map((item) => `${item.name} (${item.why})`).join("; "),
    );
  }
});

await check("the optional-call rule is alive (some widget declares an optional argument)", () => {
  const declared = [...api.signatures.entries()].filter(
    ([name, signature]) => /^[A-Z]/.test(name) && signature.params[0]?.optional,
  );
  if (!declared.length) {
    throw new Error(
      "no widget declares an optional argument — the rule would never fire",
    );
  }
});

await check("the undocumented props do not grow", () => {
  if (!fs.existsSync(baselinePath)) {
    throw new Error(
      "scripts/api-contract-baseline.json is missing — run this script with --write-baseline",
    );
  }
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  const fresh = newDebt(measure(), baseline);
  if (fresh.length) {
    throw new Error(
      `${fresh.length} new undocumented prop(s): ${fresh.slice(0, 12).join(", ")} — ` +
        `the interface hides a prop the widget really reads, so the editor underlines a call that works`,
    );
  }
});

await check("the debt check bites", () => {
  if (!fs.existsSync(baselinePath)) {
    throw new Error("scripts/api-contract-baseline.json is missing");
  }
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  const current = measure();
  // One widget that reads one more prop than its interface declares: exactly
  // the shape of the debt this script exists to stop.
  const grown = { ...current, Icon: [...(current.Icon || []), "boxSizing"] };
  const fresh = newDebt(grown, baseline);
  if (!fresh.length) {
    throw new Error("a widget that grew an undocumented prop was accepted");
  }
});

const stale = (() => {
  if (!fs.existsSync(baselinePath)) return [];
  const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
  const current = measure();
  const out = [];
  for (const [name, list] of Object.entries(baseline)) {
    const now = new Set(current[name] || []);
    for (const prop of list) if (!now.has(prop)) out.push(`${name}: ${prop}`);
  }
  return out;
})();

if (stale.length) {
  console.log(
    `\n${stale.length} entrada(s) del baseline ya están resueltas — regenera con --write-baseline:`,
  );
  for (const s of stale.slice(0, 10)) console.log(`  · ${s}`);
}

console.log(
  failures.length
    ? `\n❌ ${failures.length} API contract failure(s): ${failures.join(", ")}\n`
    : "\n✅ The API surfaces agree, and the debt did not grow.\n",
);
process.exit(failures.length ? 1 : 0);
