#!/usr/bin/env node
/**
 * @file check-api-surface.mjs
 * @description
 * Coupling checker for the FletBox public API.
 *
 * FletBox declares every public API in three places that must always agree:
 *
 *   1. the implementation  — `src/**` (the real, callable code)
 *   2. the runtime barrel  — `src/index.js` (what `import { x } from "flet-box"` gives you)
 *   3. the type surface    — `src/index.d.ts` (what TypeScript believes)
 *
 * `AGENTS.md` states the rule this script enforces: "A public API is complete
 * only when three surfaces agree: runtime implementation, `src/index.js` export,
 * and `src/index.d.ts` declaration."
 *
 * What it checks:
 *
 *   - IMPORTS       the barrel is imported for real, so a re-export of a name
 *                   that no longer exists throws and fails the run;
 *   - SSR-SAFETY    that import must succeed in Node, proving the package stays
 *                   importable outside a browser (SSR, tests, build tooling);
 *   - UNDECLARED    every runtime export has a declaration (value or type);
 *   - PHANTOM       every declared value actually exists at runtime;
 *   - UNEXPORTED    every interface/type is `export`ed, so consumers can
 *                   `import type { ButtonProps } from "flet-box"`;
 *   - DANGLING      every `typeof X` reference in the declarations points at a
 *                   name that is actually declared;
 *   - UNRESOLVED    every public prop/option type referenced in the
 *                   declarations (`*Props`, `*Options`, …) is itself declared.
 *
 * Usage:
 *   node scripts/check-api-surface.mjs           # check; exit 1 on violation
 *   node scripts/check-api-surface.mjs --list    # also print every name checked
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const barrelPath = join(root, "src", "index.js");
const typesPath = join(root, "src", "index.d.ts");

const showList = process.argv.includes("--list");

/** Removes comments so commented-out declarations never count as real ones. */
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");

/** Prints a section of names, honouring `--list`. */
const detail = (label, names) => {
  if (!showList || names.length === 0) return;
  console.log(`\n  ${label}`);
  for (const name of names) console.log(`    · ${name}`);
};

const violations = [];
const fail = (title, hint, names) => {
  violations.push({ title, hint, names });
};

// ---------------------------------------------------------------------------
// 1. Runtime surface — import the barrel for real.
// ---------------------------------------------------------------------------
let runtime = [];
try {
  const mod = await import(pathToFileURL(barrelPath).href);
  runtime = Object.keys(mod).sort();
} catch (error) {
  console.error(
    "\n❌ No se pudo importar `src/index.js` en Node.\n" +
      "   Dos causas habituales:\n" +
      "     1. Se re-exporta un nombre que ya no existe en el módulo origen.\n" +
      "     2. El paquete dejó de ser importable fuera del navegador: hay acceso a\n" +
      "        `window` / `document` en el ámbito de módulo. Guárdalo con\n" +
      '        `typeof window !== "undefined"`.\n',
  );
  console.error(`   ${error.message}\n`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 2. Type surface — declaration names from `src/index.d.ts`.
// ---------------------------------------------------------------------------
const typesSrc = stripComments(readFileSync(typesPath, "utf8"));

const declaredValues = new Set();
const declaredTypes = new Set();
const unexportedTypes = [];

for (const m of typesSrc.matchAll(
  /^\s{2}export\s+(?:declare\s+)?(function|const|class)\s+([A-Za-z0-9_$]+)/gm,
)) {
  declaredValues.add(m[2]);
}
for (const m of typesSrc.matchAll(
  /^\s{2}export\s+(?:declare\s+)?(interface|type)\s+([A-Za-z0-9_$]+)/gm,
)) {
  declaredTypes.add(m[2]);
}
// A type declared without `export` inside `declare module` is invisible to
// consumers: `import type { X } from "flet-box"` fails.
for (const m of typesSrc.matchAll(
  /^\s{2}(interface|type)\s+([A-Za-z0-9_$]+)/gm,
)) {
  unexportedTypes.push(m[2]);
}

const declared = new Set([...declaredValues, ...declaredTypes]);
const runtimeSet = new Set(runtime);

// ---------------------------------------------------------------------------
// 3. Compare both directions.
// ---------------------------------------------------------------------------
const undeclared = runtime.filter((name) => !declared.has(name));
const phantom = [...declaredValues].filter((name) => !runtimeSet.has(name));

// `typeof X` in the declarations must resolve to a declared name.
const typeofTargets = new Set(
  [...typesSrc.matchAll(/\btypeof\s+([A-Za-z0-9_$]+)/g)].map((m) => m[1]),
);
const dangling = [...typeofTargets].filter(
  (name) => !declared.has(name) && !runtimeSet.has(name),
);

// Public prop/option types referenced anywhere in the declarations must exist.
// Catches typos such as `props: ButtonProp` (missing `s`) that a presence-only
// pass would wave through.
const PUBLIC_TYPE_SUFFIXES = [
  "Props",
  "Options",
  "Slice",
  "Column",
  "Step",
  "Instance",
  "Config",
  "State",
];
const referencedTypes = new Set();
for (const m of typesSrc.matchAll(/\b([A-Z][A-Za-z0-9_$]*)\b/g)) {
  if (PUBLIC_TYPE_SUFFIXES.some((suffix) => m[1].endsWith(suffix))) {
    referencedTypes.add(m[1]);
  }
}
const unresolvedTypes = [...referencedTypes].filter(
  (name) => !declared.has(name) && !runtimeSet.has(name),
);

if (undeclared.length) {
  fail(
    "Exports de runtime sin declaración en `src/index.d.ts`",
    "Añade su `export function` / `export const` / tipo en `src/index.d.ts`.",
    undeclared,
  );
}
if (phantom.length) {
  fail(
    "Declarados como valor pero inexistentes en runtime",
    "Elimina la declaración o expórtalo de verdad desde `src/index.js`.",
    phantom,
  );
}
if (unexportedTypes.length) {
  fail(
    "Interfaces/types sin `export` (no importables por el consumidor)",
    "Añade `export` delante de la declaración.",
    unexportedTypes,
  );
}
if (dangling.length) {
  fail(
    "Referencias `typeof X` que no apuntan a ningún nombre declarado",
    "Corrige el nombre o declara el símbolo referenciado.",
    dangling,
  );
}
if (unresolvedTypes.length) {
  fail(
    "Tipos públicos referenciados que no están declarados",
    "Declara el tipo o corrige el nombre (¿una errata tipo `ButtonProp`?).",
    unresolvedTypes.sort(),
  );
}

// ---------------------------------------------------------------------------
// 4. Report.
// ---------------------------------------------------------------------------
console.log(
  `\nFletBox API surface — ${runtime.length} exports runtime · ` +
    `${declaredValues.size} valores + ${declaredTypes.size} tipos en index.d.ts`,
);

if (violations.length === 0) {
  if (showList) {
    detail("Exports runtime verificados", runtime);
    detail("Tipos exportados verificados", [...declaredTypes].sort());
  }
  console.log("\nLas tres superficies coinciden. ✔\n");
  process.exit(0);
}

for (const v of violations) {
  console.error(`\n❌ ${v.title} (${v.names.length})`);
  console.error(`   ${v.hint}`);
  for (const name of v.names) console.error(`     · ${name}`);
}
console.error(
  `\n${violations.length} superficie(s) descuadrada(s). ` +
    "El acoplamiento runtime / index.js / index.d.ts está roto.\n",
);
process.exit(1);
