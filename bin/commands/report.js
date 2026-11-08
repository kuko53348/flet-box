/**
 * @file bin/commands/report.js
 * @description The diagnosis: one artifact that answers "where is the work?".
 *
 * `verify` answers a yes/no question — may I say this is done — and answers it
 * gate by gate, because that is what an exit code needs. An agent that is
 * *lost* needs the other reading of the same facts: not which gate failed, but
 * which file is wrong, how wrong, which widget is missing a declaration, and
 * which one thing to do next. That is this command.
 *
 * It runs the six static gates once, then re-groups their findings by the file
 * the reader will open. The surface gate hands back the per-widget ledger it
 * built while checking (it is the expensive half of the run), the metrics log
 * says which mistakes keep coming back, and every finding is paired with the
 * rule that owns its code — so the report is a route, not a list.
 *
 * Three rules make it a tool rather than another number:
 *
 *   1. **Read-only.** It edits nothing, deletes nothing, runs no repair and
 *      appends no metrics row (unlike `verify`). The only file it can write is
 *      the HTML report itself, and only when `--html` asks for it.
 *   2. **Every file is named**, including the clean ones, with its verdict,
 *      its line count and the widgets it imports. A report that lists only the
 *      failures cannot tell "this file is fine" from "this file was not read".
 *   3. **Every finding carries a next step and a rule.** A code with no
 *      suggestion is printed with the tool that proves it instead, because
 *      "something is wrong somewhere" is not a finding.
 *
 * The suites are opt-in (`--tests`): a report is asked for while the code is
 * broken, and a broken app's browser suite is a minute of Chrome to learn what
 * the static gates already named.
 *
 * Node core only: this file ships inside every app `flet-box create` builds.
 */

import fs from "node:fs";
import path from "node:path";
import { runGates } from "./verify.js";
import { collectSources, loadApi } from "./checkApi.js";
import { metricsLog, parseLog, groupGenerations, rankCodes, owner } from "./metrics.js";
import { neutralise } from "../utils/neutralise.js";
import { c, banner, section } from "../utils/colors.js";

/** The gates a report runs unless `--tests` is asked for. */
export const REPORT_GATES = ["syntax", "api", "types", "ui", "structure", "surface"];

const GATE_RANK = new Map(REPORT_GATES.map((name, index) => [name, index]));
const SEVERITY_RANK = { error: 0, warn: 1, info: 2 };
const NEXT_LIMIT = 20;

/** How many times each severity appears in a list of findings. */
const tally = (findings) => ({
  errors: findings.filter((item) => item.severity === "error").length,
  warnings: findings.filter((item) => item.severity === "warn").length,
  review: findings.filter((item) => item.severity === "info").length,
});

const read = (file) => {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
};

/**
 * A finding's file as a project-relative path, or null when it lives outside
 * the project (the framework's own sources, in an app's report).
 *
 * Gates disagree about their base: `check-api` writes paths relative to the
 * working directory, `check-ui` and `check-structure` absolute ones. Both are
 * resolved here once, and an unresolved path is kept as an absolute one.
 *
 * @param {string|null} file
 * @param {string} root
 * @returns {string|null}
 */
const relInside = (file, root) => {
  if (!file) return null;
  let absolute = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
  if (!fs.existsSync(absolute)) {
    const fromRoot = path.resolve(root, file);
    if (fs.existsSync(fromRoot)) absolute = fromRoot;
  }
  const rel = path.relative(root, absolute);
  return rel && !rel.startsWith("..") && !path.isAbsolute(rel) ? rel.split(path.sep).join("/") : null;
};

const WIDGET_IMPORT = /import\s+([^;]+?)\s+from\s+["']flet-box["'];?/g;

/**
 * The widgets a file imports from the installed package.
 *
 * Read from the import clause rather than from every `Name({` in the file: a
 * constructor call or a local helper shaped like a widget would otherwise be
 * counted as one, and this list is a fact the reader trusts.
 *
 * @param {string} text
 * @param {object|null} api
 * @returns {string[]}
 */
const widgetsIn = (text, api) => {
  if (!api) return [];
  const names = new Set();
  // `keepStrings`: the module specifier and the imported names are both inside
  // strings after the call-site neutraliser strips them, and this list is read
  // from the import clause on purpose (a constructor or a local helper shaped
  // like a widget must not be reported as one).
  for (const match of neutralise(text, { keepStrings: true }).matchAll(WIDGET_IMPORT)) {
    const braces = /\{([\s\S]*)\}/.exec(match[1]);
    if (!braces) continue;
    for (const part of braces[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0].trim();
      if (/^[A-Z]/.test(name) && api.exports.includes(name)) names.add(name);
    }
  }
  return [...names].sort();
};

/* ------------------------------------------------------------------ build */

/**
 * Run the gates and turn their output into the report a reader can act on.
 *
 * @param {{root?: string, tests?: boolean, print?: (line: string) => void}} [options]
 * @returns {Promise<object>}
 */
export const buildReport = async({ root = process.cwd(), tests = false, print } = {}) => {
  const absoluteRoot = path.resolve(root);
  const names = tests ? [...REPORT_GATES, "tests"] : REPORT_GATES;
  const run = await runGates(absoluteRoot, names, tests ? { print } : {});

  let api = null;
  const notes = [];
  try {
    api = await loadApi(absoluteRoot);
  } catch {
    notes.push("the installed flet-box package could not be read — widget facts are missing");
  }

  // Every source file is a row, clean or not: a report that only prints the
  // failures cannot distinguish a file it read and cleared from one it never
  // opened.
  const files = new Map();
  const addFile = (abs) => {
    const rel = relInside(abs, absoluteRoot);
    if (!rel || files.has(rel)) return files.get(rel) || null;
    const text = read(abs);
    const entry = {
      file: rel,
      lines: text ? text.split("\n").length : 0,
      widgets: widgetsIn(text, api),
      findings: [],
      verdict: "clean",
      errors: 0,
      warnings: 0,
      review: 0,
    };
    files.set(rel, entry);
    return entry;
  };
  for (const abs of collectSources(absoluteRoot)) addFile(abs);

  const flat = [];
  const outside = [];
  for (const step of run.steps) {
    for (const finding of step.findings) {
      const item = { ...finding, gate: step.name, rule: owner(finding.code) };
      flat.push(item);
      const rel = relInside(finding.file, absoluteRoot);
      const entry = rel ? addFile(path.resolve(absoluteRoot, rel)) : null;
      if (entry) entry.findings.push(item);
      else outside.push(item);
    }
  }

  for (const entry of files.values()) {
    const counts = tally(entry.findings);
    entry.errors = counts.errors;
    entry.warnings = counts.warnings;
    entry.review = counts.review;
    entry.verdict = counts.errors
      ? "error"
      : counts.warnings
        ? "warn"
        : counts.review
          ? "review"
          : "clean";
  }

  const ledger = run.steps.find((step) => step.name === "surface")?.widgets || [];
  // A contract gap is a prop that lies about the API: read but undeclared,
  // declared but dead, or routed by the engine and declared nowhere. `docOnly`
  // and `codeOnly` are documentation precision — an inherited `padding` read by
  // every widget is documented once, in the Common props table — so they are
  // carried in the row and never counted as debt, or four widgets would look
  // broken because their parent's props are documented somewhere else.
  const withDebt = ledger
    .map((row) => ({
      ...row,
      total: row.invented.length + row.dead.length + row.notDeclared.length,
      docs: row.docOnly.length + row.codeOnly.length,
    }))
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  const widgets = ledger.length
    ? { total : ledger.length, clean: ledger.length - withDebt.length, withDebt }
    : null;

  let metrics = null;
  const log = metricsLog(absoluteRoot);
  if (log) {
    try {
      const rows = parseLog(log);
      const generations = groupGenerations(rows);
      const firstTry = generations.filter((generation) => generation.firstTry).length;
      const ranked = [...rankCodes(rows).entries()].sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
      );
      metrics = {
        file: relInside(log, absoluteRoot) || log,
        runs: rows.length,
        generations: generations.length,
        firstTry,
        north: generations.length ? firstTry / generations.length : 0,
        top: ranked.slice(0, 3).map(([code, count]) => ({ code, count, rule: owner(code) })),
      };
    } catch {
      notes.push("the metrics log is unreadable — the history is not counted");
    }
  }

  const next = flat
    .slice()
    .sort(
      (a, b) =>
        SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] ||
        GATE_RANK.get(a.gate) - GATE_RANK.get(b.gate) ||
        String(a.file || "").localeCompare(String(b.file || "")) ||
        a.line - b.line,
    )
    .map((finding, index) => ({
      rank: index + 1,
      severity: finding.severity,
      gate: finding.gate,
      code: finding.code,
      file: relInside(finding.file, absoluteRoot),
      line: finding.line,
      column: finding.column,
      message: finding.message,
      fix: finding.suggestion,
      rule: finding.rule,
    }));

  const totals = tally(flat);
  const ordered = [...files.values()].sort(
    (a, b) =>
      SEVERITY_RANK[a.verdict === "review" ? "info" : a.verdict] -
        SEVERITY_RANK[b.verdict === "review" ? "info" : b.verdict] ||
      a.file.localeCompare(b.file),
  );

  return {
    tool: "flet-box report",
    readOnly: true,
    generatedAt: new Date().toISOString(),
    root: absoluteRoot,
    package: run.package,
    ok: run.steps.every((step) => !step.exitCode),
    summary: {
      files: files.size,
      clean: ordered.filter((entry) => entry.verdict === "clean").length,
      withFindings: ordered.filter((entry) => entry.verdict !== "clean").length,
      errors: totals.errors,
      warnings: totals.warnings,
      review: totals.review,
      widgets: widgets?.total ?? 0,
      widgetsWithDebt: widgets?.withDebt.length ?? 0,
      metrics: metrics ? `${metrics.firstTry}/${metrics.generations} first-try` : null,
    },
    notes,
    gates: run.steps.map((step) => {
      const counts = tally(step.findings);
      return {
        name: step.name,
        title: step.title,
        exitCode: step.exitCode,
        skipped: step.skipped || null,
        errors: counts.errors,
        warnings: counts.warnings,
        review: counts.review,
      };
    }),
    files: ordered,
    outside,
    widgets,
    metrics,
    next,
  };
};

/* ------------------------------------------------------------------- text */

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const verdictMark = (verdict) => {
  if (verdict === "error") return c("red", "✗");
  if (verdict === "warn") return c("yellow", "!");
  if (verdict === "review") return c("gray", "·");
  return c("green", "✓");
};

/**
 * The report as the lines a terminal prints.
 *
 * @param {object} report
 * @returns {string[]}
 */
export const renderText = (report) => {
  const lines = [];
  const { summary } = report;
  lines.push(
    banner("🩺 FletBox report", `${path.basename(report.root)} · flet-box@${report.package} · read-only`),
  );
  lines.push("");
  lines.push(
    `  ${plural(summary.files, "file", "files")}: ${summary.clean} clean · ${summary.withFindings} with findings`,
  );
  lines.push(
    `  ${summary.errors} error(s), ${summary.warnings} warning(s)` +
      (summary.review ? `, ${summary.review} to review` : "") +
      (report.widgets ? ` · ${report.widgets.total} widgets, ${summary.widgetsWithDebt} with contract gaps` : ""),
  );
  lines.push("");

  for (const gate of report.gates) {
    const mark = gate.exitCode ? c("red", "✗") : c("green", "✓");
    const counts = [
      gate.errors ? c("red", `${gate.errors} error(s)`) : "",
      gate.warnings ? c("yellow", `${gate.warnings} warning(s)`) : "",
      gate.review ? c("gray", `${gate.review} to review`) : "",
    ]
      .filter(Boolean)
      .join(", ");
    const status = gate.skipped
      ? c("gray", `skipped — ${gate.skipped}`)
      : counts || c("gray", "clean");
    lines.push(`  ${mark} ${c("brightCyan", gate.name.padEnd(9))} ${status}`);
  }

  if (report.notes.length) {
    lines.push("");
    for (const note of report.notes) lines.push(`  ${c("yellow", `⚠ ${note}`)}`);
  }

  if (report.next.length) {
    lines.push("");
    lines.push(section("•", "next", "#fbbf24"));
    for (const item of report.next.slice(0, NEXT_LIMIT)) {
      const at = item.file ? `${item.file}:${item.line}${item.column ? `:${item.column}` : ""}` : item.gate;
      const tint = item.severity === "error" ? "red" : item.severity === "warn" ? "yellow" : "gray";
      lines.push(`  ${String(item.rank).padStart(2)}. ${c("brightCyan", at)}  ${c(tint, item.code)} — ${item.message}`);
      if (item.fix) lines.push(`      ${c("gray", `→ ${item.fix}`)}`);
      if (item.rule) lines.push(`      ${c("dim", `rule: ${item.rule}`)}`);
    }
    if (report.next.length > NEXT_LIMIT) {
      lines.push(
        `  ${c("gray", `… ${report.next.length - NEXT_LIMIT} more — \`flet-box report --json\` carries them all`)}`,
      );
    }
  }

  const dirty = report.files.filter((entry) => entry.verdict !== "clean");
  if (dirty.length) {
    lines.push("");
    lines.push(section("•", "files", "#67e8f9"));
    for (const entry of dirty) {
      const counts = [
        entry.errors ? c("red", `${entry.errors} error(s)`) : "",
        entry.warnings ? c("yellow", `${entry.warnings} warning(s)`) : "",
        entry.review ? c("gray", `${entry.review} to review`) : "",
      ]
        .filter(Boolean)
        .join(", ");
      lines.push(
        `  ${verdictMark(entry.verdict)} ${c("brightWhite", entry.file)}  ${counts}` +
          (entry.widgets.length ? `  ${c("gray", `· ${entry.widgets.join(", ")}`)}` : ""),
      );
    }
  }

  if (report.outside.length) {
    lines.push("");
    lines.push(section("•", "outside the project", "#a5b4fc"));
    lines.push(
      `  ${c("gray", "these findings name the installed package, not your code — they are the framework's debt:")}`,
    );
    for (const item of report.outside.slice(0, NEXT_LIMIT)) {
      lines.push(`  ${c("gray", item.code)} — ${item.message}`);
    }
  }

  if (report.widgets?.withDebt.length) {
    lines.push("");
    lines.push(section("•", "widget contract", "#a5b4fc"));
    for (const row of report.widgets.withDebt.slice(0, NEXT_LIMIT)) {
      const parts = [
        row.invented.length && `invented: ${row.invented.join(" ")}`,
        row.dead.length && `dead: ${row.dead.join(" ")}`,
        row.notDeclared.length && `not in .d.ts: ${row.notDeclared.join(" ")}`,
        row.docs ? `${row.docs} doc gap(s)` : "",
      ].filter(Boolean);
      lines.push(`  ${c("brightWhite", row.name.padEnd(18))} ${c("gray", parts.join(" · "))}`);
    }
    if (report.widgets.withDebt.length > NEXT_LIMIT) {
      lines.push(
        `  ${c("gray", `… ${report.widgets.withDebt.length - NEXT_LIMIT} more — \`flet-box unpack --all --diff\``)}`,
      );
    }
  }

  if (report.metrics) {
    lines.push("");
    const top = report.metrics.top.length
      ? report.metrics.top.map((row) => `${row.code} ×${row.count}`).join(", ")
      : "no failure logged yet";
    lines.push(
      `  ${c("gray", `metrics: ${report.metrics.firstTry}/${report.metrics.generations} generation(s) passed first try (${(report.metrics.north * 100).toFixed(0)}%) · ${top}`)}`,
    );
  }

  lines.push("");
  lines.push(
    report.ok
      ? c(
          "green",
          `✅ 0 error(s) — ${summary.clean} file(s) clean${report.widgets ? `, ${report.widgets.clean}/${report.widgets.total} widgets with no contract gap` : ""}.`,
        )
      : c(
          "red",
          `❌ ${summary.errors} error(s), ${summary.warnings} warning(s) — start with ${report.next[0].file ? `${report.next[0].file}:${report.next[0].line}` : report.next[0].gate}, then run \`flet-box report\` again.`,
        ),
  );
  return lines;
};

/* ------------------------------------------------------------------- markdown */

const mdCell = (value) => String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

/**
 * The report as Markdown, for a commit comment or a handover note.
 *
 * @param {object} report
 * @returns {string}
 */
export const renderMarkdown = (report) => {
  const { summary } = report;
  const out = [];
  out.push(`# FletBox report — ${path.basename(report.root)}`);
  out.push("");
  out.push(
    `\`flet-box@${report.package}\` · ${report.generatedAt} · read-only · ${report.ok ? "**no errors**" : `**${summary.errors} error(s)**`}`,
  );
  out.push("");
  out.push(
    `${summary.files} file(s): ${summary.clean} clean, ${summary.withFindings} with findings · ` +
      `${summary.errors} error(s), ${summary.warnings} warning(s), ${summary.review} to review` +
      (report.widgets ? ` · ${summary.widgetsWithDebt}/${report.widgets.total} widgets with contract gaps` : ""),
  );
  out.push("");

  out.push("## Gates");
  out.push("");
  out.push("| gate | result | errors | warnings | review |");
  out.push("| --- | --- | --- | --- | --- |");
  for (const gate of report.gates) {
    const result = gate.skipped ? `skipped — ${gate.skipped}` : gate.exitCode ? "failed" : "clean";
    out.push(`| ${gate.name} | ${mdCell(result)} | ${gate.errors} | ${gate.warnings} | ${gate.review} |`);
  }
  out.push("");

  if (report.next.length) {
    out.push("## Next");
    out.push("");
    for (const item of report.next) {
      const at = item.file ? `\`${item.file}:${item.line}${item.column ? `:${item.column}` : ""}\`` : `_${item.gate}_`;
      out.push(`${item.rank}. **${item.code}** at ${at} — ${mdCell(item.message)}`);
      if (item.fix) out.push(`   - fix: ${mdCell(item.fix)}`);
      if (item.rule) out.push(`   - rule: ${mdCell(item.rule)}`);
    }
    out.push("");
  }

  const dirty = report.files.filter((entry) => entry.verdict !== "clean");
  if (dirty.length) {
    out.push("## Files with findings");
    out.push("");
    out.push("| file | verdict | errors | warnings | widgets |");
    out.push("| --- | --- | --- | --- | --- |");
    for (const entry of dirty) {
      out.push(
        `| \`${mdCell(entry.file)}\` | ${entry.verdict} | ${entry.errors} | ${entry.warnings} | ${mdCell(entry.widgets.join(", "))} |`,
      );
    }
    out.push("");
  }

  if (report.widgets?.withDebt.length) {
    out.push("## Widget contract gaps");
    out.push("");
    out.push("| widget | props | invented | dead | not in .d.ts |");
    out.push("| --- | --- | --- | --- | --- |");
    for (const row of report.widgets.withDebt) {
      out.push(
        `| ${row.name} | ${row.props} | ${mdCell(row.invented.join(" "))} | ${mdCell(row.dead.join(" "))} | ${mdCell(row.notDeclared.join(" "))} |`,
      );
    }
    out.push("");
  }

  if (report.metrics) {
    out.push("## Recurring failures");
    out.push("");
    out.push(
      `${report.metrics.firstTry}/${report.metrics.generations} generation(s) passed first try (${(report.metrics.north * 100).toFixed(0)}%), ${report.metrics.runs} run(s) logged.`,
    );
    if (report.metrics.top.length) {
      out.push("");
      out.push("| code | times | rule |");
      out.push("| --- | --- | --- |");
      for (const row of report.metrics.top) {
        out.push(`| ${row.code} | ${row.count} | ${mdCell(row.rule || "— no rule owns this one yet")} |`);
      }
    }
    out.push("");
  }

  if (report.notes.length) {
    out.push("## Notes");
    out.push("");
    for (const note of report.notes) out.push(`- ${mdCell(note)}`);
    out.push("");
  }

  out.push("---");
  out.push("");
  out.push("Read-only diagnosis. Regenerate with `flet-box report`, or `flet-box report --html` for the same page as a file.");
  return out.join("\n");
};

/* ------------------------------------------------------------------- html */

const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const badge = (verdict) => {
  const label = { error: "error", warn: "warning", review: "review", clean: "clean" }[verdict] || verdict;
  return `<span class="badge ${esc(verdict)}">${esc(label)}</span>`;
};

/**
 * The report as one self-contained page — no fonts, no scripts, no requests.
 *
 * A report that needs the network to render is a report that cannot be opened
 * on the machine where the code lives. Everything here is inline, the only
 * external thing named is the command that regenerates it.
 *
 * @param {object} report
 * @returns {string}
 */
export const renderHtml = (report) => {
  const { summary } = report;
  const title = `FletBox report — ${path.basename(report.root)}`;
  const createdAt = report.generatedAt.replace("T", " ").replace(/\.\d+Z$/, " UTC");
  const cards = [
    ["Files", summary.files, `${summary.clean} clean`],
    ["Errors", summary.errors, `${summary.warnings} warning(s)`],
    ["Widgets", summary.widgets, `${summary.widgetsWithDebt} with gaps`],
    ["First try", report.metrics ? `${(report.metrics.north * 100).toFixed(0)}%` : "—", report.metrics ? `${report.metrics.firstTry}/${report.metrics.generations} generations` : "no log"],
  ]
    .map(
      ([label, value, detail]) => `<div class="card"><span class="card-label">${esc(label)}</span><strong class="card-value">${esc(value)}</strong><span class="card-detail">${esc(detail)}</span></div>`,
    )
    .join("");

  const gateRows = report.gates
    .map((gate) => {
      const state = gate.skipped ? `skipped — ${gate.skipped}` : gate.exitCode ? "failed" : "clean";
      return `<tr><td><code>${esc(gate.name)}</code></td><td>${gate.exitCode ? '<span class="badge error">failed</span>' : '<span class="badge clean">clean</span>'}</td><td>${esc(state)}</td><td class="num">${gate.errors}</td><td class="num">${gate.warnings}</td><td class="num">${gate.review}</td></tr>`;
    })
    .join("");

  const fileRows = report.files
    .map((entry) => {
      const findings = entry.findings.length
        ? `<details><summary>${entry.findings.length} finding(s)</summary><ul class="findings">${entry.findings
            .map(
              (finding) =>
                `<li><code>${esc(finding.line)}${finding.column ? `:${finding.column}` : ""}</code> <code class="code">${esc(finding.code)}</code> ${esc(finding.message)}${finding.suggestion ? `<br><span class="fix">→ ${esc(finding.suggestion)}</span>` : ""}</li>`,
            )
            .join("")}</ul></details>`
        : "";
      return `<tr class="${esc(entry.verdict)}">
  <td><code>${esc(entry.file)}</code>${findings}</td>
  <td>${badge(entry.verdict)}</td>
  <td class="num">${entry.lines}</td>
  <td class="num">${entry.errors}/${entry.warnings}/${entry.review}</td>
  <td>${esc(entry.widgets.join(", ") || "—")}</td>
</tr>`;
    })
    .join("");

  const debtRows = report.widgets?.withDebt.length
    ? report.widgets.withDebt
        .map(
          (row) => `<tr>
  <td><strong>${esc(row.name)}</strong></td>
  <td class="num">${row.props}</td>
  <td>${esc(row.invented.join(" ") || "—")}</td>
  <td>${esc(row.dead.join(" ") || "—")}</td>
  <td>${esc(row.notDeclared.join(" ") || "—")}</td>
  <td>${esc(row.docOnly.join(" ") || "—")}</td>
</tr>`,
        )
        .join("")
    : "";

  const outsideBlock = report.outside.length
    ? `<section><h2>Outside the project</h2><p class="muted">These findings name the installed package, not your code — the framework's own debt.</p><ul class="findings">${report.outside
        .map((item) => `<li><code class="code">${esc(item.code)}</code> ${esc(item.message)}</li>`)
        .join("")}</ul></section>`
    : "";

  const metricsBlock = report.metrics
    ? `<section><h2>Recurring failures</h2>
<p>${report.metrics.firstTry}/${report.metrics.generations} generation(s) passed with no correction (${(report.metrics.north * 100).toFixed(0)}%), ${report.metrics.runs} run(s) logged.</p>
${
  report.metrics.top.length
    ? `<table><thead><tr><th>code</th><th class="num">times</th><th>rule</th></tr></thead><tbody>${report.metrics.top
        .map((row) => `<tr><td><code class="code">${esc(row.code)}</code></td><td class="num">${row.count}</td><td>${esc(row.rule || "— no rule owns this one yet")}</td></tr>`)
        .join("")}</tbody></table>`
    : ""
}</section>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
  :root {
    --bg: #f6f7fb; --surface: #ffffff; --text: #0f172a; --muted: #526077;
    --border: #e2e8f0; --accent: #4f46e5; --accent-soft: #eef2ff;
    --error: #b91c1c; --error-soft: #fee2e2;
    --warn: #92400e; --warn-soft: #fef3c7;
    --ok: #166534; --ok-soft: #dcfce7;
    --radius: 12px;
    --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; background: var(--bg); color: var(--text);
    font: 16px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }
  main { max-width: 1080px; margin: 0 auto; padding: 32px 20px 64px; }
  header { margin-bottom: 24px; }
  h1 { margin: 0 0 4px; font-size: 28px; line-height: 1.2; letter-spacing: -0.01em; }
  .sub { color: var(--muted); font-size: 14px; }
  .verdict { display: inline-flex; align-items: center; gap: 8px; margin-top: 12px; padding: 6px 12px; border-radius: 999px; font-weight: 600; font-size: 14px; }
  .verdict.ok { background: var(--ok-soft); color: var(--ok); }
  .verdict.bad { background: var(--error-soft); color: var(--error); }
  .cards { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin: 20px 0 28px; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; }
  .card-label { display: block; color: var(--muted); font-size: 13px; text-transform: uppercase; letter-spacing: .04em; }
  .card-value { display: block; font-size: 28px; line-height: 1.2; margin: 4px 0 2px; }
  .card-detail { color: var(--muted); font-size: 13px; }
  section, .panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; margin-bottom: 20px; }
  h2 { margin: 0 0 12px; font-size: 18px; }
  p { margin: 8px 0; }
  .muted { color: var(--muted); font-size: 14px; }
  code { font-family: var(--mono); font-size: 13px; background: var(--accent-soft); border-radius: 6px; padding: 1px 5px; }
  .code { color: var(--accent); background: transparent; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { text-align: left; vertical-align: top; padding: 8px; border-bottom: 1px solid var(--border); }
  th { color: var(--muted); font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
  tr:last-child td { border-bottom: 0; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  .badge.error { background: var(--error-soft); color: var(--error); }
  .badge.warn { background: var(--warn-soft); color: var(--warn); }
  .badge.review { background: var(--accent-soft); color: var(--accent); }
  .badge.clean { background: var(--ok-soft); color: var(--ok); }
  ol.next { list-style: none; margin: 0; padding: 0; }
  .next-item { border-left: 3px solid var(--border); padding: 10px 0 10px 14px; margin-bottom: 10px; }
  .next-item.error { border-color: var(--error); }
  .next-item.warn { border-color: #d97706; }
  .next-item.info { border-color: var(--accent); }
  .next-head { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
  .fix { color: var(--muted); font-size: 14px; }
  .rule { color: var(--muted); font-size: 13px; font-style: italic; }
  .empty { color: var(--ok); font-weight: 600; }
  details { margin-top: 6px; }
  summary { cursor: pointer; color: var(--accent); font-size: 13px; }
  .findings { margin: 8px 0 0; padding-left: 18px; }
  .findings li { margin-bottom: 6px; font-size: 13px; }
  footer { color: var(--muted); font-size: 13px; text-align: center; margin-top: 8px; }
  @media (max-width: 760px) {
    .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    main { padding: 20px 14px 48px; }
    table { font-size: 13px; }
  }
  @media print {
    body { background: #fff; }
    section, .panel { break-inside: avoid; }
  }
</style>
</head>
<body>
<main>
  <header>
    <h1>${esc(title)}</h1>
    <div class="sub">flet-box@${esc(report.package)} · ${esc(createdAt)} · read-only diagnosis · ${report.next.length} finding(s)</div>
    <div class="verdict ${report.ok ? "ok" : "bad"}">${report.ok ? "No errors" : `${summary.errors} error(s), ${summary.warnings} warning(s)`}</div>
  </header>

  <div class="cards">${cards}</div>

  <section>
    <h2>Gates</h2>
    <table>
      <thead><tr><th>gate</th><th>result</th><th>detail</th><th class="num">errors</th><th class="num">warnings</th><th class="num">review</th></tr></thead>
      <tbody>${gateRows}</tbody>
    </table>
  </section>

  <section>
    <h2>Next${report.next.length > NEXT_LIMIT ? ` (first ${NEXT_LIMIT} of ${report.next.length})` : ""}</h2>
    <ol class="next">${report.next
      .slice(0, NEXT_LIMIT)
      .map((item) => {
        const at = item.file
          ? `<code>${esc(item.file)}:${item.line}${item.column ? `:${item.column}` : ""}</code>`
          : `<code>${esc(item.gate)}</code>`;
        return `<li class="next-item ${esc(item.severity)}">
  <div class="next-head">${badge(item.severity)} ${at} <code class="code">${esc(item.code)}</code></div>
  <p>${esc(item.message)}</p>
  ${item.fix ? `<p class="fix">→ ${esc(item.fix)}</p>` : ""}
  ${item.rule ? `<p class="rule">rule: ${esc(item.rule)}</p>` : ""}
</li>`;
      })
      .join("")}</ol>
    ${report.next.length > NEXT_LIMIT ? `<p class="muted">… ${report.next.length - NEXT_LIMIT} more in <code>flet-box report --json</code>.</p>` : ""}
  </section>

  <section>
    <h2>Files (${summary.files})</h2>
    <p class="muted">Verdict per file · errors / warnings / review · widgets imported from the package.</p>
    <table>
      <thead><tr><th>file</th><th>verdict</th><th class="num">lines</th><th class="num">E / W / R</th><th>widgets</th></tr></thead>
      <tbody>${fileRows}</tbody>
    </table>
  </section>

  ${
    debtRows
      ? `<section>
    <h2>Widget contract gaps (${report.widgets.withDebt.length}/${report.widgets.total})</h2>
    <p class="muted">“invented” is read but declared nowhere · “dead” is declared but read by nothing · “not in .d.ts” is a real prop the declaration forgets.</p>
    <table>
      <thead><tr><th>widget</th><th class="num">props</th><th>invented</th><th>dead</th><th>not in .d.ts</th><th>doc-only</th></tr></thead>
      <tbody>${debtRows}</tbody>
    </table>
  </section>`
      : ""
  }

  ${outsideBlock}
  ${metricsBlock}
  ${report.notes.length ? `<section><h2>Notes</h2><ul>${report.notes.map((note) => `<li>${esc(note)}</li>`).join("")}</ul></section>` : ""}

  <footer>
    Generated by <code>flet-box report</code> on ${esc(createdAt)}. This file changes nothing;
    re-run the command after the next edit.
  </footer>
</main>
</body>
</html>
`;
};

/* -------------------------------------------------------------------- run */

/**
 * `flet-box report [--json | --md | --html] [--out <file>] [--tests] [--root <dir>]`
 *
 * @param {string[]} argv
 * @param {{print?: (line: string) => void, root?: string}} [io]
 * @returns {Promise<{exitCode: number, report: object}>}
 */
export const report = async(argv = [], io = {}) => {
  const print = io.print ?? ((line) => console.log(line));
  const rootIndex = argv.indexOf("--root");
  const root = path.resolve(
    rootIndex >= 0 && argv[rootIndex + 1] ? argv[rootIndex + 1] : io.root || process.cwd(),
  );

  const built = await buildReport({
    root,
    tests: argv.includes("--tests"),
    print: argv.includes("--tests") ? print : undefined,
  });
  const exitCode = built.ok ? 0 : 1;

  if (argv.includes("--json")) {
    print(JSON.stringify(built, null, 2));
    return { exitCode, report: built };
  }
  if (argv.includes("--md")) {
    print(renderMarkdown(built));
    return { exitCode, report: built };
  }
  if (argv.includes("--html")) {
    const outIndex = argv.indexOf("--out");
    const target = path.resolve(
      root,
      outIndex >= 0 && argv[outIndex + 1]
        ? argv[outIndex + 1]
        : path.join(".fletbox", "reports", "report.html"),
    );
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, renderHtml(built), "utf8");
    for (const line of renderText(built)) print(line);
    print("");
    print(c("gray", `   page → ${path.relative(root, target) || target}`));
    return { exitCode, report: built };
  }

  for (const line of renderText(built)) print(line);
  return { exitCode, report: built };
};

export default report;
