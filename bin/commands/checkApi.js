// bin/commands/checkApi.js
// ============================================================
// FLETBOX API VALIDATOR — THE ANTI-HALLUCINATION GATE
// ============================================================
// An AI assistant editing an app invents APIs: `Card({ shadow: 3 })`,
// `import { Button } from 'react'`, `ListView({ items: [] })`. None of that
// throws — the factory drops unknown keys with a console warning, so the app
// silently renders the wrong thing and the user burns tokens re-reading files.
//
// This command compares the app against the framework that is actually
// installed, resolved from `node_modules/flet-box` (never from the network):
//
//   • the export list   — from the runtime barrel, imported in Node
//   • the engine props  — from `widget-factory/translateProps.js` `ALL_PROPS`
//   • the declared API  — from the shipped `index.d.ts` interfaces
//
// and statically scans the app's own sources for calls of those imports.
// Everything it reports is a call site that cannot work as written.
//
// Usage:
//   flet-box check-api                 validate this project (exit 1 on errors)
//   flet-box check-api --props Button  print one widget's real contract
//   flet-box check-api --list          list every widget and utility
//   flet-box check-api --emit-api      write .fletbox/api/cheatsheet.md
//   flet-box check-api --json          machine-readable report
// ============================================================

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  parseInterfaces,
  parseSignatures,
  resolveInterfaceProps,
} from "../utils/dtsProps.js";
import { c, banner, section } from "../utils/colors.js";
import { neutralise } from "../utils/neutralise.js";
import { resolveLocalModule, readModuleExports } from "../utils/moduleExports.js";
import { deprecationFor } from "../../src/widget-factory/deprecations.js";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PACKAGE_DIR = path.join(__dirname, "..", "..");

/** Keys the factory itself reads, so they are never "invented props". */
export const STRUCTURAL_PROPS = new Set([
  "child",
  "children",
  "tag",
  "widgetName",
  "style",
  "update",
  "getProps",
  "onMount",
  "onUnmount",
  "triggerMount",
  "_cleanup",
  "key",
]);

/** Stacks that must never appear in a FletBox app — the point is zero deps. */
const FOREIGN_PACKAGES = [
  "react",
  "react-dom",
  "next",
  "vue",
  "nuxt",
  "svelte",
  "solid-js",
  "preact",
  "angular",
  "@angular/core",
  "jquery",
  "lit",
  "lit-html",
  "alpinejs",
  "bootstrap",
  "tailwindcss",
];

const FOREIGN_EXTENSIONS = [".jsx", ".tsx", ".vue", ".svelte", ".angular"];

/**
 * Locate the installed `flet-box` package the app should be validated against.
 *
 * @param {string} projectRoot
 * @returns {{ dir: string, pkg: object }}
 */
const resolvePackage = (projectRoot) => {
  const candidates = [];
  const same = (a, b) => {
    try {
      return fs.realpathSync(a) === fs.realpathSync(b);
    } catch {
      return false;
    }
  };
  // Inside the framework repository the CLI package IS the framework, so its
  // sources are the truth; a stale `node_modules/flet-box` copy (build residue)
  // would otherwise validate the app against an older version.
  const isFrameworkRepo =
    fs.existsSync(path.join(CLI_PACKAGE_DIR, "src", "widget-factory", "translateProps.js")) &&
    same(projectRoot, CLI_PACKAGE_DIR);
  if (isFrameworkRepo) candidates.push(CLI_PACKAGE_DIR);
  candidates.push(path.join(projectRoot, "node_modules", "flet-box"));
  try {
    candidates.push(path.dirname(require.resolve("flet-box/package.json")));
  } catch {
    /* not installed as a dependency — fall through */
  }
  if (!isFrameworkRepo) candidates.push(CLI_PACKAGE_DIR);

  for (const dir of candidates) {
    const ready =
      fs.existsSync(path.join(dir, "package.json")) &&
      fs.existsSync(path.join(dir, "src", "index.d.ts")) &&
      fs.existsSync(path.join(dir, "src", "widget-factory", "translateProps.js"));
    if (ready) {
      return { dir, pkg: JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8")) };
    }
  }
  throw new Error(
    "Could not find an installed flet-box package. Run `npm install` in the project.",
  );
};

/**
 * Read the three surfaces of the installed framework.
 *
 * @param {string} projectRoot
 * @returns {Promise<object>}
 */
export const loadApi = async (projectRoot) => {
  const { dir, pkg } = resolvePackage(projectRoot);
  const barrel = await import(pathToFileURL(path.join(dir, "src", "index.js")).href);
  const registry = await import(
    pathToFileURL(path.join(dir, "src", "widget-factory", "translateProps.js")).href
  );
  const dts = fs.readFileSync(path.join(dir, "src", "index.d.ts"), "utf8");
  return {
    dir,
    pkg,
    exports: Object.keys(barrel).filter((name) => name !== "default"),
    PROP_MAP: registry.PROP_MAP,
    ALL_PROPS: registry.ALL_PROPS,
    interfaces: parseInterfaces(dts),
    signatures: parseSignatures(dts),
  };
};

/**
 * Edit distance, used only to answer "did you mean …?" cheaply.
 *
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export const distance = (a, b) => {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 3) return 99;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const row = [i];
    for (let j = 1; j <= n; j++) {
      row[j] = Math.min(
        prev[j] + 1,
        row[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = row;
  }
  return prev[n];
};

/**
 * Nearest candidate for a mistyped name.
 *
 * @param {string} value
 * @param {Iterable<string>} candidates
 * @returns {string | null}
 */
export const nearest = (value, candidates) => {
  let best = null;
  let bestScore = 4; // never suggest for names that are simply unrelated
  const lower = value.toLowerCase();
  for (const candidate of candidates) {
    const score = distance(lower, candidate.toLowerCase());
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return best;
};

/**
 * Collect the source files an app is made of.
 *
 * @param {string} projectRoot
 * @returns {string[]}
 */
export const collectSources = (projectRoot) => {
  const files = [];
  const walk = (dir) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
        walk(full);
      } else if (/\.(m?js)$/.test(entry.name)) {
        files.push(full);
      } else if (FOREIGN_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
        files.push(full);
      }
    }
  };
  walk(path.join(projectRoot, "src"));
  for (const rootFile of ["app.js", "main.js"]) {
    const full = path.join(projectRoot, rootFile);
    if (fs.existsSync(full)) files.push(full);
  }
  return files;
};

/**
 * Read the keys of an object literal starting at its opening brace.
 *
 * Only the object's own level is scanned: a comma inside an array, a call or a
 * nested brace belongs to that inner expression, not to the props object.
 * Without the group counter, `children: [slot, line]` was split on its inner
 * commas and every widget variable in the list was reported as a shorthand prop
 * (`Column({ line })` — UNKNOWN_PROP), which is the single most common shape in
 * a FletBox app.
 *
 * @param {string} code Comment/string-free source.
 * @param {number} open Index of `{`.
 * @returns {{ keys: string[], opaque: boolean }} `opaque` when a top-level
 *   spread makes the real key set unknowable, so no missing prop is claimed.
 */
const literalKeys = (code, open) => {
  const keys = [];
  let depth = 0;
  let group = 0;
  let current = "";
  let opaque = false;
  const flush = () => {
    const text = current.trim();
    current = "";
    if (!text) return;
    if (text.startsWith("...")) {
      opaque = true;
      return;
    }
    const key = /^(?:async\s+)?['"]?([A-Za-z_$][\w$]*)['"]?\s*:/.exec(text);
    if (key) keys.push(key[1]);
    else if (/^[A-Za-z_$][\w$]*$/.test(text)) keys.push(text); // shorthand
  };
  for (let i = open; i < code.length; i++) {
    const ch = code[i];
    if (ch === "{") {
      depth++;
      if (depth === 1) continue;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        flush();
        return { keys, opaque };
      }
    } else if (ch === "[" || ch === "(") {
      group++;
    } else if (ch === "]" || ch === ")") {
      if (group > 0) group--;
    } else if (depth === 1 && group === 0 && ch === ",") {
      flush();
      continue;
    }
    if (depth >= 1) current += ch;
  }
  flush();
  return { keys, opaque };
};

const lineOf = (source, index) =>
  source.slice(0, index).split("\n").length;

/**
 * Analyse one app file against the installed API.
 *
 * @param {string} file
 * @param {object} api
 * @returns {Array<object>} findings
 */
const checkFile = (file, api) => {
  const findings = [];
  const raw = fs.readFileSync(file, "utf8");
  const code = neutralise(raw);
  // Module specifiers live in strings, so the import pass keeps them intact.
  const importCode = neutralise(raw, { keepStrings: true });
  const rel = path.relative(process.cwd(), file);

  const add = (index, code_, message, suggestion) =>
    findings.push({
      file: rel,
      line: lineOf(raw, index),
      code: code_,
      message,
      suggestion: suggestion || null,
    });

  if (FOREIGN_EXTENSIONS.some((ext) => file.endsWith(ext))) {
    add(0, "WRONG_STACK", "a React/Svelte/Vue-style file cannot run in FletBox");
    return findings;
  }

  // ---- imports -------------------------------------------------------------
  const localToExported = new Map();
  const importRe =
    /import\s+([\s\S]*?)\s*from\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRe.exec(importCode))) {
    const clause = match[1];
    const source = match[2];
    const index = match.index;

    const root = source.split("/")[0].startsWith("@")
      ? source.split("/").slice(0, 2).join("/")
      : source.split("/")[0];
    if (FOREIGN_PACKAGES.includes(root)) {
      add(
        index,
        "WRONG_STACK",
        `imports "${source}" — FletBox apps are dependency-free vanilla JS`,
      );
      continue;
    }
    if (source === "flet-box") {
      // handled below
    } else if (source.startsWith("flet-box/")) {
      add(
        index,
        "DEEP_IMPORT",
        `deep import "${source}" is not a public entry point`,
        "import from 'flet-box' instead",
      );
      continue;
    } else if (source.startsWith(".") || source.startsWith("/")) {
      // The app's own wiring. A name that is not exported here is `undefined`
      // at runtime, which renders a blank screen and throws no error the checker
      // could catch later, so it is verified against the target file's exports.
      const target = resolveLocalModule(file, source);
      if (!target) {
        add(
          index,
          "MODULE_NOT_FOUND",
          `"${source}" does not resolve to a file`,
          "fix the path, or create the module",
        );
        continue;
      }
      const surface = readModuleExports(target, api.moduleCache);
      const braces = /\{([^}]*)\}/.exec(clause);
      const head = clause.replace(/\{[^}]*\}/g, "").replace(/\*[\s\S]*$/, "").trim();
      const defaultName = /^([A-Za-z_$][\w$]*)\s*,?\s*$/.exec(head);
      if (defaultName && !surface.hasDefault && !surface.opaque) {
        const first = surface.named.values().next().value;
        add(
          index,
          "MISSING_EXPORT",
          `"${source}" has no default export, so ${defaultName[1]} is undefined at runtime`,
          first ? `import { ${first} } from '${source}'` : null,
        );
      }
      if (braces) {
        for (const part of braces[1].split(",")) {
          const token = part.trim();
          if (!token) continue;
          const aliased = /^(\S+)\s+as\s+(\S+)$/.exec(token);
          const wanted = aliased ? aliased[1] : token;
          if (surface.opaque || surface.named.has(wanted)) continue;
          add(
            index,
            "MISSING_EXPORT",
            `"${wanted}" is not exported by ${source}`,
            nearest(wanted, [...surface.named]),
          );
        }
      }
      continue;
    } else {
      continue;
    }

    const braces = /\{([^}]*)\}/.exec(clause);
    const names = [];
    if (braces) {
      for (const part of braces[1].split(",")) {
        const token = part.trim();
        if (!token) continue;
        const aliased = /^(\S+)\s+as\s+(\S+)$/.exec(token);
        names.push(aliased ? { exported: aliased[1], local: aliased[2] } : { exported: token, local: token });
      }
    }
    const star = /\*\s+as\s+([A-Za-z_$][\w$]*)/.exec(clause);
    if (star) {
      // Namespace import: every `fb.Widget(...)` call is checked below.
      names.forEach((n) => localToExported.set(`${star[1]}.${n.exported}`, n.exported));
    }
    for (const n of names) {
      localToExported.set(n.local, n.exported);
      if (!api.exports.includes(n.exported)) {
        add(
          index,
          "UNKNOWN_EXPORT",
          `"${n.exported}" is not exported by flet-box@${api.pkg.version}`,
          nearest(n.exported, api.exports),
        );
      }
    }
  }

  // ---- local re-exports ----------------------------------------------------
  // `export { NewScreen } from './screens/NewScreen.js'` in a barrel is how an
  // agent adds a screen; a typo there is invisible until the route renders blank.
  const reExportRe = /export\s*\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g;
  let reExport;
  while ((reExport = reExportRe.exec(importCode))) {
    const source = reExport[2];
    if (!source.startsWith(".") && !source.startsWith("/")) continue;
    const target = resolveLocalModule(file, source);
    if (!target) {
      add(
        reExport.index,
        "MODULE_NOT_FOUND",
        `"${source}" does not resolve to a file`,
        "fix the path, or create the module",
      );
      continue;
    }
    const surface = readModuleExports(target, api.moduleCache);
    for (const part of reExport[1].split(",")) {
      const token = part.trim();
      if (!token) continue;
      const aliased = /^(\S+)\s+as\s+(\S+)$/.exec(token);
      const wanted = aliased ? aliased[1] : token;
      if (wanted === "default" || surface.opaque || surface.named.has(wanted)) continue;
      add(
        reExport.index,
        "MISSING_EXPORT",
        `cannot re-export "${wanted}" — ${source} does not export it`,
        nearest(wanted, [...surface.named]),
      );
    }
  }

  // ---- call sites ----------------------------------------------------------
  const widgetNames = new Set(
    api.exports.filter((name) => /^[A-Z]/.test(name)),
  );
  for (const [local, exported] of localToExported) {
    if (local.includes(".")) continue;
    if (!widgetNames.has(exported)) continue;
    const iface = api.interfaces.get(`${exported}Props`);
    const callRe = new RegExp(`\\b${local.replace(/\$/g, "\\$")}\\s*\\(`, "g");
    let call;
    while ((call = callRe.exec(code))) {
      const open = call.index + call[0].length;
      const nextChar = code.slice(open).match(/^\s*(.)/);
      if (!nextChar) continue;
      if (nextChar[1] === "'" || nextChar[1] === '"' || nextChar[1] === "`") {
        add(
          call.index,
          "POSITIONAL_ARG",
          `${local}("…") — FletBox widgets take a props object`,
          `${local}({ … })`,
        );
        continue;
      }
      if (nextChar[1] !== "{") continue;
      if (!iface) continue; // no declared prop list: nothing to verify

      const declared = resolveInterfaceProps(api.interfaces, `${exported}Props`);
      const { keys, opaque } = literalKeys(code, open);
      // A top-level `...spread` can carry props the caller built elsewhere, so
      // claiming a key is missing would be a false positive.
      if (opaque) continue;
      for (const key of keys) {
        if (declared.has(key) || STRUCTURAL_PROPS.has(key)) continue;
        if (api.PROP_MAP[key]) {
          const def = api.PROP_MAP[key];
          // `style`/`attribute`/`event` keys are the universal CSS and DOM
          // surface — every widget accepts them, so their absence from a
          // per-widget interface is not a defect. `special`/`text` keys are
          // widget-specific behaviour: a widget that never reads one silently
          // drops it, which is the hallucination worth warning about.
          if (def.type !== "special" && def.type !== "text") continue;
          add(
            call.index,
            "UNDOCUMENTED_PROP",
            `${exported}({ ${key} }) is a widget-specific engine prop but is not in ${exported}Props — check the widget reads it`,
            nearest(key, [...declared.keys()]),
          );
          continue;
        }
        const elsewhere = [...api.interfaces.entries()]
          .filter(([name, value]) => name.endsWith("Props") && value.props.has(key))
          .map(([name]) => name.replace(/Props$/, ""));
        add(
          call.index,
          "UNKNOWN_PROP",
          `${exported}({ ${key} }) — the factory drops unknown keys, so nothing happens`,
          elsewhere.length
            ? `it is a prop of ${elsewhere.slice(0, 3).join(", ")}`
            : nearest(key, [...declared.keys()]),
        );
      }
      void opaque;
    }
  }
  return findings;
};

/** Severity gate: these codes fail `npm run check`. */
const ERROR_CODES = new Set([
  "WRONG_STACK",
  "UNKNOWN_EXPORT",
  "UNKNOWN_PROP",
  "POSITIONAL_ARG",
  "MODULE_NOT_FOUND",
  "MISSING_EXPORT",
]);

export const SEVERITY = {
  WRONG_STACK: "error",
  UNKNOWN_EXPORT: "error",
  UNKNOWN_PROP: "error",
  POSITIONAL_ARG: "error",
  MODULE_NOT_FOUND: "error",
  MISSING_EXPORT: "error",
  UNDOCUMENTED_PROP: "warn",
  DEEP_IMPORT: "warn",
};

/**
 * Print one widget's real contract, from the installed package.
 *
 * @param {object} api
 * @param {string} name
 * @returns {string}
 */
const printProps = (api, name) => {
  const ifaceName = `${name}Props`;
  if (!api.interfaces.has(ifaceName)) {
    const guess = nearest(name, api.exports.filter((n) => /^[A-Z]/.test(n)));
    return `${c("red", `✗ ${name} is not a FletBox widget`)}${
      guess ? `\n  did you mean ${c("brightCyan", guess)}?` : ""
    }\n  list them all with: flet-box check-api --list`;
  }
  const own = api.interfaces.get(ifaceName).props;
  const all = resolveInterfaceProps(api.interfaces, ifaceName);
  const lines = [];
  lines.push(`${c("bold", gradientSafe(name))} — ${own.size} own props, ${all.size} accepted\n`);
  lines.push(`${c("gray", "  own:")}`);
  for (const [prop, info] of own) lines.push(`    ${entry(prop, info, api)}`);
  const inherited = [...all].filter(([prop]) => !own.has(prop));
  if (inherited.length) {
    lines.push(`${c("gray", `  inherited (${inherited.length}):`)}`);
    for (const [prop, info] of inherited) lines.push(`    ${entry(prop, info, api)}`);
  }
  const widget = path.join(api.dir, "docs", "widget", `${name}.md`);
  if (fs.existsSync(widget)) {
    lines.push(`\n  ${c("gray", `semantics + examples: ${widget}`)}`);
  }
  return lines.join("\n");
};

const gradientSafe = (text) => text;

const entry = (prop, info, api) => {
  const def = api.PROP_MAP[prop];
  const detail = def
    ? `${def.type}${def.unit && def.unit !== "none" ? `:${def.unit}` : ""}`
    : "widget-read";
  const type = info.type.length > 58 ? `${info.type.slice(0, 55)}…` : info.type;
  return `${c("brightCyan", prop.padEnd(18))}${c("gray", detail.padEnd(14))}${type}`;
};

/**
 * Generate the condensed, always-accurate API sheet the in-app agent reads once.
 *
 * @param {object} api
 * @param {string} projectRoot
 * @returns {string} written path
 */
export const emitCheatsheet = (api, projectRoot) => {
  const widgetNames = api.exports
    .filter((name) => /^[A-Z]/.test(name) && api.interfaces.has(`${name}Props`))
    .sort();
  const otherNames = api.exports.filter((name) => !/^[A-Z]/.test(name)).sort();
  const common = api.interfaces.get("CommonProps");
  const out = [];
  out.push(`# FletBox API — generated, do not edit`);
  out.push(``);
  out.push(
    `Source of truth: \`flet-box@${api.pkg.version}\` in \`node_modules/flet-box\`. ` +
      `Regenerate with \`flet-box check-api --emit-api\`.`,
  );
  out.push(`Widgets: ${widgetNames.length} · engine props: ${api.ALL_PROPS.length}`);
  out.push(
    `A prop marked \`(deprecated → x)\` still works and is not the name to write; ` +
      `\`npm run fix\` renames the call it can prove.`,
  );
  out.push(``);
  out.push(`## Common props (every widget)`);
  out.push(
    [...common.props.keys()]
      .map((p) => `${p}${common.props.get(p).optional ? "?" : ""}`)
      .join(" · "),
  );
  out.push(``);
  for (const name of widgetNames) {
    const own = api.interfaces.get(`${name}Props`).props;
    out.push(
      `## ${name}  (${own.size})`,
      [...own]
        .map(([prop, info]) => {
          const type = info.type.length > 46 ? `${info.type.slice(0, 43)}…` : info.type;
          // The cheatsheet is the first file an agent reads, so a renamed prop has
          // to say so here. Without the marker `onPress` and `onToggle` look like
          // two equally good names, and half the calls built from this file carry
          // the one the framework is trying to retire.
          const rule = deprecationFor(name, prop);
          const mark = rule ? ` (deprecated → ${rule.to ?? "removed"})` : "";
          return `${prop}${info.optional ? "?" : ""}: ${type}${mark}`;
        })
        .join(" · "),
    );
  }
  out.push(`## Utilities and services`);
  out.push(otherNames.join(" · "));
  out.push(``);

  const dir = path.join(projectRoot, ".fletbox", "api");
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, "cheatsheet.md");
  fs.writeFileSync(target, out.join("\n"), "utf8");
  return target;
};

/**
 * `flet-box check-api` entry point.
 *
 * @param {string[]} argv Flags after the command name.
 * @param {object} [io] Injection point for tests.
 * @returns {Promise<{ findings: object[], exitCode: number }>}
 */
export const checkApi = async (argv = [], io = {}) => {
  const print = io.print ?? ((line) => console.log(line));
  const root = (() => {
    const i = argv.indexOf("--root");
    return i >= 0 && argv[i + 1] ? path.resolve(argv[i + 1]) : process.cwd();
  })();
  const api = await loadApi(root);
  // Shared across files so a barrel imported by ten screens is parsed once, and
  // so a module cycle terminates on the cached (possibly partial) surface.
  api.moduleCache = new Map();
  const wanted = (flag) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : null;
  };

  if (argv.includes("--props")) {
    const name = wanted("--props");
    if (!name) throw new Error("Usage: flet-box check-api --props <Widget>");
    print(printProps(api, name));
    return { findings: [], exitCode: 0 };
  }
  if (argv.includes("--emit-api")) {
    const target = emitCheatsheet(api, root);
    print(`${c("green", "✅")} Wrote ${path.relative(root, target)}`);
    return { findings: [], exitCode: 0 };
  }
  if (argv.includes("--list")) {
    const widgets = api.exports.filter((n) => /^[A-Z]/.test(n)).sort();
    print(
      `${c("bold", `flet-box@${api.pkg.version}`)}\n` +
        `${c("brightCyan", "widgets:")} ${widgets.join(", ")}\n` +
        `${c("gray", "engine props:")} ${api.ALL_PROPS.length} · ` +
        `declared interfaces: ${api.interfaces.size}`,
    );
    return { findings: [], exitCode: 0 };
  }

  const files = collectSources(root);
  const findings = files.flatMap((file) => checkFile(file, api));
  const errors = findings.filter((f) => ERROR_CODES.has(f.code));
  const warns = findings.filter((f) => !ERROR_CODES.has(f.code));

  if (argv.includes("--json")) {
    print(
      JSON.stringify({ package: api.pkg.version, scanned: files.length, findings }, null, 2),
    );
    return { findings, exitCode: errors.length ? 1 : 0 };
  }

  print(
    banner(
      "🔎 FletBox API check",
      `flet-box@${api.pkg.version} · ${files.length} file(s) scanned`,
    ),
  );
  if (!findings.length) {
    print(
      `\n${c("green", "✅ No invented APIs.")} ${widgetSummary(api)}\n`,
    );
    return { findings, exitCode: 0 };
  }
  const showFull = argv.includes("--full");
  const byCode = new Map();
  for (const finding of findings) {
    if (!byCode.has(finding.code)) byCode.set(finding.code, []);
    byCode.get(finding.code).push(finding);
  }
  for (const [code, list] of byCode) {
    const isWarning = SEVERITY[code] !== "error";
    const color = isWarning ? "yellow" : "red";
    print(`\n${section("!", `${code} (${list.length}) — ${SEVERITY[code]}`)}`);
    // Warnings repeat across call sites of the same widget; an agent only needs
    // the distinct ones plus where to look, so errors stay itemised and
    // warnings collapse by message.
    const groups = new Map();
    if (isWarning && !showFull) {
      for (const f of list) {
        if (!groups.has(f.message)) groups.set(f.message, []);
        groups.get(f.message).push(f);
      }
      for (const [message, hits] of groups) {
        const where = hits
          .slice(0, 2)
          .map((f) => `${f.file}:${f.line}`)
          .join(", ");
        print(
          `  ${c(color, "·")} ${message} ${c("gray", `(${hits.length}×: ${where}${hits.length > 2 ? ", …" : ""})`)}`,
        );
      }
      continue;
    }
    for (const f of list) {
      print(
        `  ${c(color, "·")} ${c("brightCyan", `${f.file}:${f.line}`)} ${f.message}` +
          (f.suggestion ? ` ${c("gray", `→ ${f.suggestion}`)}` : ""),
      );
    }
  }
  const collapsed = warns.length && !showFull;
  print(
    `\n${c("gray", `${errors.length} error(s), ${warns.length} warning(s)`)}` +
      (collapsed ? c("gray", " — add --full to list every warning site") : "") +
      (errors.length
        ? c(
            "gray",
            " — look up the real API with: flet-box check-api --props <Widget>",
          )
        : "") +
      "\n",
  );
  return { findings, exitCode: errors.length ? 1 : 0 };
};

const widgetSummary = (api) =>
  c(
    "gray",
    `${api.exports.filter((n) => /^[A-Z]/.test(n)).length} widgets, ` +
      `${api.ALL_PROPS.length} engine props available offline.`,
  );

export default checkApi;
