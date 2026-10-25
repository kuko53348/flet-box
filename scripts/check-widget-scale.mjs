#!/usr/bin/env node
/**
 * @file check-widget-scale.mjs
 * @description
 * Keeps the framework's rem contract from quietly breaking again.
 *
 * Two things used to freeze a size in pixels, and both are gone:
 * `typeof n === "number" ? \`${n}px\` : n` inside widgets, and a private
 * px→rem copy inside the factory that ignored `setBaseFontSize()`. A number
 * written in a length prop is now `value / BASE` rem, so it grows with the
 * reader's browser font on every device.
 *
 * What is left is the one path the engine cannot police: a widget that writes
 * `el.style.height = ...` by hand bypasses `translateProps` entirely, and a
 * pixel there is a size that will not scale. This checks those writes, plus the
 * converter itself, so neither regresses.
 *
 * Usage:
 *   node scripts/check-widget-scale.mjs                  # check, fail on NEW hits
 *   node scripts/check-widget-scale.mjs --write-baseline  # snapshot current debt
 *   node scripts/check-widget-scale.mjs --list            # print every hit
 *
 * The baseline (`scripts/widget-scale-baseline.json`) records the writes that
 * are honest pixels — measured geometry, canvas backing stores, Maps' projected
 * coordinates. Refactors should shrink it; adding an entry is never the fix.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");
const baselinePath = join(scriptDir, "widget-scale-baseline.json");

/** CSS properties that are a length, written in camelCase or kebab-case. */
const LENGTH_KEYS = new Set([
  "width", "height", "min-width", "max-width", "min-height", "max-height",
  "padding", "padding-top", "padding-right", "padding-bottom", "padding-left",
  "padding-inline", "padding-block", "padding-inline-start", "padding-inline-end",
  "margin", "margin-top", "margin-right", "margin-bottom", "margin-left",
  "margin-inline", "margin-block", "margin-inline-start", "margin-inline-end",
  "gap", "row-gap", "column-gap", "top", "right", "bottom", "left", "inset",
  "border-radius", "font-size", "line-height", "text-indent", "flex-basis",
]);

const kebab = (key) =>
  key.replace(/[a-z0-9](?=[A-Z])/g, (c) => c + "-").toLowerCase();

/**
 * A pixel here is not a bug, it is the truth about something already laid out.
 * Scroll offsets, element measurements, canvas buffers and Maps' tile space all
 * live in CSS pixels by definition; converting them would be the actual defect.
 */
const MEASURED =
  /offset(Width|Height)|client(Width|Height|Top|Left)|scroll(Width|Height|Top|Left)|getBoundingClientRect|[Rr]ect|\bdelta\b|dimensions\.|window\.|inner(Width|Height)|outer(Width|Height)|devicePixelRatio|\bdpr\b|canvas|\bctx\b|TILE_SIZE|PIN_|chartHeight|totalFixed|viewport|\bscale\b|translate[XY]?\(|\bmatrix\(/;

/**
 * Values that are already unit-independent. `env()` is here because a safe-area
 * inset is the device's own geometry — the `0px` inside it is only the fallback
 * for a browser that has no inset, not a size frozen by the framework.
 */
const UNIT_FREE =
  /["'`][\s\d.%]*["'`]|%|auto|inherit|initial|none|calc\(|var\(|env\(|vw|vh|fr\b|stretch|fit-content|max-content|min-content/;

const HINT =
  'route the number through `toREM(n)` from "src/utils/units.js", or prove the pixel is measured geometry and let the baseline carry it';

/** Strip comments so a documented example never counts as a violation. */
const withoutComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));

const collectFiles = (dir) => {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(full));
    else if (entry.name.endsWith(".js")) out.push(full);
  }
  return out;
};

const SOURCES = [
  join(root, "src/widgets"),
  join(root, "src/navigations"),
  join(root, "src/components"),
].filter((dir) => existsSync(dir));

/** `el.style.height = x` / `el.style["max-height"] = x` / `setProperty("gap", x)` */
const STYLE_WRITE =
  /(?:^|[^\w$.])([\w$.]+)\.style\.([A-Za-z][\w-]*)\s*=\s*([^;\n]+)|\.style\.setProperty\(\s*["']([\w-]+)["']\s*,\s*([^;\n)]+)/g;

const hitsFor = (src) => {
  const hits = [];
  const clean = withoutComments(src);
  const lines = clean.split("\n");
  lines.forEach((line) => {
    STYLE_WRITE.lastIndex = 0;
    let m;
    while ((m = STYLE_WRITE.exec(line))) {
      const key = kebab(m[2] || m[5] || "");
      const rhs = (m[3] || m[6] || "").trim();
      if (!LENGTH_KEYS.has(key)) continue;
      if (!rhs) continue;
      // A rem write is the whole point of the pass, not a violation.
      if (/toREM\s*\(/.test(rhs)) continue;
      if (MEASURED.test(rhs) || UNIT_FREE.test(rhs)) continue;
      // A bare number or identifier assigned to a length is a frozen pixel:
      // the browser reads `style.height = 40` as an invalid value and drops it,
      // and `= someVar` carries whatever unit the caller typed.
      hits.push(`${key}: ${rhs.slice(0, 60)}`);
    }
  });
  return hits;
};

const args = process.argv.slice(2);
const writeBaseline = args.includes("--write-baseline");
const listAll = args.includes("--list");

const files = SOURCES.flatMap(collectFiles).sort();
const found = {};
for (const file of files) {
  const hits = hitsFor(readFileSync(file, "utf8"));
  if (hits.length) found[relative(root, file).split("\\").join("/")] = hits;
}

/**
 * The converter rule. `src/widget-factory/remTool.js` used to be a second
 * implementation of the same job that divided by a hardcoded 16 and ignored
 * `setBaseFontSize()`, so the same `40` painted 40px through a widget helper and
 * 50px through a routed prop. One converter, and the factory points at it.
 */
const converterErrors = [];
const remToolPath = join(root, "src/widget-factory/remTool.js");
if (existsSync(remToolPath)) {
  const src = readFileSync(remToolPath, "utf8");
  if (!/from\s+["']\.\.\/utils\/units\.js["']/.test(src)) {
    converterErrors.push(
      "src/widget-factory/remTool.js does not import src/utils/units.js: it is a second px→rem converter, and the two drift (that is how `40` came to paint 40px in one place and 50px in another)",
    );
  }
  if (/\/\s*16\b/.test(withoutComments(src))) {
    converterErrors.push(
      "src/widget-factory/remTool.js divides by a literal 16 instead of the live base font size",
    );
  }
}
for (const file of collectFiles(join(root, "src/widget-factory"))) {
  const rel = relative(root, file).split("\\").join("/");
  if (rel.endsWith("remTool.js")) continue;
  const src = withoutComments(readFileSync(file, "utf8"));
  if (/function\s+toREM|const\s+toREM\s*=/.test(src)) {
    converterErrors.push(
      `${rel} defines its own toREM instead of importing the one converter from src/utils/units.js`,
    );
  }
}

if (writeBaseline) {
  writeFileSync(baselinePath, JSON.stringify(found, null, 2) + "\n");
  const total = Object.values(found).reduce((n, a) => n + a.length, 0);
  console.log(
    `widget-scale-baseline.json escrito: ${total} writes en ${Object.keys(found).length} archivos.`,
  );
  process.exit(converterErrors.length ? 1 : 0);
}

const baseline = existsSync(baselinePath)
  ? JSON.parse(readFileSync(baselinePath, "utf8"))
  : {};

const fresh = [];
for (const [file, hits] of Object.entries(found)) {
  const allowed = new Set(baseline[file] || []);
  for (const hit of hits) if (!allowed.has(hit)) fresh.push({ file, hit });
}
const stale = [];
for (const [file, allowed] of Object.entries(baseline)) {
  const now = new Set(found[file] || []);
  for (const hit of allowed) if (!now.has(hit)) stale.push(`${file}: ${hit}`);
}

const total = Object.values(found).reduce((n, a) => n + a.length, 0);
console.log(
  `\nFletBox scale contract — ${files.length} archivos · ${total} writes de longitud fuera del motor`,
);
if (listAll) {
  for (const [file, hits] of Object.entries(found))
    for (const hit of hits) console.log(`  ${file}  ${hit}`);
}
if (converterErrors.length) {
  console.log(`\nCONVERTER (${converterErrors.length}) — el camino único px→rem está roto:`);
  for (const e of converterErrors) console.log(`  · ${e}`);
}
if (fresh.length) {
  console.log(`\nNUEVAS DEUDAS (${fresh.length}) — un largo escrito a mano no escala:`);
  for (const { file, hit } of fresh) console.log(`  · ${file}: ${hit}`);
  console.log(`\n  ${HINT}`);
}
if (stale.length) {
  console.log(
    `\n${stale.length} entradas del baseline ya están resueltas — regenera con --write-baseline:`,
  );
  for (const s of stale.slice(0, 10)) console.log(`  · ${s}`);
}

const failing = converterErrors.length > 0 || fresh.length > 0;
if (!failing) console.log("\n✔ sin deudas nuevas de escala");
process.exit(failing ? 1 : 0);
