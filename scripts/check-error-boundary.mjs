#!/usr/bin/env node
/**
 * @file check-error-boundary.mjs
 * @description
 * Contract for the error boundary (`src/utils/errorBoundary.js`).
 *
 * The boundary is the wall that keeps one broken widget from taking the whole
 * screen with it. It is easy to add and easy to lose: a refactor that moves a
 * `try` block, renames a helper or drops a `catch` leaves the framework
 * looking fine and the app blank again — a white page with a red line in the
 * console and nothing on screen to say where it went.
 *
 * The browser harness (`tests/errorboundary.html`) proves the boundary *works*,
 * but that harness is optional: `npm run test:browser` skips when puppeteer or
 * Chrome is missing, so it cannot be the thing that keeps the wall standing.
 * This script is the gate that runs everywhere, and every rule here is proven
 * twice — once by breaking it in a copy of the source, once by obeying it on
 * the real source. A detector that always reports is as useless as one that
 * never does.
 *
 * The rules:
 *
 *   1. `NO_GLOBAL_HANDLER` — the errors no widget owns (a rejected promise, a
 *      timer that exploded) are reported by two window listeners.
 *   2. `BOUNDARY_NOT_INSTALLED` — the engine installs that handler once, from
 *      the one step every widget passes through.
 *   3. `BUILD_UNGUARDED` — a throw while a widget is built paints a
 *      placeholder instead of escaping the factory.
 *   4. `UPDATE_UNGUARDED` — a throw while a widget updates is caught and
 *      reported with the widget's name.
 *   5. `UPDATE_DROPS_CONTENT` — a failed update keeps the content the widget
 *      had: stale is not the same as empty.
 *   6. `APP_UNGUARDED` — a throw in the component body paints the root.
 *   7. `HANDLER_UNGUARDED` — a throw inside an `onPress` is reported with the
 *      name of the widget that owns it.
 *   8. `MARKUP_BY_HAND` — the placeholder is built with the DOM, not with
 *      markup pasted into it.
 *   9. `PLACEHOLDER_HARDCODED` — the placeholder paints with theme tokens.
 *  10. `PLACEHOLDER_UNSCALED` — its lengths are framework units, so the note
 *      grows with the reader's font like the rest of the page.
 *  11. `PLACEHOLDER_UNANNOUNCED` — it is announced (`role="alert"`): a broken
 *      widget is still information the person needs.
 *  12. `HAND_WRITTEN_MARKER` — the failure marker is the exported constant,
 *      so one failure is one marked element.
 *  13. `NOT_IMPORTABLE` — the module still imports in Node, because the
 *      package has to be importable outside a browser.
 *
 * Usage:
 *   node scripts/check-error-boundary.mjs
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");

const FILE_BOUNDARY = "src/utils/errorBoundary.js";
const FILE_CREATE = "src/widget-factory/createWidget.js";
const FILE_FACTORY = "src/widget-factory/widgetFactory.js";
const FILE_ASSIGN = "src/widget-factory/assignProps.js";
const FILE_RUNAPP = "src/core/runApp.js";

const WATCHED = [
  FILE_BOUNDARY,
  FILE_CREATE,
  FILE_FACTORY,
  FILE_ASSIGN,
  FILE_RUNAPP,
];

/**
 * Strip comments so a documented bug never reads like a live one.
 *
 * @param {string} src
 * @returns {string}
 */
const withoutComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + " ".repeat(m.length - p1.length));

/**
 * Read the watched files and strip their comments.
 *
 * @returns {Map<string, string>} path relative to the repo → source
 */
const loadSources = () => {
  const files = new Map();
  for (const file of WATCHED) {
    const full = path.join(root, file);
    files.set(file, withoutComments(fs.readFileSync(full, "utf8")));
  }
  return files;
};

// ---------------------------------------------------------------------------
// The rules. Each one answers: does this shape of source break the boundary?
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Rule
 * @property {string} code - The code a finding carries.
 * @property {string} title - What the rule is, in one line.
 * @property {(files: Map<string, string>) => string[]} check - The broken shapes
 *   it recognises; an empty array means the shape is sound.
 */

/** @type {Rule[]} */
const RULES = [
  {
    code: "NO_GLOBAL_HANDLER",
    title: "the two window listeners exist",
    check: (files) => {
      const src = files.get(FILE_BOUNDARY) || "";
      const out = [];
      if (!/window\.addEventListener\(\s*["']error["']/.test(src)) {
        out.push("no `error` listener: a throw that reaches the window is never reported.");
      }
      if (!/window\.addEventListener\(\s*["']unhandledrejection["']/.test(src)) {
        out.push("no `unhandledrejection` listener: a rejected promise is never reported.");
      }
      return out;
    },
  },
  {
    code: "BOUNDARY_NOT_INSTALLED",
    title: "the engine installs the boundary",
    check: (files) => {
      const src = files.get(FILE_CREATE) || "";
      if (!/installErrorBoundary\(\s*\)/.test(src)) {
        return [
          "createWidget never calls installErrorBoundary(): the global handler is never installed.",
        ];
      }
      return [];
    },
  },
  {
    code: "BUILD_UNGUARDED",
    title: "a throw while building a widget is caught",
    check: (files) => {
      const src = files.get(FILE_FACTORY) || "";
      if (!/catch\s*\(\s*error\s*\)\s*\{[\s\S]{0,400}?renderFailure\(/.test(src)) {
        return [
          "no catch around the build that paints the placeholder: a throw in a widget escapes the factory and blanks the screen.",
        ];
      }
      return [];
    },
  },
  {
    code: "UPDATE_UNGUARDED",
    title: "a throw while updating a widget is caught",
    check: (files) => {
      const src = files.get(FILE_FACTORY) || "";
      const out = [];
      if (!/catch\s*\(\s*error\s*\)\s*\{[\s\S]{0,600}?reportFailure\(/.test(src)) {
        out.push(
          "no catch around the update that reports the failure: a throw in an update escapes the factory.",
        );
      }
      if (!/phase:\s*["']update["']/.test(src)) {
        out.push('the update failure is not reported with the phase "update".');
      }
      return out;
    },
  },
  {
    code: "UPDATE_DROPS_CONTENT",
    title: "a failed update keeps the content the widget had",
    check: (files) => {
      const src = files.get(FILE_FACTORY) || "";
      const out = [];
      if (!/takePropChildren\(\s*widget\s*\)/.test(src)) {
        out.push(
          "the update does not take the old content out with takePropChildren(): it cannot put it back.",
        );
      }
      if (
        !/catch\s*\(\s*error\s*\)\s*\{[\s\S]{0,300}?addChildren\(\s*widget\s*,\s*previous\s*\)/.test(
          src,
        )
      ) {
        out.push(
          "a failed update does not restore the previous content: the widget is left empty, which is the blank screen this boundary exists to prevent.",
        );
      }
      return out;
    },
  },
  {
    code: "APP_UNGUARDED",
    title: "a throw in the component body paints the root",
    check: (files) => {
      const src = files.get(FILE_RUNAPP) || "";
      const out = [];
      if (!/catch\s*\(\s*error\s*\)/.test(src)) {
        out.push("the component call is not wrapped in a try/catch.");
      }
      if (!/renderFailure\(\s*root\s*,\s*failure\s*,/.test(src)) {
        out.push("a failed render does not paint the root: the screen stays empty.");
      }
      if (!/phase:\s*["']app["']/.test(src)) {
        out.push('the app failure is not reported with the phase "app".');
      }
      return out;
    },
  },
  {
    code: "HANDLER_UNGUARDED",
    title: "every handler is attached through the guard",
    check: (files) => {
      const src = files.get(FILE_ASSIGN) || "";
      const out = [];
      const guards = (src.match(/guardHandler\(/g) || []).length;
      if (guards < 2) {
        out.push(
          `only ${guards} attach path(s) go through guardHandler(): the events block and the flat "on*" block each need one.`,
        );
      }
      if (/addEventListener\(\s*\w+\s*,\s*handler\s*\)/.test(src)) {
        out.push("a raw handler is attached to a listener.");
      }
      if (/onclick\s*=\s*handler\b/.test(src)) {
        out.push("a raw handler is assigned to onclick.");
      }
      return out;
    },
  },
  {
    code: "MARKUP_BY_HAND",
    title: "the placeholder is built with the DOM",
    check: (files) => {
      const src = files.get(FILE_BOUNDARY) || "";
      if (/innerHTML/.test(src)) {
        return [
          "the placeholder writes innerHTML: the failure message would be pasted in as markup instead of spoken as text.",
        ];
      }
      return [];
    },
  },
  {
    code: "PLACEHOLDER_HARDCODED",
    title: "the placeholder paints with theme tokens",
    check: (files) => {
      const src = files.get(FILE_BOUNDARY) || "";
      const out = [];
      if (/#[0-9a-fA-F]{3,8}\b/.test(src)) {
        out.push("the placeholder carries a hex literal: it will not follow the theme it is painted in.");
      }
      if (!/var\(--color-errorBg/.test(src)) {
        out.push("the placeholder does not paint its surface with the error token.");
      }
      if (!/var\(--color-text/.test(src)) {
        out.push("the placeholder does not paint its ink with the text token.");
      }
      return out;
    },
  },
  {
    code: "PLACEHOLDER_UNSCALED",
    title: "the placeholder speaks in framework units",
    check: (files) => {
      const src = files.get(FILE_BOUNDARY) || "";
      const match = src.match(/PLACEHOLDER_CSS\s*=\s*`([\s\S]*?)`/);
      if (!match) {
        return ["the placeholder styles are gone: PLACEHOLDER_CSS is not defined."];
      }
      const out = [];
      match[1].split("\n").forEach((line, index) => {
        // The hairline border stays a pixel: it is a visibility constant, not a
        // length the layout scales — a rem would shrink it out of sight.
        if (/\d+px/.test(line) && !/border\s*:/.test(line)) {
          out.push(
            `the placeholder writes "${line.trim()}" as a pixel: every other length is a framework unit (toREM).`,
          );
        }
      });
      return out;
    },
  },
  {
    code: "PLACEHOLDER_UNANNOUNCED",
    title: "the placeholder is announced",
    check: (files) => {
      const src = files.get(FILE_BOUNDARY) || "";
      if (!/setAttribute\(\s*["']role["']\s*,\s*["']alert["']\s*\)/.test(src)) {
        return [
          'the placeholder is not announced: it has no role="alert", so a broken widget is a silent hole.',
        ];
      }
      return [];
    },
  },
  {
    code: "HAND_WRITTEN_MARKER",
    title: "the failure marker is the exported constant",
    check: (files) => {
      const src = files.get(FILE_BOUNDARY) || "";
      const out = [];
      if (!/FAILURE_ATTR\s*=\s*["']data-fb-error["']/.test(src)) {
        out.push("the marker name is not the exported constant.");
      }
      if (/setAttribute\(\s*["']data-fb-error/.test(src)) {
        out.push("the marker is written by hand: it can drift from the constant the harness looks for.");
      }
      if (!/setAttribute\(\s*FAILURE_ATTR\s*,/.test(src)) {
        out.push("the marker is never written: a failed widget is not marked.");
      }
      return out;
    },
  },
];

/**
 * Run every rule over a set of sources.
 *
 * @param {Map<string, string>} files
 * @returns {{code: string, file: string, message: string}[]}
 */
const scan = (files) => {
  const findings = [];
  for (const rule of RULES) {
    for (const message of rule.check(files)) {
      findings.push({ code: rule.code, file: rule.file || "", message });
    }
  }
  return findings;
};

/**
 * Copy the sources and break one thing in the copy.
 *
 * @param {Map<string, string>} files
 * @param {string} file
 * @param {string} from
 * @param {string} to
 * @returns {Map<string, string>}
 */
const mutate = (files, file, from, to) => {
  const src = files.get(file);
  if (src === undefined) throw new Error(`mutation target ${file} is gone`);
  if (!src.includes(from)) {
    throw new Error(`mutation target is gone in ${file}: ${JSON.stringify(from)}`);
  }
  const next = new Map(files);
  next.set(file, src.replace(from, to));
  return next;
};

// ---------------------------------------------------------------------------
// The runs.
// ---------------------------------------------------------------------------

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

const sources = loadSources();

/**
 * @param {object[]} findings
 * @param {string} code
 * @returns {object|undefined}
 */
const hit = (findings, code) => findings.find((item) => item.code === code);

await check("the real framework passes every rule", () => {
  const findings = scan(sources);
  assertClean(findings);
});

/**
 * @param {object[]} findings
 */
function assertClean(findings) {
  if (!findings.length) return;
  const detail = findings.map((f) => `${f.code}: ${f.message}`).join(" | ");
  throw new Error(detail);
}

// 1 — the two window listeners.

await check("NO_GLOBAL_HANDLER bites", () => {
  const broken = mutate(
    sources,
    FILE_BOUNDARY,
    '  window.addEventListener("error", onError);\n',
    "",
  );
  assertClean(scan(broken).filter((f) => f.code !== "NO_GLOBAL_HANDLER"));
  const found = hit(scan(broken), "NO_GLOBAL_HANDLER");
  if (!found) throw new Error("removing the `error` listener was accepted");
});

// 2 — the engine installs the boundary.

await check("BOUNDARY_NOT_INSTALLED bites", () => {
  const broken = mutate(sources, FILE_CREATE, "  installErrorBoundary();\n", "");
  const found = hit(scan(broken), "BOUNDARY_NOT_INSTALLED");
  if (!found) throw new Error("an engine that never installs the boundary was accepted");
});

// 3 — a throw while building.

await check("BUILD_UNGUARDED bites", () => {
  const broken = mutate(
    sources,
    FILE_FACTORY,
    '    renderFailure(widget, error, { widgetName, phase: "render" });',
    "    throw error;",
  );
  const found = hit(scan(broken), "BUILD_UNGUARDED");
  if (!found) throw new Error("an unguarded build was accepted");
});

// 4 — a throw while updating.

await check("UPDATE_UNGUARDED bites", () => {
  const broken = mutate(
    sources,
    FILE_FACTORY,
    '      const failure = reportFailure(error, { widgetName, phase: "update" });',
    '      const failure = { message: String(error) };',
  );
  const found = hit(scan(broken), "UPDATE_UNGUARDED");
  if (!found) throw new Error("an unguarded update was accepted");
});

// 5 — a failed update keeps its content.

await check("UPDATE_DROPS_CONTENT bites", () => {
  const broken = mutate(
    sources,
    FILE_FACTORY,
    "          addChildren(widget, previous);\n",
    "",
  );
  const found = hit(scan(broken), "UPDATE_DROPS_CONTENT");
  if (!found) throw new Error("an update that drops its content was accepted");
});

// 6 — a throw in the component body.

await check("APP_UNGUARDED bites", () => {
  const broken = mutate(
    sources,
    FILE_RUNAPP,
    '    if (failure) {\n      renderFailure(root, failure, { widgetName: "App", phase: "app" });\n      return;\n    }\n',
    "",
  );
  const found = hit(scan(broken), "APP_UNGUARDED");
  if (!found) throw new Error("an app render that leaves the root empty was accepted");
});

// 7 — a throwing handler.

await check("HANDLER_UNGUARDED bites", () => {
  const broken = mutate(
    sources,
    FILE_ASSIGN,
    "const guarded = guardHandler(handler, {\n          widgetName: widget._widgetName,\n          event,\n        });",
    "const guarded = handler;",
  );
  const found = hit(scan(broken), "HANDLER_UNGUARDED");
  if (!found) throw new Error("a raw handler was accepted");
});

// 8 — markup written by hand.

await check("MARKUP_BY_HAND bites", () => {
  const broken = mutate(
    sources,
    FILE_BOUNDARY,
    "detail.textContent = failure.message;",
    "detail.innerHTML = failure.message;",
  );
  const found = hit(scan(broken), "MARKUP_BY_HAND");
  if (!found) throw new Error("a placeholder that writes markup was accepted");
});

// 9 — a hard-coded colour.

await check("PLACEHOLDER_HARDCODED bites", () => {
  const broken = mutate(
    sources,
    FILE_BOUNDARY,
    "background: var(--color-errorBg, ${colors.errorBg});",
    "background: #fef2f2;",
  );
  const found = hit(scan(broken), "PLACEHOLDER_HARDCODED");
  if (!found) throw new Error("a hard-coded colour was accepted");
});

// 10 — a length that is not a framework unit.

await check("PLACEHOLDER_UNSCALED bites", () => {
  const broken = mutate(
    sources,
    FILE_BOUNDARY,
    "gap: ${toREM(4)};",
    "gap: 4px;",
  );
  const found = hit(scan(broken), "PLACEHOLDER_UNSCALED");
  if (!found) throw new Error("a pixel length in the placeholder was accepted");
});

// 11 — the placeholder is announced.

await check("PLACEHOLDER_UNANNOUNCED bites", () => {
  const broken = mutate(
    sources,
    FILE_BOUNDARY,
    'box.setAttribute("role", "alert");',
    'box.setAttribute("role", "note");',
  );
  const found = hit(scan(broken), "PLACEHOLDER_UNANNOUNCED");
  if (!found) throw new Error("a silent placeholder was accepted");
});

// 12 — the marker written by hand.

await check("HAND_WRITTEN_MARKER bites", () => {
  const broken = mutate(
    sources,
    FILE_BOUNDARY,
    "host.setAttribute(FAILURE_ATTR, phase);",
    'host.setAttribute("data-fb-error", phase);',
  );
  const found = hit(scan(broken), "HAND_WRITTEN_MARKER");
  if (!found) throw new Error("a hand-written marker was accepted");
});

// 13 — the module still imports in Node.

await check("NOT_IMPORTABLE bites", async () => {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "fletbox-boundary-"));
  try {
    // The mutation: a copy of the real module that touches `document` while it
    // loads. The relative imports are rewritten to absolute URLs so the copy
    // fails for the reason it was written to fail, and not because a sibling
    // module is missing.
    const source = fs
      .readFileSync(path.join(root, FILE_BOUNDARY), "utf8")
      .replace(
        /from\s+"\.\/([\w.-]+\.js)"/g,
        (_, name) =>
          `from "${pathToFileURL(path.join(root, "src/utils", name)).href}"`,
      )
      .replace(
        'export const FAILURE_ATTR = "data-fb-error";',
        'export const FAILURE_ATTR = "data-fb-error";\n\ndocument.createElement("div");',
      );
    const file = path.join(scratch, "errorBoundary.mjs");
    fs.writeFileSync(file, source, "utf8");

    let threw = false;
    try {
      await import(pathToFileURL(file).href);
    } catch {
      threw = true;
    }
    if (!threw) {
      throw new Error("a module that touches `document` while loading imported cleanly");
    }
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true });
  }
});

await check("the module imports in Node", async () => {
  const module = await import(pathToFileURL(path.join(root, FILE_BOUNDARY)).href);
  for (const name of [
    "FAILURE_ATTR",
    "reportFailure",
    "getLastFailure",
    "paintFailure",
    "renderFailure",
    "clearFailure",
    "guardHandler",
    "installErrorBoundary",
  ]) {
    if (typeof module[name] !== "function" && typeof module[name] !== "string") {
      throw new Error(`${name} is not exported`);
    }
  }
});

console.log(
  failures.length
    ? `\n❌ ${failures.length} error-boundary contract failure(s): ${failures.join(", ")}\n`
    : "\n✅ The boundary holds, and every rule bites when it is broken.\n",
);
process.exit(failures.length ? 1 : 0);
