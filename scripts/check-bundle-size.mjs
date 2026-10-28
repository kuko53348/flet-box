#!/usr/bin/env node
/**
 * @file check-bundle-size.mjs
 * @description
 * The budget for what FletBox weighs.
 *
 * A framework that grows quietly is a framework nobody chose: the widget
 * that "just needs a little more", the helper that pulls in a second copy of
 * something, the polyfill that nobody asked for. None of those show up in a
 * test, and all of them reach the user's phone.
 *
 * So the weight is measured and written down, and the written number is a
 * ceiling:
 *
 *   - `framework` — the whole public surface imported wholesale
 *     (`import * as FB from "flet-box"`), which is what the framework costs
 *     when nothing is tree-shaken. Every widget in the box is in here, so a
 *     module that creeps is a module the ledger can name.
 *   - `demo` — this repository's own app (`src/app.js`), the artifact the
 *     OTA update ships. It is the framework plus the demo screens.
 *
 * The ceiling lives in `scripts/bundle-budget.json`. Growth is allowed, but
 * only by an act of acceptance: the file is regenerated with
 * `--write-baseline` and the diff is the receipt, reviewed like any other
 * change. Shrinking is not a failure either — the run says the ceiling can
 * be lowered, and lowering it is the point of keeping one.
 *
 * The budget is only worth something if it measures the bundle the CLI
 * actually ships, so the flags `bin/commands/createBundle.js` builds with are
 * read and compared against the ones used here: a change to the shipped
 * bundle that does not change the measurement is a blind budget.
 *
 * Usage:
 *   node scripts/check-bundle-size.mjs                # check the ceilings
 *   node scripts/check-bundle-size.mjs --write-baseline
 *   node scripts/check-bundle-size.mjs --list         # print the module table
 */

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const budgetPath = path.join(root, "scripts", "bundle-budget.json");
const bundleCommand = path.join(root, "bin", "commands", "createBundle.js");

/**
 * Every module is in the ledger, not only the big ones: a report that names a
 * culprit has to be able to name a small module too, and a module missing
 * from the ledger reads as "new" when it has been there all along.
 */
const MIN_MODULE_BYTES = 1;

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

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const signed = (bytes) => `${bytes >= 0 ? "+" : "-"}${Math.abs(bytes).toLocaleString("en-US")}`;

// ---------------------------------------------------------------------------
// The measurement
// ---------------------------------------------------------------------------

/**
 * The esbuild options `createBundle` uses. They are repeated here on
 * purpose — the check below proves the two have not drifted apart.
 */
const ESBUILD_OPTIONS = {
  bundle: true,
  write: false,
  format: "esm",
  minify: true,
  treeShaking: true,
  target: "es2020",
  define: { FLETBOX_DEV: "false" },
  external: ["*.css", "*.woff2"],
  resolveExtensions: [".js", ".json"],
  metafile: true,
  logLevel: "silent",
};

const ENTRIES = {
  framework: {
    label: "the public surface, imported wholesale",
    stdin: 'import * as FB from "flet-box";\nglobalThis.__fb = FB;\n',
    resolveDir: root,
  },
  demo: {
    label: "this repository's app (framework + demo screens)",
    entryPoints: [path.join(root, "src", "app.js")],
  },
};

/**
 * Build one entry and weigh it.
 *
 * @param {{ stdin?: string, entryPoints?: string[] }} entry
 * @returns {Promise<{ raw: number, gzip: number, brotli: number, modules: Record<string, number> }>}
 */
const measure = async (entry) => {
  const result = await esbuild.build({
    ...ESBUILD_OPTIONS,
    ...(entry.stdin
      ? { stdin: { contents: entry.stdin, resolveDir: entry.resolveDir } }
      : { entryPoints: entry.entryPoints }),
  });
  const output = result.outputFiles[0].contents;
  const modules = {};
  for (const out of Object.values(result.metafile.outputs)) {
    for (const [file, info] of Object.entries(out.inputs)) {
      modules[file] = (modules[file] || 0) + info.bytesInOutput;
    }
  }
  return {
    raw: output.length,
    gzip: zlib.gzipSync(output, { level: 9 }).length,
    brotli: zlib.brotliCompressSync(output).length,
    modules,
  };
};

let esbuild;
try {
  esbuild = await import("esbuild");
} catch {
  console.log(
    "⚠️  esbuild is not installed (it is a devDependency) — the bundle budget cannot be measured.",
  );
  process.exit(0);
}

// ---------------------------------------------------------------------------
// The comparison
// ---------------------------------------------------------------------------

/**
 * The lines the ledger prints when a module grew: the biggest contributors
 * first, because "the bundle grew" is only useful with "and this is why".
 *
 * @param {Record<string, number>} current
 * @param {Record<string, number>} recorded
 * @returns {string[]}
 */
const growthReport = (current, recorded = {}) => {
  const rows = [];
  for (const [file, bytes] of Object.entries(current)) {
    const before = recorded[file] || 0;
    const delta = bytes - before;
    if (delta > 0) rows.push({ file, delta, bytes, before });
  }
  return rows.sort((a, b) => b.delta - a.delta);
};

/**
 * zlib's output changed between releases (this checkout runs Node 26 with
 * zlib 1.2.12, CI runs Node 22 with zlib 1.3), so the *transported* size is a
 * range and not a number two machines can agree on. The raw size is esbuild's
 * own output and is byte-identical everywhere, so that is the hard ceiling;
 * gzip and brotli are checked with a tolerance.
 */
const TRANSPORT_TOLERANCE = 0.01;

/**
 * Compare a measurement with a ceiling.
 *
 * @param {{ raw: number, gzip: number, brotli?: number }} current
 * @param {{ raw: number, gzip: number, brotli?: number }} ceiling
 * @returns {string[]} The lines that grew past the ceiling.
 */
const overBudget = (current, ceiling) => {
  const over = [];
  for (const key of ["raw", "gzip", "brotli"]) {
    const limit = ceiling?.[key];
    if (typeof limit !== "number") continue;
    const allowed =
      key === "raw" ? limit : Math.ceil(limit * (1 + TRANSPORT_TOLERANCE));
    if (current[key] > allowed) {
      const note = key === "raw" ? "" : `  (tolerance ${TRANSPORT_TOLERANCE * 100}%)`;
      over.push(
        `${key} ${limit.toLocaleString("en-US")} → ${current[key].toLocaleString("en-US")} ` +
          `(${signed(current[key] - limit)} B)${note}`,
      );
    }
  }
  return over;
};

const args = process.argv.slice(2);
const writeBaseline = args.includes("--write-baseline");
const listAll = args.includes("--list");

// ---------------------------------------------------------------------------
// 1. The measurement
// ---------------------------------------------------------------------------

const measured = {};
for (const [name, entry] of Object.entries(ENTRIES)) {
  if (entry.entryPoints && !fs.existsSync(entry.entryPoints[0])) {
    console.log(`⚠️  ${name}: ${entry.entryPoints[0]} is missing — skipped.`);
    continue;
  }
  measured[name] = await measure(entry);
}

const framework = measured.framework;
const demo = measured.demo;

if (framework) {
  console.log(
    `\nFletBox bundle budget — framework ${kb(framework.raw)} raw · ${kb(framework.gzip)} gzip` +
      (demo ? ` · app ${kb(demo.raw)} raw · ${kb(demo.gzip)} gzip` : ""),
  );
} else {
  console.log("\nFletBox bundle budget — nothing measured.");
}

if (listAll && framework) {
  const rows = Object.entries(framework.modules).sort((a, b) => b[1] - a[1]);
  console.log("\nModules in the public surface:");
  for (const [file, bytes] of rows) console.log(`  ${String(bytes).padStart(7)} B  ${file}`);
}

// ---------------------------------------------------------------------------
// 2. The checks
// ---------------------------------------------------------------------------

await check("the measurement is the framework's own source", () => {
  if (!framework) throw new Error("the framework entry was not measured");
  const files = Object.keys(framework.modules);
  if (!files.some((file) => file.endsWith("src/index.js"))) {
    throw new Error("the framework entry did not pull src/index.js — it measured something else");
  }
  const foreign = files.filter((file) => file.includes("node_modules"));
  if (foreign.length) {
    throw new Error(`the bundle pulled a dependency: ${foreign.slice(0, 3).join(", ")}`);
  }
});

await check("the budget measures the bundle the CLI ships", () => {
  if (!fs.existsSync(bundleCommand)) {
    throw new Error("bin/commands/createBundle.js is missing");
  }
  const source = fs.readFileSync(bundleCommand, "utf8");
  const required = [
    "--minify",
    "--format=esm",
    "--target=es2020",
    "--tree-shaking=true",
    "--define:FLETBOX_DEV=false",
    "--external:*.css",
    "--external:*.woff2",
  ];
  const missing = required.filter((flag) => !source.includes(flag));
  if (missing.length) {
    throw new Error(
      `the shipped bundle no longer uses ${missing.join(", ")} — the budget would be measuring a different bundle`,
    );
  }
});

const budget = fs.existsSync(budgetPath)
  ? JSON.parse(fs.readFileSync(budgetPath, "utf8"))
  : null;

if (writeBaseline) {
  const next = {};
  for (const [name, data] of Object.entries(measured)) {
    next[name] = {
      raw: data.raw,
      gzip: data.gzip,
      brotli: data.brotli,
    };
  }
  if (framework) {
    const modules = {};
    for (const [file, bytes] of Object.entries(framework.modules)) {
      if (bytes >= MIN_MODULE_BYTES) modules[file] = bytes;
    }
    next.framework.modules = Object.fromEntries(
      Object.entries(modules).sort((a, b) => b[1] - a[1]),
    );
  }
  fs.writeFileSync(budgetPath, JSON.stringify(next, null, 2) + "\n", "utf8");
  const parts = Object.entries(next).map(
    ([name, data]) => `${name} ${kb(data.raw)} raw / ${kb(data.gzip)} gzip`,
  );
  console.log(`bundle-budget.json escrito: ${parts.join(" · ")}`);
  process.exit(0);
}

await check("the budget file exists", () => {
  if (!budget) {
    throw new Error(
      "scripts/bundle-budget.json is missing — run this script with --write-baseline",
    );
  }
});

await check("the ceilings hold", () => {
  const over = [];
  for (const [name, data] of Object.entries(measured)) {
    const ceiling = budget?.[name];
    if (!ceiling) {
      over.push(`${name}: no ceiling recorded`);
      continue;
    }
    for (const line of overBudget(data, ceiling)) over.push(`${name} ${line}`);
  }
  if (!over.length) return;

  const lines = [`${over.length} measurement(s) past the ceiling:`, ...over.map((o) => `  · ${o}`)];
  if (framework && budget?.framework?.modules) {
    const grown = growthReport(framework.modules, budget.framework.modules).slice(0, 5);
    if (grown.length) {
      lines.push("  biggest contributors:");
      for (const row of grown) {
        lines.push(`    ${signed(row.delta).padStart(8)} B  ${row.file}  (was ${row.before})`);
      }
    }
  }
  lines.push(
    "  the ceiling is accepted, not discovered: raise it with --write-baseline and the diff is the receipt",
  );
  throw new Error(lines.join("\n"));
});

await check("a smaller measurement is reported as a ceiling to lower", () => {
  const lines = [];
  for (const [name, data] of Object.entries(measured)) {
    const ceiling = budget?.[name];
    if (!ceiling) continue;
    for (const key of ["raw", "gzip"]) {
      if (typeof ceiling[key] === "number" && data[key] < ceiling[key]) {
        lines.push(`${name} ${key} ${ceiling[key]} → ${data[key]}`);
      }
    }
  }
  if (lines.length) {
    console.log(
      `  note: the ceiling can be lowered — ${lines.join("; ")} (regenerate with --write-baseline)`,
    );
  }
});

await check("the gate bites", () => {
  if (!framework) throw new Error("the framework entry was not measured");
  // A ceiling one byte under the measurement must be reported as growth.
  const tight = { raw: framework.raw - 1, gzip: framework.gzip };
  const over = overBudget(framework, tight);
  if (!over.length) {
    throw new Error("a bundle one byte over its ceiling was accepted");
  }
  // And a ceiling that matches must be silent.
  const exact = { raw: framework.raw, gzip: framework.gzip };
  if (overBudget(framework, exact).length) {
    throw new Error("a bundle exactly at its ceiling was reported as over it");
  }
  // The transported size is a range: inside the tolerance is not a failure.
  const near = { raw: framework.raw, gzip: Math.ceil(framework.gzip * 1.005) };
  if (overBudget(near, exact).length) {
    throw new Error("a gzip inside the tolerance was reported as over the ceiling");
  }
  // And outside it is.
  const far = { raw: framework.raw, gzip: Math.ceil(framework.gzip * 1.05) };
  if (!overBudget(far, exact).length) {
    throw new Error("a gzip past the tolerance was accepted");
  }
});

await check("the growth report names the culprit", () => {
  const recorded = { "src/widgets/Button.js": 1000 };
  const current = { "src/widgets/Button.js": 3400, "src/widgets/Text.js": 200 };
  const rows = growthReport(current, recorded);
  if (!rows.length) throw new Error("a grown module was not reported");
  if (rows[0].file !== "src/widgets/Button.js") {
    throw new Error(`the wrong module was named: ${rows[0].file}`);
  }
  if (rows[0].delta !== 2400) {
    throw new Error(`the wrong delta was reported: ${rows[0].delta}`);
  }
});

console.log(
  failures.length
    ? `\n❌ ${failures.length} bundle budget failure(s): ${failures.join(", ")}\n`
    : "\n✅ The bundle is within its budget.\n",
);
process.exit(failures.length ? 1 : 0);
