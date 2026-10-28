/**
 * @file bin/commands/verify.js
 * @description One command, one report, one exit code — every gate at once.
 *
 * An agent that writes code needs a single question answered: "may I say this
 * is done?". Asking it once per gate (`npm run check`, then `npm run ui`, then
 * `npm run api`) means the agent stops at the first green one, and the report
 * it hands back names a gate instead of a line.
 *
 * So the gates run here, in parallel, and the runner only counts and prints:
 *
 *   syntax   — the parse gate: every module is handed to the Node parser, so a
 *              file that cannot load is named by line and column before any
 *              other gate reads it as text.
 *   api      — the anti-hallucination gate: invented widgets and props,
 *              positional arguments, foreign imports, broken imports.
 *   ui       — the design gate: tokens, the 8-based scale, tap targets,
 *              labels, contrast.
 *   structure — how the app's own modules are wired: a cycle between two of
 *              them, a module outside the folders the project is built from,
 *              markup written by hand.
 *   surface — the prop contract: a prop the widget reads but nothing declares
 *              is an error (the surface lies); a prop declared but nobody
 *              reads is a warning (the docs promise more than the code does).
 *   tests    — the project's own suites (`test`, `test:browser`, `test:visual`),
 *              run one after another; a failing suite's own last words are the
 *              finding, because that is where its rule is named.
 *
 * A new gate is one entry in `GATES` and `GATE_ORDER` and nothing else.
 *
 * Node core only: this file ships inside every app `flet-box create` builds,
 * so it may not reach for a devDependency.
 */

import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { checkApi, loadApi, SEVERITY } from "./checkApi.js";
import { checkUi, ERROR_CODES, WARN_CODES, INFO_CODES } from "./checkUi.js";
import { scanStructure } from "./checkStructure.js";
import { scanSyntax } from "./checkSyntax.js";
import { auditFix } from "./auditFix.js";
import { metricsLog } from "./metrics.js";
import { definitionIndex, propsSource, unpackWidget } from "./unpack.js";
import { isFrameworkProject } from "../utils/migrationGuide.js";
import { c, banner, section } from "../utils/colors.js";

/**
 * The severity a design-gate code carries. The gate knows which codes are
 * errors and which are a reviewer's job; the report must not call a review
 * an error, or an agent will "fix" a warning and break the screen.
 *
 * @param {string} code
 * @returns {"error"|"warn"|"info"}
 */
const designSeverity = (code) => {
  if (ERROR_CODES.has(code)) return "error";
  if (WARN_CODES.has(code)) return "warn";
  if (INFO_CODES.has(code)) return "info";
  return "error";
};

/**
 * Normalise a finding so the report does not care which gate produced it.
 *
 * @param {object} finding
 * @param {"error"|"warn"|"info"} [severity]
 * @returns {object}
 */
const shape = (finding, severity) => ({
  code: finding.code || "UNKNOWN",
  file: finding.file || null,
  line: finding.line || 0,
  column: finding.column || 0,
  message: finding.message || "",
  detail: finding.detail || "",
  suggestion: finding.suggestion || null,
  severity: severity || finding.severity || "error",
});

/**
 * The path a finding names, relative to the project it belongs to.
 *
 * @param {string|null} file
 * @param {string} root
 * @returns {string|null}
 */
const relative = (file, root) => {
  if (!file) return null;
  const absolute = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
  const rel = path.relative(root, absolute);
  return rel && !rel.startsWith("..") ? rel : absolute;
};

/* ------------------------------------------------------------------ gates */

const syntaxGate = async (root) => {
  const findings = await scanSyntax(root);
  return {
    name: "syntax",
    title: "Parse gate",
    findings: findings.map((finding) => shape(finding)),
    exitCode: findings.length ? 1 : 0,
  };
};

const apiGate = async (root) => {
  const { findings, exitCode } = await checkApi(["--root", root], { print: () => {} });
  return {
    name: "api",
    title: "Anti-hallucination gate",
    findings: findings.map((finding) =>
      shape(finding, SEVERITY[finding.code] === "error" ? "error" : "warn"),
    ),
    exitCode,
  };
};

/**
 * The design findings this checkout has already decided about.
 *
 * The framework runs its own clean-UI gate over `src/`, and two of its findings
 * are not defects: they are rules written for a screen, applied to a module that
 * is not one. `scripts/check-framework-ui.mjs` already knows that, through
 * `scripts/framework-ui-baseline.json`, where every entry carries its reason
 * (and a new one cannot be recorded without one). `verify` did not, so every run
 * printed those two under "what to review" — and a review list that never
 * changes is a list an agent learns to skip, which costs it the finding that
 * does matter.
 *
 * Only the framework checkout reads the file: a consumer's app has no such
 * baseline, and its findings are its own to answer.
 *
 * @param {string} root
 * @returns {Map<string, string>} `file:code` → the reason it was accepted
 */
const acceptedDesignFindings = (root) => {
  if (!isFrameworkProject(root)) return new Map();
  try {
    const text = fs.readFileSync(path.join(root, "scripts", "framework-ui-baseline.json"), "utf8");
    return new Map(Object.entries(JSON.parse(text)));
  } catch {
    return new Map();
  }
};

const uiGate = async (root) => {
  const { findings } = await checkUi(["--root", root], { print: () => {} });
  const accepted = acceptedDesignFindings(root);
  // The baseline key drops the line number on purpose: editing anything above a
  // finding must not invalidate a decision about the file.
  const keyOf = (finding) =>
    finding.file ? `${relative(finding.file, root).split(path.sep).join("/")}:${finding.code}` : "";
  const kept = [];
  const decided = [];
  for (const finding of findings) {
    const why = accepted.get(keyOf(finding));
    if (why === undefined) kept.push(finding);
    else decided.push({ file: relative(finding.file, root), code: finding.code, why });
  }
  return {
    name: "ui",
    title: "Design gate",
    findings: kept.map((finding) => shape(finding, designSeverity(finding.code))),
    accepted: decided,
    // An accepted finding is decided, so it cannot fail the run — including one
    // whose code is an error elsewhere, which is what its written reason is for.
    exitCode: kept.some((finding) => designSeverity(finding.code) === "error") ? 1 : 0,
  };
};

const structureGate = async (root) => {
  const findings = await scanStructure(root);
  return {
    name: "structure",
    title: "Structural gate",
    findings: findings.map((finding) => shape(finding)),
    exitCode: findings.some((item) => item.severity === "error") ? 1 : 0,
  };
};

const surfaceGate = async (root) => {
  const api = await loadApi(root);
  const definitions = definitionIndex(api.dir);
  const widgets = api.exports
    .filter((name) => /^[A-Z]/.test(name) && propsSource(api, name))
    .sort();
  const findings = [];
  for (const name of widgets) {
    const data = unpackWidget(api, name, definitions);
    const declaration = data.interface || `${name}Props`;
    for (const prop of data.gaps.invented) {
      findings.push(
        shape({
          code: "INVENTED_PROP",
          file: data.sourceFile,
          message: `${name}.${prop.prop} is read by the widget but declared nowhere — nobody can discover it`,
          suggestion: `declare it in ${declaration} (src/index.d.ts)`,
        }),
      );
    }
    for (const prop of data.gaps.dead) {
      findings.push(
        shape({
          code: "DEAD_PROP",
          file: data.sourceFile,
          message: `${name}.${prop.prop} is declared but nothing routes or reads it`,
          suggestion: "wire it in the widget, or drop it from the declaration",
          severity: "warn",
        }),
      );
    }
  }
  const errors = findings.filter((item) => item.severity === "error");
  return {
    name: "surface",
    title: "Prop contract",
    findings,
    exitCode: errors.length ? 1 : 0,
  };
};

/**
 * The suites a project may declare, in the order they run.
 *
 * They are the project's own detection scripts — in this repository the static
 * checkers, the browser harnesses and the visual baseline. The order is the
 * cheap one first, so a broken rule is named before Chrome is launched.
 */
const SUITES = ["test", "test:browser", "test:visual"];

/**
 * The tail of a child's output, which is where a check says why it failed.
 *
 * @param {string} text
 * @param {number} [count]
 * @returns {string}
 */
const lastLines = (text, count = 15) =>
  String(text)
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .slice(-count)
    .join("\n");

/**
 * The project's own test scripts.
 *
 * A generated app declares none, so the gate says so instead of pretending to
 * have run something. In this repository it is every suite `package.json`
 * declares: the static checkers, the browser harnesses and the visual
 * baseline — the command an agent runs after an edit has to be the same one
 * that finds a parse error, a broken rule and a moved pixel, or the agent
 * stops at the first green command it knows.
 *
 * The children run with `FLETBOX_VERIFY_NESTED` set, so a `test` script that
 * itself calls `flet-box verify` cannot recurse: the nested run answers with
 * the fast gates and returns.
 *
 * @param {string} root
 * @param {{print?: (line: string) => void}} [context]
 * @returns {Promise<object>}
 */
const testsGate = async (root, context = {}) => {
  const skipped = (why) => ({
    name: "tests",
    title: "Test suite",
    findings: [],
    exitCode: 0,
    skipped: why,
  });
  if (process.env.FLETBOX_VERIFY_NESTED) return skipped("already inside a verify run");

  let scripts = {};
  try {
    scripts = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).scripts ?? {};
  } catch {
    /* a project without a manifest declares no suite */
  }
  const declared = SUITES.filter((script) => scripts[script]);
  if (!declared.length) return skipped("this project declares no test script");

  const say = context.print ?? (() => {});
  const findings = [];
  let missingNpm = false;
  for (const script of declared) {
    say(c("gray", `   tests    npm run ${script} …`));
    const started = Date.now();
    const result = await runTestSuite(root, script);
    const seconds = ((Date.now() - started) / 1000).toFixed(1);
    if (result.missing) {
      missingNpm = true;
      say(c("gray", `   tests    npm run ${script} — skipped, npm is not on PATH`));
      continue;
    }
    say(
      result.code
        ? c("red", `   tests    npm run ${script} — exit ${result.code} (${seconds}s)`)
        : c("gray", `   tests    npm run ${script} — green (${seconds}s)`),
    );
    if (!result.code) continue;
    findings.push(
      shape({
        code: "TEST_SUITE_FAILED",
        message: `npm run ${script} exited ${result.code}`,
        detail: lastLines(result.output),
        suggestion: `run \`npm run ${script}\` alone — the check that failed names its own rule, and this is how its output ended`,
      }),
    );
  }
  if (missingNpm && !findings.length) return skipped("npm is not on PATH");
  return {
    name: "tests",
    title: "Test suite",
    findings,
    exitCode: findings.length ? 1 : 0,
  };
};

const GATES = {
  syntax: syntaxGate,
  api: apiGate,
  ui: uiGate,
  structure: structureGate,
  surface: surfaceGate,
  tests: testsGate,
};

const GATE_ORDER = ["syntax", "api", "ui", "structure", "surface", "tests"];

/* ----------------------------------------------------------------- report */

/**
 * How many review findings the report prints before it points at `--json`.
 *
 * A warning is a reading, not a failure, and a report nobody can scan is one
 * nobody reads: past this many, the count still prints.
 */
const REVIEW_LIMIT = 12;

/**
 * The report: one line per gate, then the findings of the gates that failed,
 * then the ones that are a reading rather than a failure.
 *
 * A warning is printed with its file, its line and its suggestion too. It used
 * to be counted and never named — `ui 2 warning(s)` told an agent that
 * something was wrong somewhere, which is the one thing it cannot act on.
 *
 * @param {object} report
 * @returns {string[]}
 */
export const formatReport = (report) => {
  const lines = [];
  const count = (severity) =>
    report.steps.reduce(
      (n, step) => n + step.findings.filter((item) => item.severity === severity).length,
      0,
    );
  const errors = count("error");
  const warnings = count("warn");
  const infos = count("info");
  const failed = report.steps.filter((step) => step.exitCode);
  const ok = failed.length === 0;

  for (const step of report.steps) {
    const stepErrors = step.findings.filter((item) => item.severity === "error").length;
    const stepWarns = step.findings.filter((item) => item.severity === "warn").length;
    const stepInfos = step.findings.filter((item) => item.severity === "info").length;
    const mark = step.exitCode ? c("red", "✗") : c("green", "✓");
    const counts = [
      stepErrors ? c("red", `${stepErrors} error(s)`) : "",
      stepWarns ? c("yellow", `${stepWarns} warning(s)`) : "",
      stepInfos ? c("gray", `${stepInfos} to review`) : "",
    ]
      .filter(Boolean)
      .join(", ");
    // An accepted finding is a decision with a reason in the baseline file, not
    // work: it is counted once, by name, so the number stays visible without
    // asking the same question on every run.
    const decided = step.accepted?.length
      ? c("gray", `${step.accepted.length} accepted (framework-ui-baseline.json)`)
      : "";
    const status = step.skipped
      ? c("gray", `skipped — ${step.skipped}`)
      : [counts, decided].filter(Boolean).join(", ") || c("gray", "clean");
    lines.push(`  ${mark} ${c("brightCyan", step.name.padEnd(8))} ${status}`);
  }

  const failing = failed.flatMap((step) =>
    step.findings
      .filter((item) => item.severity === "error")
      .map((item) => ({ ...item, gate: step.name })),
  );
  const printFinding = (item) => {
    const at = item.column ? `${item.line}:${item.column}` : `${item.line}`;
    const where = item.file
      ? c("brightCyan", `${relative(item.file, report.root)}:${at}`)
      : c("gray", item.gate);
    lines.push(`  ${where}  ${c("yellow", item.code)} — ${item.message}`);
    if (item.detail) {
      for (const text of String(item.detail).split("\n")) lines.push(`     ${c("gray", text)}`);
    }
    if (item.suggestion) lines.push(`     ${c("gray", "→ " + item.suggestion)}`);
  };

  if (failing.length) {
    lines.push("");
    lines.push(section("•", "what to fix", "#f87171"));
    for (const item of failing) printFinding(item);
  }

  const review = report.steps.flatMap((step) =>
    step.findings
      .filter((item) => item.severity !== "error")
      .map((item) => ({ ...item, gate: step.name })),
  );
  if (review.length) {
    lines.push("");
    lines.push(section("•", "what to review", "#fbbf24"));
    for (const item of review.slice(0, REVIEW_LIMIT)) printFinding(item);
    if (review.length > REVIEW_LIMIT) {
      lines.push(
        `  ${c("gray", `… ${review.length - REVIEW_LIMIT} more — \`flet-box verify --json\` carries them all`)}`,
      );
    }
  }

  const suitesRan = report.steps.some((step) => step.name === "tests" && !step.skipped);
  const counted = [`${errors} error(s)`];
  if (warnings) counted.push(`${warnings} warning(s)`);
  if (infos) counted.push(`${infos} to review`);
  lines.push("");
  lines.push(
    ok
      ? c(
          "green",
          `✅ ${counted.join(", ")} — the code parses, is legal, on the scale and on the tokens${suitesRan ? ", and every suite is green" : ""}.`,
        )
      : c(
          "red",
          `❌ ${errors} error(s), ${warnings} warning(s) — fix the line named above, then run it again.`,
        ),
  );
  return lines;
};

/**
 * The machine-readable report.
 *
 * @param {object} report
 * @returns {object}
 */
const asJson = (report) => ({
  root: report.root,
  package: report.package,
  ok: report.steps.every((step) => !step.exitCode),
  steps: report.steps.map((step) => ({
    name: step.name,
    title: step.title,
    exitCode: step.exitCode,
    skipped: step.skipped || null,
    findings: step.findings,
    // Present only for a gate that can accept a finding: the entries this
    // checkout has decided about, with the reason it wrote down.
    ...(step.accepted?.length ? { accepted: step.accepted } : {}),
  })),
});

/* --------------------------------------------------------------- the log */

/**
 * Append one row to the metrics log.
 *
 * The row is the run, not the session: when it happened, which project, whether
 * the gates were green, which gates failed and which codes they reported. The
 * metric script groups the rows into generations — a run of failing rows closed
 * by the first green one — and reads the north metric off that.
 *
 * @param {string} root
 * @param {object} report
 * @returns {string|null} the row that was written
 */
export const recordGeneration = (root, report) => {
  const file = metricsLog(root);
  if (!file) return null;
  const failed = report.steps.filter((step) => step.exitCode);
  const codes = [
    ...new Set(
      report.steps.flatMap((step) =>
        step.findings.filter((item) => item.severity === "error").map((item) => item.code),
      ),
    ),
  ];
  const row = [
    new Date().toISOString(),
    path.basename(root),
    failed.length ? "✗" : "✓",
    failed.length ? failed.map((step) => step.name).join(", ") : "—",
    codes.length ? codes.join(", ") : "—",
  ].join(" | ");
  try {
    const text = fs.readFileSync(file, "utf8");
    fs.appendFileSync(file, `${text.endsWith("\n") ? "" : "\n"}| ${row} |\n`, "utf8");
  } catch {
    return null;
  }
  return row;
};

/* -------------------------------------------------------------------- run */

/**
 * Run every gate, in parallel, and collect what they say.
 *
 * @param {string} root Project root.
 * @param {string[]} names Gate names to run.
 * @param {{print?: (line: string) => void}} [context] Passed to a gate that reports progress.
 * @returns {Promise<object>}
 */
export const runGates = async (root, names, context = {}) => {
  const steps = await Promise.all(
    names.map(async (name) => {
      const gate = GATES[name];
      try {
        const result = await gate(root, context);
        return { ...result, name };
      } catch (error) {
        return {
          name,
          title: name,
          findings: [
            shape({
              code: "GATE_FAILED",
              message: error.message,
              suggestion: "the gate could not run — check that flet-box is installed",
            }),
          ],
          exitCode: 1,
        };
      }
    }),
  );
  let version = "?";
  try {
    version = (await loadApi(root)).pkg.version;
  } catch {
    /* the gates report the missing package themselves */
  }
  return { root, package: version, steps };
};

/**
 * The `flet-box verify` command.
 *
 * @param {string[]} argv Flags after the command name.
 * @param {{print?: (line: string) => void, root?: string}} [io]
 * @returns {Promise<{exitCode: number, report: object}>}
 */
export const verify = async (argv = [], io = {}) => {
  const print = io.print ?? ((line) => console.log(line));
  const rootIndex = argv.indexOf("--root");
  const root = path.resolve(
    rootIndex >= 0 && argv[rootIndex + 1] ? argv[rootIndex + 1] : io.root || process.cwd(),
  );
  const only = argv.includes("--only") ? argv[argv.indexOf("--only") + 1] : null;
  const watching = argv.includes("--watch");
  // `--watch` starts the loop without the suites: the gate an editor reruns on
  // every keystroke cannot spend a minute in Chrome. `--no-tests` is the same
  // choice stated by the caller — a CI job that runs the suites in their own
  // jobs uses it, so the report says what happened instead of borrowing the
  // "already inside a verify run" note that only tells the truth about nesting.
  // A plain `verify` still runs them, and `--only tests` runs them alone.
  const skipTests = watching || argv.includes("--no-tests");
  const names = only
    ? GATE_ORDER.filter((name) => name === only)
    : GATE_ORDER.filter((name) => !skipTests || name !== "tests");

  if (!names.length) {
    print(c("red", `Unknown gate "${only}" — the gates are: ${GATE_ORDER.join(", ")}`));
    return { exitCode: 1, report: null };
  }

  // `--fix` runs the mechanical repair first, so a mistyped prop or a wrong
  // relative path is corrected by the tool that can prove the correction and
  // never reaches the agent as work to do.
  if (argv.includes("--fix")) {
    const fix = await auditFix(["--root", root], { print });
    if (fix.changed.length) {
      print(
        c("gray", `   ${fix.changed.length} file(s) rewritten — the gates below read the result.`),
      );
    }
    print("");
  }

  const report = await runGates(root, names, argv.includes("--json") ? {} : { print });
  const failed = report.steps.some((step) => step.exitCode);
  if (argv.includes("--json")) {
    print(JSON.stringify(asJson(report), null, 2));
  } else {
    print(
      banner(
        failed ? "❌ FletBox verify" : "✅ FletBox verify",
        `${path.basename(root)} · flet-box@${report.package}`,
      ),
    );
    print("");
    for (const line of formatReport(report)) print(line);
    print("");
  }

  // The log is written for every run, not only for the green ones: a metric
  // that counts only the successes cannot tell a correction from a first try.
  const row = recordGeneration(root, report);
  if (row && !argv.includes("--json")) {
    print(c("gray", `   logged → ${metricsLog(root)}`));
    print("");
  }

  if (argv.includes("--watch")) {
    print(
      c(
        "dim",
        "👀 watching src/ — every edit is checked again (500 ms debounce); Ctrl+C to stop",
      ),
    );
    watchVerify({
      root,
      onReport: (live) => {
        console.log("");
        for (const line of formatReport(live)) console.log(line);
        console.log("");
      },
    });
    return { exitCode: 0, report };
  }

  return { exitCode: failed ? 1 : 0, report };
};

/* ------------------------------------------------------------------ watch */

/**
 * Watch the project and re-run the gates on every change.
 *
 * The debounce is 500 ms: an agent writes a file and the editor writes a
 * second one, and two runs would report the same finding twice.
 *
 * @param {{root: string, onReport: (report: object) => void, debounce?: number}} options
 * @returns {fs.FSWatcher}
 */
export const watchVerify = ({ root, onReport, debounce = 500 }) => {
  const watchDir = fs.existsSync(path.join(root, "src")) ? path.join(root, "src") : root;
  let timer = null;
  let running = false;
  let queued = false;
  let previous = "";

  const tick = async () => {
    if (running) {
      queued = true;
      return;
    }
    running = true;
    const report = await runGates(root, GATE_ORDER.filter((name) => name !== "tests"));
    running = false;
    const signature = report.steps
      .map((step) =>
        `${step.name}:${step.exitCode}:${step.findings
          .map((item) => `${item.code}@${item.file}:${item.line}`)
          .join(",")}`,
      )
      .join("|");
    if (signature !== previous) {
      previous = signature;
      onReport(report);
    }
    if (queued) {
      queued = false;
      await tick();
    }
  };

  const watcher = fs.watch(watchDir, { recursive: true }, (_event, filename) => {
    if (!filename) return;
    const name = String(filename);
    if (name.includes("node_modules") || name.startsWith(".")) return;
    if (!/\.(m?js|css|html|json)$/.test(name)) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      tick();
    }, debounce);
  });
  return watcher;
};

/**
 * Run one of the project's own npm scripts and keep what it said.
 *
 * `--silent` matters: without it npm prints its own banner and, on failure, a
 * block of `npm error` lines that bury the one line the check wrote. With it
 * the output is the check's own words, which is the whole point of running the
 * suite from here.
 *
 * @param {string} root
 * @param {string} script The npm script name.
 * @returns {Promise<{code: number|null, output: string, missing?: string}>}
 */
export const runTestSuite = (root, script = "test") =>
  new Promise((resolve) => {
    execFile(
      process.platform === "win32" ? "npm.cmd" : "npm",
      ["run", script, "--silent"],
      {
        cwd: root,
        env: { ...process.env, FLETBOX_VERIFY_NESTED: "1" },
        timeout: 15 * 60 * 1000,
        maxBuffer: 32 * 1024 * 1024,
        shell: process.platform === "win32",
      },
      (error, stdout, stderr) => {
        const output = `${stdout}${stderr}`;
        if (!error) return resolve({ code: 0, output });
        if (error.code === "ENOENT") return resolve({ code: null, output, missing: "npm" });
        resolve({ code: typeof error.code === "number" ? error.code : 1, output });
      },
    );
  });

export default verify;
