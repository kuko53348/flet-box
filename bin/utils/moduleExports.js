/**
 * @file bin/utils/moduleExports.js
 * @description Resolve a relative import to the export surface of the file it
 * points at, so `check-api` can catch broken wiring between an app's own
 * modules — the failure class a flet-box-only API check cannot see.
 *
 * This is a static reader, not a module loader: it never executes app code, so
 * it works offline, in CI, and on files that would throw at import time.
 */

import fs from "node:fs";
import path from "node:path";
import { neutralise } from "./neutralise.js";

const IDENT = "[A-Za-z_$][\\w$]*";

/**
 * Resolve a relative/absolute specifier the way the browser ESM loader would,
 * for the conventions this project enforces (explicit `.js` extensions).
 *
 * @param {string} fromFile Absolute path of the importing file.
 * @param {string} spec The raw specifier, e.g. `./screens/HomeScreen.js`.
 * @returns {string|null} Absolute path, or null when nothing matches.
 */
export const resolveLocalModule = (fromFile, spec) => {
  if (!spec.startsWith(".") && !spec.startsWith("/")) return null;
  const base = spec.startsWith("/")
    ? spec.slice(1)
    : path.resolve(path.dirname(fromFile), spec);
  const candidates = /\.(m?js|json)$/.test(base)
    ? [base]
    : [`${base}.js`, `${base}.mjs`, path.join(base, "index.js")];
  for (const candidate of candidates) {
    try {
      if (fs.statSync(candidate).isFile()) return candidate;
    } catch {
      /* keep looking */
    }
  }
  return null;
};

/**
 * @typedef {object} ModuleSurface
 * @property {Set<string>} named Named exports, including names re-exported from
 *   another module.
 * @property {boolean} hasDefault Whether `export default` appears.
 * @property {boolean} opaque True when the surface could not be read completely,
 *   so callers must not report missing names.
 */

const emptySurface = (opaque) => ({
  named: new Set(),
  hasDefault: false,
  opaque,
});

/**
 * Read the export surface of a local module, following re-exports.
 *
 * @param {string} absFile Absolute path of the module.
 * @param {Map<string, ModuleSurface>} [cache] Shared cache for the whole scan.
 * @param {Set<string>} [chain] Modules being resolved right now, for cycles.
 * @returns {ModuleSurface}
 */
export const readModuleExports = (absFile, cache = new Map(), chain = new Set()) => {
  if (cache.has(absFile)) return cache.get(absFile);
  // index.js -> Screen.js -> index.js must not recurse forever. Returning an
  // opaque throwaway keeps the caller from reporting names the cycle does export.
  if (chain.has(absFile)) return emptySurface(true);

  const surface = emptySurface(false);
  let raw;
  try {
    raw = fs.readFileSync(absFile, "utf8");
  } catch {
    surface.opaque = true;
    return surface;
  }
  const code = neutralise(raw, { keepStrings: true });

  // export default / export default function|class NAME
  if (new RegExp(`export\\s+default\\b`).test(code)) surface.hasDefault = true;

  // export const|let|var|function|class NAME  (incl. multi-declarator and async)
  const declRe = new RegExp(
    `export\\s+(?:async\\s+)?(?:const|let|var|function|class)\\s+(${IDENT})`,
    "g",
  );
  let decl;
  while ((decl = declRe.exec(code))) {
    surface.named.add(decl[1]);
    // `export const a = 1, b = 2;` — only accept a later name when it is
    // immediately assigned, so type-ish commas cannot invent an export.
    const tail = code.slice(decl.index + decl[0].length, code.indexOf(";", decl.index));
    const extraRe = new RegExp(`,\\s*(${IDENT})\\s*=`, "g");
    let extra;
    while ((extra = extraRe.exec(tail))) surface.named.add(extra[1]);
  }

  // export { A, B as C } [from './mod.js']
  const bracesRe = /export\s*\{([^}]*)\}(\s*from\s*['"]([^'"]+)['"])?/g;
  let braces;
  while ((braces = bracesRe.exec(code))) {
    const source = braces[3];
    let fromSurface = null;
    if (source) {
      const target = resolveLocalModule(absFile, source);
      // A specifier that is not local (a package re-export) is taken on trust:
      // guessing here would produce false alarms about the app's own files.
      if (target) {
        chain.add(absFile);
        fromSurface = readModuleExports(target, cache, chain);
        chain.delete(absFile);
      } else if (!source.startsWith(".")) {
        fromSurface = emptySurface(true);
      }
    }
    for (const part of braces[1].split(",")) {
      const token = part.trim();
      if (!token) continue;
      const aliased = new RegExp(`^(${IDENT})\\s+as\\s+(${IDENT})$`).exec(token);
      const original = aliased ? aliased[1] : token;
      const exportedAs = aliased ? aliased[2] : token;
      if (original === "default") {
        if (!source) surface.hasDefault = true;
        else surface.named.add(exportedAs);
        continue;
      }
      if (!source) {
        surface.named.add(exportedAs);
      } else if (fromSurface && !fromSurface.opaque) {
        if (fromSurface.named.has(original)) surface.named.add(exportedAs);
      } else {
        surface.named.add(exportedAs);
      }
    }
  }

  // export * [as NS] from './mod.js'
  const starRe = new RegExp(
    `export\\s+\\*\\s*(?:as\\s+(${IDENT})\\s+)?from\\s*['"]([^'"]+)['"]`,
    "g",
  );
  let star;
  while ((star = starRe.exec(code))) {
    if (star[1]) {
      surface.named.add(star[1]);
      continue;
    }
    const target = resolveLocalModule(absFile, star[2]);
    if (!target) {
      if (!star[2].startsWith(".")) surface.opaque = true;
      continue;
    }
    chain.add(absFile);
    const fromSurface = readModuleExports(target, cache, chain);
    chain.delete(absFile);
    for (const name of fromSurface.named) surface.named.add(name);
    if (fromSurface.opaque) surface.opaque = true;
  }

  cache.set(absFile, surface);
  return surface;
};
