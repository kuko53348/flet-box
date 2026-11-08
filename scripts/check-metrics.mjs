// scripts/check-metrics.mjs
// Contract for the metrics log and the north metric
// (`bin/commands/metrics.js`).
//
// The plan says it plainly: do not optimise before measuring, so the log comes
// first and the metric is read off it. A metric nobody trusts is a metric
// nobody reads, so the arithmetic below is proven with a fixture — a run that
// was green the first time, a run that needed one correction, and a run that
// has not been fixed yet — and the loop is proven to bite: a code that comes
// back three times with no rule behind it must fail the command.
//
// The "Gate defects" table is proven too: a run the gate itself got wrong counts
// as a pass and never feeds the rule loop, a run after the fix counts again, and
// an open defect is named as the framework's debt instead of failing the app.
//
// Run with:
//
//   node scripts/check-metrics.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  metrics,
  parseLog,
  parseDefects,
  groupGenerations,
  rankCodes,
  rankDefects,
  metricsLog,
  owner,
  OWNERS,
  RECURRING,
} from "../bin/commands/metrics.js";
import { CODE_RULE } from "../bin/commands/checkUi.js";
import { metricsLogMd } from "../bin/utils/templates.js";

const repoRoot = path.resolve(import.meta.dirname, "..");
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "fletbox-metrics-"));
const failures = [];

/**
 * @param {string} name
 * @param {() => void | Promise<void>} fn
 */
const check = async(name, fn) => {
  try {
    await fn();
    console.log(`  ok   ${name}`);
  } catch (error) {
    failures.push(name);
    console.log(`  FAIL ${name} — ${error.message}`);
  }
};

/**
 * Write a log with the given rows and return its path.
 *
 * @param {Array<[string, string, string, string, string]>} rows
 * @param {Array<[string, string, string, string]>} [defects] Registry rows:
 *   code, first day, last day (`—` while open), where.
 * @returns {string}
 */
const writeLog = (rows, defects = []) => {
  const file = path.join(scratch, "generations.md");
  const lines = rows.map((row) => `| ${row.join(" | ")} |`);
  const registry = defects.length
    ? `\n## Gate defects\n\n| Code | Seen | Fixed | Where |\n| --- | --- | --- | --- |\n${defects
        .map((row) => `| ${row.join(" | ")} |`)
        .join("\n")}\n`
    : "";
  fs.writeFileSync(
    file,
    `| When | Project | Result | Gates | Codes |\n| --- | --- | --- | --- | --- |${registry}\n${lines.join("\n")}\n`,
    "utf8",
  );
  return file;
};

// ---------------------------------------------------------------------------
// 1 — the log is read back the way it was written
// ---------------------------------------------------------------------------

await check("the log parses into rows", () => {
  const file = writeLog([
    ["2026-10-27T10:00:00.000Z", "demo", "✓", "—", "—"],
    ["2026-10-27T10:05:00.000Z", "demo", "✗", "api", "UNKNOWN_PROP"],
  ]);
  const rows = parseLog(file);
  assert.equal(rows.length, 2, `read ${rows.length} rows`);
  assert.equal(rows[0].ok, true, "the first row was not read as green");
  assert.equal(rows[1].ok, false, "the second row was not read as red");
  assert.deepEqual(rows[1].codes, ["UNKNOWN_PROP"], "the codes were not read");
});

await check("the header row is not a run", () => {
  const file = writeLog([["2026-10-27T10:00:00.000Z", "demo", "✓", "—", "—"]]);
  const rows = parseLog(file);
  assert.equal(rows.length, 1, "the table header was counted as a run");
});

await check("a row written by the recorder is read back", () => {
  const file = path.join(scratch, "written.md");
  fs.writeFileSync(
    file,
    "| When | Project | Result | Gates | Codes |\n| --- | --- | --- | --- | --- |\n",
    "utf8",
  );
  const row = [
    new Date().toISOString(),
    "demo",
    "✓",
    "—",
    "—",
  ].join(" | ");
  fs.appendFileSync(file, `| ${row} |\n`, "utf8");
  const rows = parseLog(file);
  assert.equal(rows.length, 1, "the recorded row was not read back");
  assert.equal(rows[0].project, "demo");
});

// ---------------------------------------------------------------------------
// 2 — the north metric counts the right thing
// ---------------------------------------------------------------------------

await check("a green first run is a generation that needed no correction", () => {
  const rows = parseLog(
    writeLog([
      ["2026-10-27T10:00:00.000Z", "demo", "✓", "—", "—"],
    ]),
  );
  const generations = groupGenerations(rows);
  assert.equal(generations.length, 1);
  assert.equal(generations[0].firstTry, true);
  assert.equal(generations[0].corrections, 0);
});

await check("a failing run closed by a green one is a generation with corrections", () => {
  const rows = parseLog(
    writeLog([
      ["2026-10-27T10:00:00.000Z", "demo", "✗", "api", "UNKNOWN_PROP"],
      ["2026-10-27T10:05:00.000Z", "demo", "✗", "api", "UNKNOWN_PROP"],
      ["2026-10-27T10:10:00.000Z", "demo", "✓", "—", "—"],
    ]),
  );
  const generations = groupGenerations(rows);
  assert.equal(generations.length, 1, `${generations.length} generations for three runs`);
  assert.equal(generations[0].firstTry, false, "a corrected run was counted as a first try");
  assert.equal(generations[0].corrections, 2, "the corrections were not counted");
});

await check("a green run after a green run is its own generation", () => {
  const rows = parseLog(
    writeLog([
      ["2026-10-27T10:00:00.000Z", "demo", "✓", "—", "—"],
      ["2026-10-27T10:05:00.000Z", "demo", "✓", "—", "—"],
    ]),
  );
  const generations = groupGenerations(rows);
  assert.equal(generations.length, 2, `${generations.length} generations for two green runs`);
  assert.ok(
    generations.every((generation) => generation.firstTry),
    "a green run was not counted as a first try",
  );
});

await check("a run that has not been fixed yet counts as a correction", () => {
  const rows = parseLog(
    writeLog([["2026-10-27T10:00:00.000Z", "demo", "✗", "ui", "RAW_COLOR"]]),
  );
  const generations = groupGenerations(rows);
  assert.equal(generations.length, 1);
  assert.equal(generations[0].unfinished, true, "the unfinished run was not marked");
  assert.equal(generations[0].corrections, 1);
});

await check("two projects are measured apart", () => {
  const rows = parseLog(
    writeLog([
      ["2026-10-27T10:00:00.000Z", "one", "✗", "api", "UNKNOWN_PROP"],
      ["2026-10-27T10:01:00.000Z", "two", "✓", "—", "—"],
    ]),
  );
  const generations = groupGenerations(rows);
  assert.equal(generations.length, 2, "the two projects were merged into one generation");
});

// ---------------------------------------------------------------------------
// 3 — the loop: a code that comes back needs a rule
// ---------------------------------------------------------------------------

await check("the failing codes are ranked by how often they came back", () => {
  const rows = parseLog(
    writeLog([
      ["2026-10-27T10:00:00.000Z", "demo", "✗", "api", "UNKNOWN_PROP, RAW_COLOR"],
      ["2026-10-27T10:01:00.000Z", "demo", "✗", "api", "UNKNOWN_PROP"],
    ]),
  );
  const counts = rankCodes(rows);
  assert.equal(counts.get("UNKNOWN_PROP"), 2);
  assert.equal(counts.get("RAW_COLOR"), 1);
});

await check("every code the gates can report has a rule behind it", () => {
  const codes = [
    "UNKNOWN_EXPORT",
    "UNKNOWN_PROP",
    "POSITIONAL_ARG",
    "WRONG_STACK",
    "MODULE_NOT_FOUND",
    "MISSING_EXPORT",
    "DEEP_IMPORT",
    "UNDOCUMENTED_PROP",
    "CIRCULAR_IMPORT",
    "SOURCE_OUTSIDE_ROOT",
    "HAND_WRITTEN_DOM",
    "INVENTED_PROP",
    "DEAD_PROP",
    "GATE_FAILED",
    "SYNTAX_ERROR",
    "TEST_SUITE_FAILED",
  ];
  for (const code of codes) {
    assert.ok(owner(code), `${code} has no rule behind it`);
  }
});

await check("a design-gate code points at the design skill", () => {
  const code = Object.keys(CODE_RULE)[0];
  const where = owner(code);
  assert.ok(where.includes("fletbox-design"), `${code} points at ${where}`);
});

await check("every rule the owners point at still exists", () => {
  const rules = fs.readFileSync(path.join(repoRoot, "skills/fletbox-rules/SKILL.md"), "utf8");
  for (const [code, where] of Object.entries(OWNERS)) {
    for (const [, number] of where.matchAll(/R(\d+)/g)) {
      assert.ok(
        rules.includes(`## R${number} `),
        `${code} points at R${number}, which the rules skill does not have`,
      );
    }
  }
});

await check("every rule number the owners point at exists in the design skill", () => {
  const design = fs.readFileSync(path.join(repoRoot, "skills/fletbox-design/SKILL.md"), "utf8");
  for (const [code, rule] of Object.entries(CODE_RULE)) {
    assert.ok(
      design.includes(`## ${rule} `),
      `${code} points at design rule ${rule}, which the design skill does not have`,
    );
  }
});

await check("a code that comes back with no rule fails the command", async() => {
  const file = writeLog([
    ["2026-10-27T10:00:00.000Z", "demo", "✗", "api", "MYSTERY_CODE"],
    ["2026-10-27T10:01:00.000Z", "demo", "✗", "api", "MYSTERY_CODE"],
    ["2026-10-27T10:02:00.000Z", "demo", "✗", "api", "MYSTERY_CODE"],
  ]);
  const lines = [];
  const result = await metrics(["--log", file], { print: (line) => lines.push(line) });
  assert.equal(result.exitCode, 1, "a recurring code with no rule did not fail");
  assert.ok(
    lines.some((line) => line.includes("MYSTERY_CODE")),
    "the failing code was not named",
  );
});

await check("a code that comes back with a rule behind it passes", async() => {
  const file = writeLog([
    ["2026-10-27T10:00:00.000Z", "demo", "✗", "api", "UNKNOWN_PROP"],
    ["2026-10-27T10:01:00.000Z", "demo", "✗", "api", "UNKNOWN_PROP"],
    ["2026-10-27T10:02:00.000Z", "demo", "✗", "api", "UNKNOWN_PROP"],
  ]);
  const lines = [];
  const result = await metrics(["--log", file], { print: (line) => lines.push(line) });
  assert.equal(result.exitCode, 0, "a recurring code with a rule failed the command");
  assert.ok(RECURRING >= 3, "the threshold moved below three");
});

await check("a recurring code with a rule behind it is named as not landing", async() => {
  const file = writeLog([
    ["2026-10-27T10:00:00.000Z", "demo", "✗", "api", "UNKNOWN_PROP"],
    ["2026-10-27T10:01:00.000Z", "demo", "✗", "api", "UNKNOWN_PROP"],
    ["2026-10-27T10:02:00.000Z", "demo", "✗", "api", "UNKNOWN_PROP"],
  ]);
  const lines = [];
  await metrics(["--log", file], { print: (line) => lines.push(line) });
  assert.ok(
    lines.some((line) => line.includes("UNKNOWN_PROP") && line.includes("not landing")),
    "the recurring code with a rule behind it was not named",
  );
});

await check("a code that comes back once is not called stubborn", async() => {
  const file = writeLog([
    ["2026-10-27T10:00:00.000Z", "demo", "✗", "api", "UNKNOWN_PROP"],
  ]);
  const lines = [];
  await metrics(["--log", file], { print: (line) => lines.push(line) });
  assert.ok(
    !lines.some((line) => line.includes("not landing")),
    "a code that came back once was called stubborn",
  );
});

// ---------------------------------------------------------------------------
// 3b — a code the gate got wrong is the framework's debt, not the project's
// ---------------------------------------------------------------------------

await check("the Gate defects table is read, and `—` means still open", () => {
  const file = writeLog(
    [["2026-11-07T10:00:00.000Z", "demo", "✓", "—", "—"]],
    [
      ["MISSING_EXPORT", "2026-11-06", "2026-11-07", "the gate truncated `fijarTamaño`"],
      ["SOURCE_OUTSIDE_ROOT", "2026-11-07", "—", "`create --help` scaffolded a folder"],
    ],
  );
  const defects = parseDefects(file);
  assert.equal(defects.length, 2, `read ${defects.length} defects`);
  assert.equal(defects[0].fixed, "2026-11-07", "the closed window was not read");
  assert.equal(defects[1].fixed, null, "an open defect was read as closed");
  assert.ok(defects[0].where.includes("fijarTamaño"), "the reason was not read");
});

await check("a Gate defects row is not read as a run", () => {
  const file = writeLog(
    [["2026-11-07T10:00:00.000Z", "demo", "✓", "—", "—"]],
    [["MISSING_EXPORT", "2026-11-06", "2026-11-07", "a truncated name"]],
  );
  assert.equal(parseLog(file).length, 1, "the registry row was counted as a run");
});

await check("a run that only a gate defect failed is left out of the metric", () => {
  const file = writeLog(
    [
      ["2026-11-07T10:00:00.000Z", "demo", "✗", "api", "MISSING_EXPORT"],
      ["2026-11-07T10:01:00.000Z", "demo", "✗", "api", "MISSING_EXPORT"],
      ["2026-11-07T10:02:00.000Z", "demo", "✓", "—", "—"],
    ],
    [["MISSING_EXPORT", "2026-11-06", "2026-11-07", "a truncated name"]],
  );
  const rows = parseLog(file);
  assert.ok(rows[0].exonerated, "the defect run was charged to the project");
  assert.deepEqual(rows[0].appCodes, [], "the code was not recognised as the gate's");
  assert.equal(rankDefects(rows).get("MISSING_EXPORT"), 2, "the debt was not counted");
  const generations = groupGenerations(rows);
  assert.equal(generations.length, 1);
  assert.equal(generations[0].firstTry, true, "a defect turned a first try into a correction");
  assert.equal(generations[0].corrections, 0);
});

await check("a run after the fix counts against the project again", () => {
  const file = writeLog(
    [
      ["2026-11-07T10:00:00.000Z", "demo", "✗", "api", "MISSING_EXPORT"],
      ["2026-11-08T10:00:00.000Z", "demo", "✗", "api", "MISSING_EXPORT"],
      ["2026-11-08T10:05:00.000Z", "demo", "✓", "—", "—"],
    ],
    [["MISSING_EXPORT", "2026-11-06", "2026-11-07", "a truncated name"]],
  );
  const rows = parseLog(file);
  assert.equal(rows[0].exonerated, true, "the run inside the window was not exonerated");
  assert.equal(rows[1].exonerated, false, "a run after the fix was still excused");
  assert.equal(rankCodes(rows).get("MISSING_EXPORT"), 1, "the later run did not count");
});

await check("a real finding beside a gate defect is still a correction", () => {
  const file = writeLog(
    [["2026-11-07T10:00:00.000Z", "demo", "✗", "api, ui", "MISSING_EXPORT, LOW_CONTRAST"]],
    [["MISSING_EXPORT", "2026-11-06", "2026-11-07", "a truncated name"]],
  );
  const rows = parseLog(file);
  assert.equal(rows[0].exonerated, false, "a row with its own finding was excused");
  assert.deepEqual(rows[0].defectCodes, ["MISSING_EXPORT"]);
  assert.deepEqual(rows[0].appCodes, ["LOW_CONTRAST"]);
  assert.equal(rankCodes(rows).has("MISSING_EXPORT"), false, "the gate's code was ranked");
});

await check("a recurring gate defect does not fail the command", async() => {
  const file = writeLog(
    [
      ["2026-11-06T10:00:00.000Z", "demo", "✗", "api", "MISSING_EXPORT"],
      ["2026-11-06T10:01:00.000Z", "demo", "✗", "api", "MISSING_EXPORT"],
      ["2026-11-06T10:02:00.000Z", "demo", "✗", "api", "MISSING_EXPORT"],
    ],
    [["MISSING_EXPORT", "2026-11-06", "2026-11-07", "a truncated name"]],
  );
  const lines = [];
  const result = await metrics(["--log", file], { print: (line) => lines.push(line) });
  assert.equal(result.exitCode, 0, "the gate's own defect failed the project");
  assert.ok(
    lines.some((line) => line.includes("MISSING_EXPORT") && line.includes("fixed 2026-11-07")),
    "the closed defect was not shown as the framework's debt",
  );
  assert.ok(
    !lines.some((line) => line.includes("not landing")),
    "a gate defect was called a rule that is not landing",
  );
});

await check("an open gate defect is named, and the command still passes", async() => {
  const file = writeLog(
    [["2026-11-07T10:00:00.000Z", "demo", "✗", "structure", "SOURCE_OUTSIDE_ROOT"]],
    [["SOURCE_OUTSIDE_ROOT", "2026-11-07", "—", "`create --help` scaffolded a folder"]],
  );
  const lines = [];
  const result = await metrics(["--log", file], { print: (line) => lines.push(line) });
  assert.equal(result.exitCode, 0, "an open defect blocked the project");
  assert.ok(
    lines.some((line) => line.includes("OPEN since 2026-11-07")),
    "the open defect was not named",
  );
  assert.ok(
    lines.some((line) => line.includes("still open")),
    "the warning that the gate is wrong was missing",
  );
});

// ---------------------------------------------------------------------------
// 4 — the log of this repository is the real thing
// ---------------------------------------------------------------------------

await check("this repository keeps its log where the command looks for it", () => {
  const file = metricsLog(repoRoot);
  assert.ok(file, `no metrics log under ${repoRoot}`);
  assert.ok(fs.existsSync(file), `${file} does not exist`);
});

await check("every code in this repository's log has a rule behind it", () => {
  const file = metricsLog(repoRoot);
  for (const row of parseLog(file)) {
    for (const code of row.codes) {
      assert.ok(owner(code), `${code} came back in the log and no rule owns it`);
    }
  }
});

await check("a project with no log is not measured, and says so", async() => {
  const lines = [];
  const result = await metrics(["--root", scratch], { print: (line) => lines.push(line) });
  assert.equal(result.exitCode, 0, "a missing log was reported as a failure");
  assert.ok(
    lines.some((line) => line.includes("No metrics log")),
    "the missing log was not announced",
  );
});

// ---------------------------------------------------------------------------
// 5 — a created app gets the log and the command
// ---------------------------------------------------------------------------

await check("the log template carries the table the recorder appends to", () => {
  const text = metricsLogMd();
  assert.ok(text.includes("| When | Project | Result | Gates | Codes |"), "the table header is missing");
  assert.ok(text.includes("| --- | --- | --- | --- | --- |"), "the table rule is missing");
});

await check("the log template carries the Gate defects table", () => {
  const text = metricsLogMd();
  assert.ok(text.includes("## Gate defects"), "the registry section is missing");
  assert.ok(text.includes("| Code | Seen | Fixed | Where |"), "the registry header is missing");
});

await check("the app's package.json wires the metrics command", async() => {
  const { packageJson } = await import("../bin/utils/templates.js");
  const json = JSON.parse(packageJson("demo"));
  assert.equal(json.scripts.metrics, "flet-box metrics", "the metrics script is not wired");
});

fs.rmSync(scratch, { recursive: true, force: true });

console.log(
  failures.length
    ? `\n❌ ${failures.length} metrics contract failure(s): ${failures.join(", ")}\n`
    : "\n✅ The metric is read off the log, and the loop bites.\n",
);
process.exit(failures.length ? 1 : 0);
