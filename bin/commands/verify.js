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
 *
 * A new gate is one entry in `STEPS` and nothing else.
 *
 * Node core only: this file ships inside every app `flet-box create` builds,
 * so it may not reach for a devDependency.
 */

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { checkApi, loadApi, SEVERITY } from "./checkApi.js";
import { checkUi, ERROR_CODES, WARN_CODES, INFO_CODES } from "./checkUi.js";
import { scanStructure } from "./checkStructure.js";
import { auditFix } from "./auditFix.js";
import { metricsLog } from "./metrics.js";
import { definitionIndex, propsSource, unpackWidget } from "./unpack.js";
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

const uiGate = async (root) => {
  const { findings, exitCode } = await checkUi(["--root", root], { print: () => {} });
  return {
    name: "ui",
    title: "Design gate",
    findings: findings.map((finding) => shape(finding, designSeverity(finding.code))),
    exitCode,
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
 * The repository's own test suite, when there is one.
 *
 * A generated app has no harness of its own, so the step is skipped there
 * rather than pretending to have run. In the framework it is `npm test` — the
 * static checkers plus the browser harnesses — and it is opt-in, because it
 * packs the tarball and scaffolds a project, which is far too slow for the
 * gate an agent runs after every edit.
 */
const testsGate = async (root) => {
  const suite = path.join(root, "scripts", "check-widgets.mjs");
  if (!fs.existsSync(suite)) {
    return {
      name: "tests",
      title: "Test suite",
      findings: [],
      exitCode: 0,
      skipped: "no test suite in this project",
    };
  }
  return {
    name: "tests",
    title: "Test suite",
    findings: [],
    exitCode: 0,
    skipped: "run `npm test` for the full suite",
  };
};

const GATES = {
  api: apiGate,
  ui: uiGate,
  structure: structureGate,
  surface: surfaceGate,
  tests: testsGate,
};

const GATE_ORDER = ["api", "ui", "structure", "surface", "tests"];

/* ----------------------------------------------------------------- report */

/**
 * The report: one line per gate, then the findings of the gates that failed.
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
    const status = step.skipped
      ? c("gray", `skipped — ${step.skipped}`)
      : counts || c("gray", "clean");
    lines.push(`  ${mark} ${c("brightCyan", step.name.padEnd(8))} ${status}`);
  }

  const failing = failed.flatMap((step) =>
    step.findings
      .filter((item) => item.severity === "error")
      .map((item) => ({ ...item, gate: step.name })),
  );
  if (failing.length) {
    lines.push("");
    lines.push(section("•", "what to fix", "#f87171"));
    for (const item of failing) {
      const where = item.file
        ? c("brightCyan", `${relative(item.file, report.root)}:${item.line}`)
        : c("gray", item.gate);
      lines.push(`  ${where}  ${c("yellow", item.code)} — ${item.message}`);
      if (item.detail) lines.push(`     ${c("gray", item.detail)}`);
      if (item.suggestion) lines.push(`     ${c("gray", "→ " + item.suggestion)}`);
    }
  }

  lines.push("");
  lines.push(
    ok
      ? c(
          "green",
          `✅ ${errors} error(s)${infos ? `, ${infos} to review` : ""} — the code is legal, on the scale and on the tokens.`,
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
 * @returns {Promise<object>}
 */
export const runGates = async (root, names) => {
  const steps = await Promise.all(
    names.map(async (name) => {
      const gate = GATES[name];
      try {
        const result = await gate(root);
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
  const names = only
    ? GATE_ORDER.filter((name) => name === only)
    : GATE_ORDER.filter((name) => name !== "tests");

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

  const report = await runGates(root, names);
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
 * Run the repository's own test suite as a child process.
 *
 * @param {string} root
 * @returns {Promise<number>}
 */
export const runTestSuite = (root) =>
  new Promise((resolve) => {
    const child = spawn("npm", ["test"], {
      cwd: root,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("close", (code) => resolve(code ?? 1));
  });

export default verify;
