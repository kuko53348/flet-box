/**
 * @file bin/commands/checkStructure.js
 * @description The structural gate — how the app's own modules are wired.
 *
 * Three mistakes a static pass can prove, and that no other gate in this repo
 * covers:
 *
 *   CIRCULAR_IMPORT     — two modules import each other. The cycle is legal
 *                         JavaScript and it loads; what it breaks is the *next*
 *                         edit, because the module being changed is half
 *                         initialised when the other one reads it.
 *   SOURCE_OUTSIDE_ROOT — a module that lives outside the folders the project
 *                         is built from. It works today and is invisible to
 *                         everyone who opens the project expecting `src/`.
 *   HAND_WRITTEN_DOM    — `innerHTML` and friends in app code. The framework
 *                         has exactly one rendering engine; writing markup by
 *                         hand is how a screen ends up speaking two visual
 *                         languages at once.
 *
 * The plan named four structure rules. Two of them already have an owner and
 * are deliberately not repeated here: `check-api` reports `MODULE_NOT_FOUND`
 * and `MISSING_EXPORT` for a broken import, and `check-ui` reports the
 * hex / off-scale / unlabelled-control rules. A second copy of a rule is a
 * second thing to keep in sync, so this file owns only what nothing else does.
 *
 * Node core only: this file ships inside every app `flet-box create` builds.
 */

import fs from "node:fs";
import path from "node:path";
import { loadApi } from "./checkApi.js";
import { resolveLocalModule } from "../utils/moduleExports.js";
import { neutralise } from "../utils/neutralise.js";
import { c, banner, section } from "../utils/colors.js";

/**
 * The severity each code carries.
 */
export const STRUCTURE_CODES = {
  CIRCULAR_IMPORT: "error",
  SOURCE_OUTSIDE_ROOT: "error",
  HAND_WRITTEN_DOM: "error",
};

/** Folders that hold build output or another toolchain's sources. */
const IGNORED_FOLDERS = new Set([
  "node_modules",
  "www",
  "dist",
  "build",
  "coverage",
  "android",
  "ios",
  "Pods",
  "DerivedData",
]);

/** Where an app's own code lives, and the files that may sit at its root. */
const APP_FOLDERS = ["src", "scripts", "tools", "assets", "public"];
const APP_ENTRIES = [
  "app.js",
  "main.js",
  "index.js",
  "loader.js",
  "service-worker.js",
  "sw.js",
];

/** The framework checkout has its own shape, and its own root file. */
const FRAMEWORK_FOLDERS = ["src", "bin", "scripts", "tests", "tools", "docs"];
const FRAMEWORK_ENTRIES = ["service-worker.js"];

/**
 * Markup written by hand. `innerHTML` is also the one that turns a string from
 * the network into executable markup, so it is the loudest of the four.
 */
const MARKUP_WRITES = [
  { pattern: /\binnerHTML\b/, word: "innerHTML" },
  { pattern: /\bouterHTML\b/, word: "outerHTML" },
  { pattern: /\binsertAdjacentHTML\b/, word: "insertAdjacentHTML" },
  { pattern: /\bdocument\s*\.\s*write\b/, word: "document.write" },
];

/** An element built by hand is a widget built by hand, one layer down. */
const ELEMENT_WRITES = [{ pattern: /\bdocument\s*\.\s*createElement\b/, word: "document.createElement" }];

/**
 * Every JavaScript file of a project, skipping build output and dot folders.
 *
 * @param {string} root
 * @returns {string[]} absolute paths
 */
export const collectProjectSources = (root) => {
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
        if (entry.name.startsWith(".") || IGNORED_FOLDERS.has(entry.name)) continue;
        walk(full);
      } else if (/\.(m?js)$/.test(entry.name)) {
        files.push(full);
      }
    }
  };
  walk(root);
  return files;
};

/**
 * The line a match sits on.
 *
 * @param {string} code
 * @param {number} index
 * @returns {number}
 */
const lineAt = (code, index) => code.slice(0, index).split("\n").length;

/**
 * Whether a file belongs to the app being judged, or to the framework itself.
 *
 * The framework *is* the rendering engine, so `document.createElement` inside
 * it is the job, not a violation. The package directory is what tells the two
 * apart: inside the framework checkout it is the checkout, and every file
 * under it belongs to the package.
 *
 * @param {string} file
 * @param {string} packageDir
 * @returns {boolean}
 */
const isAppCode = (file, packageDir) => {
  const rel = path.relative(packageDir, file);
  return rel.startsWith("..") || path.isAbsolute(rel);
};

/**
 * The local modules a file imports, as absolute paths.
 *
 * Only relative specifiers matter here: a bare `flet-box` goes to the
 * package, which cannot be part of the app's own cycle.
 *
 * @param {string} file
 * @param {string} code neutralised source, strings kept
 * @returns {Array<{target: string, line: number}>}
 */
export const localImports = (file, code) => {
  const found = [];
  const specRe = /(?:\bfrom\s*|\bimport\s*|\bimport\s*\(\s*)['"]([^'"]+)['"]/g;
  let match;
  while ((match = specRe.exec(code))) {
    const spec = match[1];
    if (!spec.startsWith(".") && !spec.startsWith("/")) continue;
    const target = resolveLocalModule(file, spec);
    if (!target) continue;
    found.push({ target, line: lineAt(code, match.index) });
  }
  return found;
};

/**
 * Every cycle in the project's import graph.
 *
 * A depth-first walk with three colours: a node still on the stack is a back
 * edge, and the path from it back to the top of the stack is the cycle.
 *
 * @param {string[]} files
 * @returns {Array<{cycle: string[], file: string, line: number}>}
 */
export const findCycles = (files) => {
  const graph = new Map();
  for (const file of files) {
    let raw;
    try {
      raw = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const code = neutralise(raw, { keepStrings: true });
    graph.set(file, localImports(file, code));
  }

  const cycles = [];
  const seen = new Set();
  const state = new Map();

  const walk = (node, stack) => {
    state.set(node, "open");
    stack.push(node);
    for (const edge of graph.get(node) || []) {
      if (!graph.has(edge.target)) continue;
      if (state.get(edge.target) === "open") {
        const start = stack.indexOf(edge.target);
        const cycle = stack.slice(start).concat(edge.target);
        const key = [...cycle].sort().join("|");
        if (!seen.has(key)) {
          seen.add(key);
          cycles.push({
            cycle,
            file: edge.target,
            line: edge.line,
          });
        }
        continue;
      }
      if (!state.has(edge.target)) walk(edge.target, stack);
    }
    stack.pop();
    state.set(node, "closed");
  };

  for (const file of files) {
    if (!state.has(file)) walk(file, []);
  }
  return cycles;
};

/**
 * Scan a project for the three structural mistakes.
 *
 * @param {string} root
 * @param {{ packageDir?: string }} [options]
 * @returns {Promise<object[]>} findings
 */
export const scanStructure = async (root, options = {}) => {
  const findings = [];
  let packageDir = options.packageDir;
  if (!packageDir) {
    try {
      packageDir = (await loadApi(root)).dir;
    } catch {
      packageDir = root;
    }
  }

  const files = collectProjectSources(root);
  const isFramework = path.resolve(root) === path.resolve(packageDir);
  const folders = isFramework ? FRAMEWORK_FOLDERS : APP_FOLDERS;
  const entries = isFramework ? FRAMEWORK_ENTRIES : APP_ENTRIES;

  // --- a module outside the folders the project is built from --------------
  for (const file of files) {
    const rel = path.relative(root, file);
    if (!rel || rel.startsWith("..")) continue;
    const parts = rel.split(path.sep);
    const allowed = parts.length === 1 ? entries.includes(parts[0]) : folders.includes(parts[0]);
    if (allowed) continue;
    findings.push({
      file,
      line: 1,
      code: "SOURCE_OUTSIDE_ROOT",
      severity: STRUCTURE_CODES.SOURCE_OUTSIDE_ROOT,
      message: `${rel} is a module outside the folders this project is built from`,
      detail: `Only ${folders.join(", ")} belong to the project, and ${entries.join(", ")} may sit at its root.`,
      suggestion: `move it to src/ and update the specifiers that point at it`,
    });
  }

  // --- a cycle between two of the project's own modules --------------------
  for (const cycle of findCycles(files)) {
    const names = cycle.cycle.map((file) => path.relative(root, file));
    findings.push({
      file: cycle.file,
      line: cycle.line,
      code: "CIRCULAR_IMPORT",
      severity: STRUCTURE_CODES.CIRCULAR_IMPORT,
      message: `circular import: ${names.join(" → ")}`,
      detail:
        "The cycle loads, but every module in it is half-initialised when the next one reads it, so the next edit is the one that breaks.",
      suggestion: "move the shared piece into a third module that both of them import",
    });
  }

  // --- markup written by hand in app code ----------------------------------
  for (const file of files) {
    if (!isAppCode(file, packageDir)) continue;
    let raw;
    try {
      raw = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const code = neutralise(raw);
    for (const { pattern, word } of MARKUP_WRITES) {
      const match = pattern.exec(code);
      if (!match) continue;
      findings.push({
        file,
        line: lineAt(code, match.index),
        code: "HAND_WRITTEN_DOM",
        severity: STRUCTURE_CODES.HAND_WRITTEN_DOM,
        message: `${word} writes the DOM by hand in app code`,
        detail:
          "There is one rendering engine in FletBox. A hand-written element skips it, so it misses the theme, the scale and the accessibility the widgets already have.",
        suggestion: "build the screen with the widgets — Container({ … }), Text({ … }) — instead of markup",
      });
    }
    for (const { pattern, word } of ELEMENT_WRITES) {
      const match = pattern.exec(code);
      if (!match) continue;
      findings.push({
        file,
        line: lineAt(code, match.index),
        code: "HAND_WRITTEN_DOM",
        severity: "warn",
        message: `${word} builds an element by hand in app code`,
        detail:
          "It works, and it is the one place where a screen stops speaking the framework's visual language.",
        suggestion: "use the widget that draws it — if none does, say so and ask for one",
      });
    }
  }

  return findings;
};

/**
 * The `flet-box check-structure` command.
 *
 * @param {string[]} argv
 * @param {{print?: (line: string) => void}} [io]
 * @returns {Promise<{findings: object[], exitCode: number}>}
 */
export const checkStructure = async (argv = [], io = {}) => {
  const print = io.print ?? ((line) => console.log(line));
  const rootIndex = argv.indexOf("--root");
  const root = path.resolve(
    rootIndex >= 0 && argv[rootIndex + 1] ? argv[rootIndex + 1] : process.cwd(),
  );
  const asJson = argv.includes("--json");

  const findings = await scanStructure(root);
  const errors = findings.filter((item) => item.severity === "error");

  if (asJson) {
    print(JSON.stringify({ root, findings }, null, 2));
  } else {
    print(banner("🧱 FletBox structure", path.basename(root)));
    print("");
    if (!findings.length) {
      print(c("green", "✓ every module sits where the project expects it, and nothing imports in a circle"));
    } else {
      for (const item of findings) {
        const where = c("brightCyan", `${path.relative(root, item.file)}:${item.line}`);
        const mark = item.severity === "error" ? c("red", "✗") : c("yellow", "!");
        print(`  ${mark} ${where}  ${c("yellow", item.code)} — ${item.message}`);
        if (item.detail) print(`     ${c("gray", item.detail)}`);
        if (item.suggestion) print(`     ${c("gray", "→ " + item.suggestion)}`);
      }
      print("");
      print(
        errors.length
          ? c("red", `❌ ${errors.length} error(s), ${findings.length - errors.length} warning(s)`)
          : c("yellow", `${findings.length} warning(s) — no error`),
      );
    }
    print("");
  }

  return { findings, exitCode: errors.length ? 1 : 0 };
};

export default checkStructure;
