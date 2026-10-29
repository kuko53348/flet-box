/**
 * @file negative-control.mjs
 * Proves the coherence detectors actually bite, on a scratch copy. A detector
 * that always reports 0 is indistinguishable from a broken one, and every level
 * of this audit was calibrated this way.
 *
 * Mutations applied under /tmp/fletbox-negctl (never to the repo):
 *   1. drop one export's examples from ONE category JSON -> AGGREGATE_DRIFT fires
 *      and the coverage level stays at baseline: the signal is masked, not absent.
 *   2. drop them from all four JSONs -> UNCOVERED_EXPORT / UNCOVERED_PROP must move.
 *   3. add a `| totallyInventedProp |` row to a scratch doc copy -> the phantom
 *      scan must report exactly 1.
 *
 * Usage: node negative-control.mjs [--keep]
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveRoot } from "./lib.mjs";

const skillScripts = fileURLToPath(new URL(".", import.meta.url));
const root = resolveRoot();
const scratch = "/tmp/fletbox-negctl";
const keep = process.argv.includes("--keep");
const results = [];

const check = (label, ok, detail) => {
  results.push({ label, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
};

const run = (cmd, args, opts = {}) => {
  try {
    return execFileSync(cmd, args, { cwd: root, encoding: "utf8", ...opts });
  } catch (e) {
    return `${e.stdout || ""}${e.stderr || ""}`;
  }
};
const level = (out, name) => {
  const m = new RegExp(`${name}=(\\d+)`).exec(out);
  return m ? Number(m[1]) : null;
};

rmSync(scratch, { recursive: true, force: true });

// --------------------------------------------------------------------------
// 1. snippet coverage
// --------------------------------------------------------------------------
const snipDir = join(scratch, "snippets");
mkdirSync(snipDir, { recursive: true });
const files = readdirSync(join(root, "tools", "snippets-creator-flet-box")).filter((f) => f.endsWith(".json"));
for (const f of files) copyFileSync(join(root, "tools", "snippets-creator-flet-box", f), join(snipDir, f));

const baseline = run("node", ["scripts/check-snippets.mjs"]);
const target = /RamStore/.test(baseline) ? "RamStore" : "Session";
// One category file only: the mutation is masked by AGGREGATE_DRIFT and the
// coverage level stays at baseline. This is the trap that makes a 0 untrustworthy.
const oneDir = join(scratch, "one-file");
mkdirSync(oneDir, { recursive: true });
for (const f of files) copyFileSync(join(root, "tools", "snippets-creator-flet-box", f), join(oneDir, f));
const widgetsFile = join(oneDir, "FletBox_widgets.json");
const widgetsJson = JSON.parse(readFileSync(widgetsFile, "utf8"));
for (const k of Object.keys(widgetsJson)) if (k.includes(target)) delete widgetsJson[k];
writeFileSync(widgetsFile, JSON.stringify(widgetsJson));
const partial = run("node", ["scripts/check-snippets.mjs", "--dir", oneDir]);
check(
  `scrubbing only FletBox_widgets.json masks it: AGGREGATE_DRIFT>0 and coverage stays at baseline`,
  level(partial, "AGGREGATE_DRIFT") > 0 && level(partial, "UNCOVERED_PROP") === level(baseline, "UNCOVERED_PROP"),
  `AGGREGATE_DRIFT=${level(partial, "AGGREGATE_DRIFT")} UNCOVERED_PROP=${level(partial, "UNCOVERED_PROP")} (baseline ${level(baseline, "UNCOVERED_PROP")})`
);

for (const f of files) {
  const p = join(snipDir, f);
  const j = JSON.parse(readFileSync(p, "utf8"));
  for (const k of Object.keys(j)) if (k.includes(target)) delete j[k];
  writeFileSync(p, JSON.stringify(j));
}
const scrubbed = run("node", ["scripts/check-snippets.mjs", "--dir", snipDir]);
check(
  `removing every "${target}" example moves a coverage level above 0`,
  level(scrubbed, "AGGREGATE_DRIFT") === 0 &&
    (level(scrubbed, "UNCOVERED_EXPORT") > level(baseline, "UNCOVERED_EXPORT") ||
      level(scrubbed, "UNCOVERED_PROP") > level(baseline, "UNCOVERED_PROP")),
  `UNCOVERED_EXPORT ${level(baseline, "UNCOVERED_EXPORT")}->${level(scrubbed, "UNCOVERED_EXPORT")}, ` +
    `UNCOVERED_PROP ${level(baseline, "UNCOVERED_PROP")}->${level(scrubbed, "UNCOVERED_PROP")}, ` +
    `AGGREGATE_DRIFT=${level(scrubbed, "AGGREGATE_DRIFT")}`
);
// --------------------------------------------------------------------------
// 2. docs phantom scan
// --------------------------------------------------------------------------
const docsDir = join(scratch, "docs");
mkdirSync(docsDir, { recursive: true });
for (const f of readdirSync(join(root, "docs", "widget")).filter((x) => x.endsWith(".md"))) {
  copyFileSync(join(root, "docs", "widget", f), join(docsDir, f));
}
const badge = join(docsDir, "Badge.md");
writeFileSync(
  badge,
  readFileSync(badge, "utf8") + "\n| Prop | Type | Description |\n| --- | --- | --- |\n| `totallyInventedProp` | `boolean` | Negative control row. |\n",
  "utf8"
);
const scanOut = run("node", [join(skillScripts, "doc-table-audit.mjs"), "--docs", docsDir]);
const found = /phantom rows[^\n]*: (\d+) distinct/.exec(scanOut);
check("the scratch docs scan finds exactly the invented row", found && Number(found[1]) === 1, (found || ["", "?"])[1]);

const cleanOut = run("node", [join(skillScripts, "doc-table-audit.mjs")]);
const clean = /phantom rows[^\n]*: (\d+) distinct/.exec(cleanOut);
check("the same scan on the real docs is the baseline to compare against", clean !== null, (clean || ["", "?"])[1]);

console.log(
  "\nThe repo's own docs gate (`node scripts/check-docs-props.mjs`) is not mutated here:\n" +
    "a 0 from it is only trustworthy once the controls above pass and the probe has\n" +
    "confirmed the props it cannot classify."
);

if (keep) console.log(`\nscratch kept at ${scratch}`);
else rmSync(scratch, { recursive: true, force: true });

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} negative controls passed`);
process.exit(failed ? 1 : 0);
