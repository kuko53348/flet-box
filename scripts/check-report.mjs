// scripts/check-report.mjs
// Contract for the diagnosis toolkit: `flet-box report`, `flet-box tools` and
// `flet-box mcp`.
//
// The three pieces exist for one reason — an agent that does not know which
// checker answers its question. That only works if all three read the same
// catalogue and the same gates, so this file asserts the joins, not just the
// outputs:
//
//   • a report names EVERY source file, and every finding the gates produced
//     lands in a file row or in the "outside the project" bucket. A finding
//     that is dropped is a silence, and silence is the bug the whole toolkit
//     is for.
//   • the report writes nothing (tree hash before/after), while the metrics
//     log it reads stays byte-identical — `verify` appends a row, `report`
//     must not, or it changes the history it diagnoses.
//   • the catalogue and the MCP tool list are the same list, every entry names
//     a command the CLI really dispatches, and only the report can write
//     anything at all.
//   • the failure classes are controls, not claims: an invented prop, a value
//     off the scale and a type error must each come back with their file and
//     line. A clean file must come back clean, or "no findings" means nothing.
//   • the HTML page is one self-contained file and it escapes what it prints.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { buildReport, renderHtml, renderMarkdown, report } from "../bin/commands/report.js";
import { tools } from "../bin/commands/tools.js";
import { TOOLS, catalogJson } from "../bin/utils/toolkit.js";
import { handleRequest } from "../bin/mcp.js";

const framework = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "fletbox-report-"));

let failures = 0;
const check = async(label, fn) => {
  try {
    await fn();
    console.log(`✅ ${label}`);
  } catch (error) {
    failures += 1;
    console.log(`❌ ${label}\n     ${error.message}`);
  }
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const write = (root, rel, body) => {
  const target = path.join(root, rel);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, body, "utf8");
  return target;
};

/** A content hash of the fixture, node_modules excluded (it links the framework). */
const digest = (root) => {
  const hash = createHash("sha256");
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name === "node_modules") continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) {
        hash.update(path.relative(root, full));
        hash.update(fs.readFileSync(full));
      }
    }
  };
  walk(root);
  return hash.digest("hex");
};

const app = path.join(scratch, "app");
const jsconfig = `{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowJs": true,
    "checkJs": true,
    "strict": false,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.js"],
  "exclude": ["node_modules", "www", "dist"]
}`;

write(app, "package.json", JSON.stringify({ name: "report-probe", version: "1.0.0", type: "module" }));
write(app, "jsconfig.json", jsconfig);
write(app, "app.js", 'import { Text } from "flet-box";\nexport default () => Text({ text: "probe" });\n');
write(
  app,
  "src/clean.js",
  `import { Column, Container, Text } from "flet-box";

/** A clean screen: legal props on the scale. */
export const CleanScreen = () =>
  Column({
    gap: 16,
    children: [Container({ padding: 16, child: Text({ text: "Hola", size: 16 }) })],
  });
`,
);
write(
  app,
  "src/bad-prop.js",
  'import { Text } from "flet-box";\n\n/** Control: no widget has this prop. */\nexport const BadProp = () => Text({ text: "x", hoverColour: "red" });\n',
);
write(
  app,
  "src/bad-scale.js",
  'import { Container, Text } from "flet-box";\n\n/** Control: 13 is not on the spacing scale. */\nexport const BadScale = () => Container({ padding: 13, child: Text({ text: "x" }) });\n',
);
write(
  app,
  "src/bad-type.js",
  'import { Text } from "flet-box";\n\n/** Control: `text` is a string, not a number. */\nexport const BadType = () => Text({ text: 42 });\n',
);
write(
  app,
  "src/components/card.js",
  'import { Card, Text } from "flet-box";\n\nexport const CardRow = () => Card({ child: Text({ text: "card" }) });\n',
);
write(
  app,
  ".fletbox/metrics/generations.md",
  [
    "# Metrics",
    "",
    "| when | project | ok | gates | codes |",
    "| --- | --- | --- | --- | --- |",
    "| 2026-01-01T00:00:00.000Z | report-probe | ✗ | api | UNKNOWN_PROP |",
    "| 2026-01-01T00:00:01.000Z | report-probe | ✓ | — | — |",
    "",
  ].join("\n"),
);
fs.mkdirSync(path.join(app, "node_modules"), { recursive: true });
fs.symlinkSync(framework, path.join(app, "node_modules", "flet-box"), "dir");

const broken = path.join(scratch, "broken");
write(broken, "package.json", JSON.stringify({ name: "broken", type: "module" }));
write(broken, "src/broken.js", "export const broken = (1;\n");

try {
  /* ------------------------------------------------------------- the report */

  const built = await buildReport({ root: app });

  await check("the report names every source file, clean or not", () => {
    const names = built.files.map((entry) => entry.file).sort();
    assert(names.includes("app.js"), `app.js missing: ${names.join(", ")}`);
    assert(
      ["src/clean.js", "src/bad-prop.js", "src/bad-scale.js", "src/bad-type.js", "src/components/card.js"].every(
        (name) => names.includes(name),
      ),
      `a source file was not named: ${names.join(", ")}`,
    );
    assert(
      built.files.every((entry) => entry.lines > 0),
      "a file was listed with no line count — it was named, not read",
    );
    assert(
      built.files.find((entry) => entry.file === "src/components/card.js").widgets.join(",") === "Card,Text",
      "the per-file widget list is not read from the import clause",
    );
  });

  await check("each failure class is reported with its file and line", () => {
    const find = (code, file) =>
      built.next.find((item) => item.code === code && item.file === file) || null;
    assert(find("UNKNOWN_PROP", "src/bad-prop.js")?.line === 4, "the invented prop was not reported");
    assert(find("TYPE_ERROR", "src/bad-type.js")?.line === 4, "the type error was not reported");
    assert(find("OFF_SCALE_SPACING", "src/bad-scale.js")?.line === 4, "the off-scale value was not reported");
    const clean = built.files.find((entry) => entry.file === "src/clean.js");
    assert(clean.verdict === "clean" && clean.findings.length === 0, "a clean file came back dirty");
    assert(built.summary.errors >= 3, `expected at least 3 errors, saw ${built.summary.errors}`);
    assert(built.ok === false, "a report with errors said it was ok");
  });

  await check("every finding the gates produced lands somewhere", () => {
    const gateTotal = built.gates.reduce(
      (n, gate) => n + gate.errors + gate.warnings + gate.review,
      0,
    );
    const filed = built.files.reduce((n, entry) => n + entry.findings.length, 0);
    assert(
      gateTotal === filed + built.outside.length,
      `${gateTotal} finding(s) were reported, ${filed} filed and ${built.outside.length} outside — some were dropped`,
    );
    assert(
      built.next.every((item) => item.file || item.gate),
      "a next step with neither a file nor a gate cannot be acted on",
    );
    assert(built.next[0].severity === "error", "the next step is not the most severe one");
  });

  await check("a code with a rule carries it, and the report reads the metrics log", () => {
    const unknown = built.next.find((item) => item.code === "UNKNOWN_PROP");
    assert(unknown?.rule?.includes("R2"), `UNKNOWN_PROP lost its rule: ${unknown?.rule}`);
    assert(built.metrics, "the metrics log was not read");
    assert(built.metrics.runs === 2, `expected 2 logged run(s), saw ${built.metrics.runs}`);
  });

  await check("the report writes nothing — not even a metrics row", async() => {
    const before = digest(app);
    const again = await buildReport({ root: app });
    assert(again.summary.errors === built.summary.errors, "the second run disagreed with the first");
    assert(digest(app) === before, "the report changed a file under the project");
    const log = fs.readFileSync(path.join(app, ".fletbox/metrics/generations.md"), "utf8");
    assert(!log.includes("2026-11-"), "the report appended a row to the log it reads");
  });

  await check("a module that does not parse is named by line and column", async() => {
    const response = await handleRequest({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "syntax", arguments: { root: broken } },
    });
    const text = response.result.content[0].text;
    assert(/SYNTAX_ERROR/.test(text), `the parser finding is missing: ${text}`);
    assert(/src\/broken\.js:1:\d+/.test(text), `the parser finding has no line/column: ${text}`);
    assert(response.result.structuredContent.steps[0].exitCode === 1, "a broken module exited 0");
  });

  await check("--json is the same report as data, and exits 1 on an error", async() => {
    const lines = [];
    const result = await report(["--root", app, "--json"], { print: (line) => lines.push(line) });
    const data = JSON.parse(lines.join("\n"));
    assert(result.exitCode === 1, "a report with errors exited 0");
    assert(data.tool === "flet-box report" && data.readOnly === true, "the payload does not declare itself");
    assert(data.summary.files === built.summary.files, "the JSON and the built report disagree");
    assert(Array.isArray(data.next) && data.next.length === built.next.length, "the JSON lost next steps");
  });

  await check("Markdown carries the same next steps", () => {
    const md = renderMarkdown(built);
    assert(md.includes("## Next"), "the Markdown has no next section");
    assert(md.includes("src/bad-type.js:4"), "the Markdown dropped a finding");
    assert(md.includes("flet-box report --html"), "the Markdown does not say how to get the page");
  });

  await check("the HTML page is one file, with no script and no request", () => {
    const page = renderHtml(built);
    assert(page.startsWith("<!doctype html>"), "the page does not start with a doctype");
    assert(!/<script/i.test(page), "the page carries a script");
    assert(!/\b(?:src|href)\s*=\s*["']?https?:/i.test(page), "the page requests something over the network");
    assert(page.includes("<style>"), "the page has no inline stylesheet — it is not self-contained");
    assert(page.includes("src/bad-scale.js"), "the page dropped a file");
  });

  await check("the page escapes what it prints", () => {
    const hostile = structuredClone(built);
    hostile.notes = ['<script>alert("x")</script>'];
    const page = renderHtml(hostile);
    assert(!page.includes("<script>alert"), "an injected tag reached the page as markup");
    assert(page.includes("&lt;script&gt;alert"), "the injected tag was not escaped");
  });

  /* ----------------------------------------------------------- the catalogue */

  await check("the catalogue is unique, honest about writes, and dispatched", () => {
    const ids = TOOLS.map((tool) => tool.id);
    assert(new Set(ids).size === ids.length, `duplicate tool id: ${ids.join(", ")}`);
    assert(TOOLS.every((tool) => tool.question && tool.usage && Array.isArray(tool.when)), "an entry has no question, usage or when");
    const writers = TOOLS.filter((tool) => tool.writes.length).map((tool) => tool.id);
    assert(writers.join(",") === "report", `only the report may write, saw: ${writers.join(", ")}`);
    const cli = fs.readFileSync(path.join(framework, "bin", "cli.js"), "utf8");
    const dispatched = new Set([...cli.matchAll(/case "([^"]+)":/g)].map((match) => match[1]));
    for (const tool of TOOLS) {
      const first = tool.cli.replace(/^flet-box\s+/, "").split(/\s+/)[0];
      assert(dispatched.has(first), `${tool.id} names \`${first}\`, which the CLI does not dispatch`);
    }
    assert(catalogJson().readOnly === true, "the catalogue does not declare itself read-only");
  });

  await check("`tools --emit` writes the same catalogue it prints", async() => {
    const lines = [];
    await tools(["--root", app, "--emit"], { print: (line) => lines.push(line) });
    const file = path.join(app, ".fletbox", "api", "tools.json");
    assert(fs.existsSync(file), "--emit wrote no tools.json");
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    assert(data.tools.length === TOOLS.length, "tools.json lost an entry");
    assert(data.tools.map((tool) => tool.id).join() === TOOLS.map((tool) => tool.id).join(), "tools.json reordered");
    const withArgs = data.tools.filter((tool) => !Array.isArray(tool.params));
    assert(!withArgs.length, `tools.json dropped the arguments of: ${withArgs.map((tool) => tool.id).join(", ")}`);
    const props = data.tools.find((tool) => tool.id === "widget_props");
    assert(props.params.some((param) => param.name === "widget" && param.required), "widget_props lost its required argument");
  });

  /* ------------------------------------------------------------------ MCP */

  await check("MCP lists exactly the catalogue, and answers the handshake", async() => {
    const list = await handleRequest({ jsonrpc: "2.0", id: 1, method: "tools/list" });
    assert(
      list.result.tools.map((tool) => tool.name).join() === TOOLS.map((tool) => tool.id).join(),
      "the MCP surface and the catalogue disagree",
    );
    const init = await handleRequest({ jsonrpc: "2.0", id: 2, method: "initialize", params: {} });
    assert(init.result.capabilities.tools && init.result.serverInfo.name === "flet-box", "the handshake is incomplete");
    const unknown = await handleRequest({ jsonrpc: "2.0", id: 3, method: "nope" });
    assert(unknown.error.code === -32601, "an unknown method was accepted");
  });

  await check("MCP refuses a bad call without running anything", async() => {
    const unknown = await handleRequest({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "rm_rf", arguments: {} },
    });
    assert(unknown.error.code === -32602, "an unknown tool was accepted");
    const missing = await handleRequest({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: { name: "widget_props", arguments: {} },
    });
    assert(missing.result.isError === true, "a required argument was not required");
    const noWidget = await handleRequest({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: { name: "widget_props", arguments: { widget: "NotAWidget" } },
    });
    assert(noWidget.result.isError === true, "an invented widget name was answered as if it existed");
  });

  await check("MCP answers with the report and changes nothing", async() => {
    const before = digest(app);
    const response = await handleRequest({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "report", arguments: { root: app } },
    });
    assert(response.result.content[0].text.includes("FletBox report"), "the text does not look like a report");
    assert(response.result.structuredContent.summary.errors >= 3, "the structured payload lost the errors");
    assert(digest(app) === before, "an MCP tool wrote to the project");
  });

  await check("the stdio server answers every line, even when stdin closes behind it", () => {
    const requests = [
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "probe", version: "1" } },
      },
      { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "report", arguments: { root: app } } },
    ]
      .map((request) => JSON.stringify(request))
      .join("\n");
    // `report` is slow on purpose: a loop that exits on "close" drops exactly
    // this answer, which is what a piped probe (and a one-shot client) sees.
    const run = spawnSync(process.execPath, [path.join(framework, "bin", "cli.js"), "mcp"], {
      cwd: app,
      input: `${requests}\n`,
      encoding: "utf8",
      timeout: 120000,
    });
    const lines = run.stdout
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    assert(lines.length === 2, `the server dropped a response (${lines.length} of 2)`);
    assert(lines[1].id === 2, "the second answer is not the second request");
    assert(lines[1].result.content[0].text.includes("FletBox report"), "the second answer is empty");
  });
} finally {
  fs.rmSync(scratch, { recursive: true, force: true });
}

if (failures) {
  console.log(`\ncheck-report: ${failures} failed`);
  process.exit(1);
}
console.log("\ncheck-report: the report names the work, the catalogue is the map, MCP is the same map");
