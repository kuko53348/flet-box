/**
 * @file bin/commands/metrics.js
 * @description The north metric — how much generated code passes the gate with
 * no correction at all.
 *
 * The rule this file exists to enforce is one line long: *do not optimise before
 * measuring.* So every `flet-box verify` run appends a row to a log (see
 * `recordGeneration` in `verify.js`), and this command reads those rows and
 * answers two questions:
 *
 *   1. What share of the generated code passed the gate with no correction at
 *      all? A **generation** is a run of failing rows closed by the first green
 *      one — the rows before it are the corrections that were needed. The north
 *      metric is the share of generations whose *first* run was green.
 *   2. Which failures keep coming back? Those are the rules that have not been
 *      written yet. Each one is printed with the rule that should own it, and a
 *      code that recurs with no owner behind it **fails** this command: that is
 *      the loop closing.
 *
 * Node core only: this file ships inside every app `flet-box create` builds.
 */

import fs from "node:fs";
import path from "node:path";
import { CODE_RULE } from "./checkUi.js";
import { c } from "../utils/colors.js";

/** How many times a code has to come back before it counts as a rule to write. */
export const RECURRING = 3;

/**
 * Where a code should be taught, by the gate that reports it.
 *
 * A code without an owner is a rule that was never written: the gate proves the
 * mistake happens, and nothing tells the next agent why it matters.
 */
export const OWNERS = {
  CIRCULAR_IMPORT: "skills/fletbox-rules/SKILL.md R7 — one module, one direction",
  SOURCE_OUTSIDE_ROOT: "skills/fletbox-rules/SKILL.md R7 — a module lives in src/",
  HAND_WRITTEN_DOM: "skills/fletbox-rules/SKILL.md R7 — the engine is the only renderer",
  UNKNOWN_EXPORT: "skills/fletbox-rules/SKILL.md R1 — FletBox only",
  WRONG_STACK: "skills/fletbox-rules/SKILL.md R1 — FletBox only",
  UNKNOWN_PROP: "skills/fletbox-rules/SKILL.md R2 — never invent an API",
  POSITIONAL_ARG: "skills/fletbox-rules/SKILL.md R1 — a widget is a call with a props object",
  MODULE_NOT_FOUND: "skills/fletbox-rules/SKILL.md R2 — look the module up",
  MISSING_EXPORT: "skills/fletbox-rules/SKILL.md R2 — look the module up",
  DEEP_IMPORT: "skills/fletbox-rules/SKILL.md R2 — import from the barrel",
  UNDOCUMENTED_PROP: "src/index.d.ts — the declaration is the contract",
  INVENTED_PROP: "src/index.d.ts — the declaration is the contract",
  DEAD_PROP: "src/index.d.ts — the declaration or the widget",
  GATE_FAILED: "the gate itself — a missing package, not a mistake in the code",
};

/**
 * The rule that owns a code.
 *
 * @param {string} code
 * @returns {string|null} null when no rule owns it yet
 */
export const owner = (code) => {
  if (OWNERS[code]) return OWNERS[code];
  const rule = CODE_RULE[code];
  return rule ? `skills/fletbox-design/SKILL.md rule ${rule}` : null;
};

/**
 * Where a project's metrics log lives.
 *
 * A generated app keeps it under `.fletbox/`, next to the memory journal; the
 * framework keeps it in `metrics/`. A project with no log is not measured —
 * that is the whole point of the file existing.
 *
 * @param {string} root
 * @returns {string|null}
 */
export const metricsLog = (root) => {
  const candidates = [
    path.join(root, ".fletbox", "metrics", "generations.md"),
    path.join(root, "metrics", "generations.md"),
  ];
  return candidates.find((file) => fs.existsSync(file)) || null;
};

/**
 * Read the rows of a metrics log.
 *
 * @param {string} file
 * @returns {Array<{when: string, project: string, ok: boolean, gates: string, codes: string[]}>}
 */
export const parseLog = (file) => {
  const text = fs.readFileSync(file, "utf8");
  const rows = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    const cells = trimmed
      .slice(1, trimmed.endsWith("|") ? -1 : undefined)
      .split("|")
      .map((cell) => cell.trim());
    if (cells.length < 5) continue;
    if (!/^\d{4}-\d{2}-\d{2}T/.test(cells[0])) continue;
    rows.push({
      when: cells[0],
      project: cells[1],
      ok: cells[2] === "✓",
      gates: cells[3],
      codes: cells[4] === "—" ? [] : cells[4].split(",").map((code) => code.trim()),
    });
  }
  return rows;
};

/**
 * Group the rows into generations: a run of failing rows closed by the first
 * green one. A green row that follows a green row is its own generation.
 *
 * @param {Array<object>} rows
 * @returns {Array<{project: string, firstTry: boolean, corrections: number, unfinished?: boolean}>}
 */
export const groupGenerations = (rows) => {
  const byProject = new Map();
  for (const row of rows) {
    if (!byProject.has(row.project)) byProject.set(row.project, []);
    byProject.get(row.project).push(row);
  }
  const generations = [];
  for (const [project, list] of byProject) {
    let open = null;
    for (const row of list) {
      if (row.ok) {
        generations.push({
          project,
          firstTry: !open,
          corrections: open ? open.length : 0,
        });
        open = null;
      } else {
        open = open || [];
        open.push(row);
      }
    }
    if (open) {
      generations.push({ project, firstTry: false, corrections: open.length, unfinished: true });
    }
  }
  return generations;
};

/**
 * Count how often each code was reported.
 *
 * @param {Array<object>} rows
 * @returns {Map<string, number>}
 */
export const rankCodes = (rows) => {
  const counts = new Map();
  for (const row of rows) {
    for (const code of row.codes) counts.set(code, (counts.get(code) || 0) + 1);
  }
  return counts;
};

/**
 * The `flet-box metrics` command.
 *
 * @param {string[]} argv Flags after the command name.
 * @param {{print?: (line: string) => void, root?: string}} [io]
 * @returns {Promise<{exitCode: number, north: number, generations: number}>}
 */
export const metrics = async (argv = [], io = {}) => {
  const print = io.print ?? ((line) => console.log(line));
  const rootIndex = argv.indexOf("--root");
  const root = path.resolve(
    rootIndex >= 0 && argv[rootIndex + 1] ? argv[rootIndex + 1] : io.root || process.cwd(),
  );
  const logIndex = argv.indexOf("--log");
  const file = logIndex >= 0 && argv[logIndex + 1]
    ? path.resolve(argv[logIndex + 1])
    : metricsLog(root);

  if (!file || !fs.existsSync(file)) {
    print(
      c(
        "yellow",
        `📈 No metrics log yet — ${path.join(root, ".fletbox", "metrics", "generations.md")} does not exist.`,
      ),
    );
    print(c("gray", "   Every `flet-box verify` run writes a row into it; run the gates once."));
    return { exitCode: 0, north: 0, generations: 0 };
  }

  const rows = parseLog(file);
  const generations = groupGenerations(rows);
  const firstTry = generations.filter((generation) => generation.firstTry).length;
  const north = generations.length ? firstTry / generations.length : 0;
  const counts = rankCodes(rows);
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  print(c("brightCyan", `📈 ${path.relative(root, file) || file}`));
  print(
    c(
      "gray",
      `   north metric — ${firstTry}/${generations.length} generation(s) passed with no correction (${(north * 100).toFixed(0)}%)`,
    ),
  );
  print(c("gray", `   ${rows.length} run(s) logged`));

  if (ranked.length) {
    print("");
    print(c("gray", "   the failures that come back, and the rule each one should own:"));
    for (const [code, count] of ranked.slice(0, 3)) {
      const where = owner(code);
      print(
        c(
          "gray",
          `   ${String(count).padStart(3)}× ${code.padEnd(22)} ${where || "— no rule owns this one yet"}`,
        ),
      );
    }
    // A code that comes back with a rule behind it is a different problem: the
    // rule exists and the mistake still happens, so the rule is not landing.
    // That is worth naming — it is the difference between "write the rule" and
    // "make the rule impossible to miss".
    const stubborn = ranked.filter(
      ([code, count]) => count >= RECURRING && owner(code),
    );
    if (stubborn.length) {
      print("");
      for (const [code] of stubborn) {
        print(
          c(
            "yellow",
            `   ⚠ ${code} came back ${RECURRING} times with a rule behind it — the rule is not landing.`,
          ),
        );
      }
    }
  }

  const unowned = ranked.filter(([code, count]) => count >= RECURRING && !owner(code));
  print("");
  if (unowned.length) {
    print(
      c(
        "red",
        `❌ ${unowned.length} code(s) came back ${RECURRING} times or more and no rule owns them: ${unowned
          .map(([code]) => code)
          .join(", ")}`,
      ),
    );
    print(
      c(
        "gray",
        "   Write the rule where it belongs (the design skill, the rules skill, or the gate), then run again.",
      ),
    );
    return { exitCode: 1, north, generations: generations.length };
  }

  print(c("green", "✅ every recurring failure has a rule behind it."));
  return { exitCode: 0, north, generations: generations.length };
};

export default metrics;
