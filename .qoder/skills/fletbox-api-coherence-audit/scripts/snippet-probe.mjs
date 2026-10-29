/**
 * @file snippet-probe.mjs
 * Executes every snippet body of the library in a real Chrome and reports the
 * failures. Run it twice: once strict (the example-local names resolve to
 * `undefined`, as in unfinished app code) and once seeded (they resolve to real
 * data, and leftover callbacks to no-op functions, so only data-shape defects
 * survive). The difference between the two passes is the signal:
 *
 *   - dropped by the seeded pass      -> example style, not a defect
 *   - failing in both passes          -> real API defect worth reporting
 *
 * A single strict pass over-reports (it flagged 22 of 444 statements; seeded it
 * was 5), so never conclude from one pass alone.
 *
 * Usage:
 *   node snippet-probe.mjs                 # both passes, prints the diff
 *   node snippet-probe.mjs --strict        # one pass only
 *   node snippet-probe.mjs --full          # list every failing body
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { requireBrowserDeps, withTimeout } from "./lib.mjs";

const argv = process.argv.slice(2);
const onlyStrict = argv.includes("--strict");
const showFull = argv.includes("--full");

const { root, base, browser, close } = await requireBrowserDeps();
const aggregate = JSON.parse(
  readFileSync(join(root, "tools", "snippets-creator-flet-box", "FletBox.json"), "utf8")
);

const snippets = Object.entries(aggregate)
  .map(([key, v]) => ({ key, body: (v.body || []).join("\n") }))
  .filter((s) => {
    try {
      new Function(s.body);
      return true;
    } catch {
      return false; // prop fragments are not executable statements
    }
  });

const page = await browser.newPage();
await page.goto(`${base}/__probe__`, { waitUntil: "domcontentloaded" });

const seed = {
  data: "LIST", users: "LIST", products: "LIST", gallery: "LIST", images: "LIST",
  items: "LIST", rows: "LIST", userList: "LIST", apiData: "LIST", notes: "LIST",
  node: "LABEL", nodes: "TREE", treeData: "TREE", tree: "TREE",
  text: "# Title\n\n- one\n- two", mdSource: "# Title\n\n- one\n- two",
  markdownText: "# Title\n\n- one", content: "hello",
  code: "const a = 1;", jsCode: "const a = 1;", source: "const a = 1;",
  columns: [{ key: "id", label: "ID" }, { name: "ID" }],
  padding: "FN_PX", margin: "FN_PX",
};

const installRunner = (seedSpec, stubUnknown) =>
  page.evaluate(async (spec) => {
    window.__api = await import("/src/index.js");
    window.__log = [];
    for (const kind of ["warn", "error"]) {
      const orig = console[kind].bind(console);
      console[kind] = (...a) => {
        window.__log.push(`${kind}: ${String(a.join(" ")).slice(0, 180)}`);
        orig(...a);
      };
    }
    // Timers and network calls must not outlive the statement that made them.
    window.setInterval = () => 0;
    window.fetch = () => Promise.resolve({ ok: false, json: () => Promise.resolve({}), text: () => Promise.resolve("") });

    const label = (s) => ({ toString: () => s, valueOf: () => s });
    const list = [
      { id: 1, name: "Ada", label: "Ada", title: "Notes", text: "hello", url: "/a.png", src: "/a.png", status: "open", age: 36, userId: 7, value: 3 },
      { id: 2, name: "Linus", label: "Linus", title: "Ideas", text: "world", url: "/b.png", src: "/b.png", status: "done", age: 24, userId: 8, value: 5 },
    ];
    const tree = [{ id: 1, label: "src", children: [{ id: 2, label: "index.js" }] }];
    const pre = {};
    for (const [k, v] of Object.entries(spec.seedSpec)) {
      pre[k] = v === "LIST" ? list : v === "TREE" ? tree : v === "LABEL" ? label(k) : v === "FN_PX" ? (x) => `${x}px` : v;
    }

    window.__run = (body) => {
      const before = window.__log.length;
      const scope = new Proxy(pre, {
        has: () => true, // every bare identifier resolves, so `with` never throws ReferenceError
        get: (t, k) => {
          if (k in t) return t[k];
          if (k in window.__api) return window.__api[k];
          if (k in globalThis) return globalThis[k];
          // Strict: unknown names are `undefined`, as in real app code that forgot them.
          // Seeded: they become no-op functions, so example-local callbacks (`loadMore`,
          // `Header`) never throw and only data-shape defects survive.
          return spec.unknownToStub ? () => undefined : undefined;
        },
      });
      let error = null;
      try {
        new Function("scope", `with (scope) {\n${body}\n}`)(scope);
      } catch (e) {
        error = `${e.name}: ${String(e.message).slice(0, 130)}`;
      }
      const messages = window.__log.slice(before);
      document.body.innerHTML = ""; // widgets mount overlays; never leak them between bodies
      window.__log.length = before;
      return { error, messages };
    };
  }, { seedSpec, unknownToStub: stubUnknown });

const runPass = async (label) => {
  await installRunner(label === "seeded" ? seed : {}, label === "seeded");
  const failures = [];
  const BATCH = 25;
  for (let i = 0; i < snippets.length; i += BATCH) {
    const batch = snippets.slice(i, i + BATCH);
    const out = await withTimeout(
      page.evaluate((list) => list.map((s) => [s.key, window.__run(s.body)]), batch),
      60000,
      `batch ${i / BATCH}`
    ).catch(() => batch.map((s) => [s.key, { error: "timeout / infinite loop", messages: [] }]));
    for (const [key, r] of out) if (r.error || r.messages.length) failures.push([key, r]);
  }
  console.log(`${label} pass: ${failures.length} of ${snippets.length} executable bodies failed/warned`);
  return failures;
};

const strictFailures = await runPass("strict");
let seededFailures = [];
if (!onlyStrict) seededFailures = await runPass("seeded");

const report = (failures, heading) => {
  console.log(`\n=== ${failures.length} ${heading}`);
  for (const [key, r] of failures) {
    console.log(`\n· ${key}`);
    if (r.error) console.log(`    ERROR  ${r.error}`);
    for (const m of r.messages) console.log(`    ${m}`);
    if (showFull) console.log(`    BODY ${aggregate[key].body.join("\n").slice(0, 400)}`);
  }
};

if (onlyStrict) {
  report(strictFailures, "strict-pass failures");
  console.log("\nOne pass over-reports: re-run without --strict to separate real defects from example style.");
} else {
  const seededKeys = new Set(seededFailures.map(([k]) => k));
  report(seededFailures, "still broken when the placeholders are seeded -> report these");
  const styleOnly = strictFailures.filter(([k]) => !seededKeys.has(k));
  console.log(`\n=== ${styleOnly.length} artifacts of the strict stub (seeded data makes them pass) -> example style, not a defect`);
  for (const [key] of styleOnly) console.log(`  · ${key}`);
  console.log(
    "\nBefore calling one of the failures above a bug in src/, check the signature in\n" +
      "src/index.d.ts: if the parameter is required, the snippet is wrong, not the widget."
  );
}

await close();
