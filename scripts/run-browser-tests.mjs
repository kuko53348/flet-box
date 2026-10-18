#!/usr/bin/env node
/**
 * @file run-browser-tests.mjs
 * @description
 * Runs the browser test harnesses in `tests/` headlessly and reports the result.
 *
 * The harnesses are the real behavioral suite of FletBox: they instantiate every
 * widget, assert the documented behavior on the live runtime and check the
 * widget-factory contract. They cannot be opened over `file://` (ESM + CORS), so
 * they need a server — and until now nothing ran them automatically.
 *
 * This script is intentionally OPTIONAL: FletBox has no runtime dependencies and
 * this must not add one. Puppeteer and a Chrome binary are resolved from the
 * environment and, when either is missing, the run is SKIPPED (exit 0) with a
 * clear message rather than failing the build.
 *
 * Resolution order for puppeteer:
 *   1. `$FLETBOX_PUPPETEER`  — absolute path to the puppeteer package
 *   2. `./node_modules/puppeteer`
 *   3. `../flet-box-server/node_modules/puppeteer`  (sibling checkout)
 *
 * Resolution order for the browser:
 *   1. `$FLETBOX_CHROME`     — absolute path to a Chrome/Chromium binary
 *   2. well-known system paths (macOS, Linux, Windows)
 *
 * Usage:
 *   node scripts/run-browser-tests.mjs            # run every harness
 *   node scripts/run-browser-tests.mjs --verbose  # forward page console output
 *   node scripts/run-browser-tests.mjs smoke      # run harnesses matching "smoke"
 */

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, extname, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const root = join(scriptDir, "..");

const args = process.argv.slice(2);
const verbose = args.includes("--verbose");
const filters = args.filter((a) => !a.startsWith("--"));

/** Each harness page plus the global it publishes when it finishes. */
const HARNESSES = [
  { page: "tests/smoke.html", global: "__SMOKE", label: "smoke (every widget instantiates)" },
  { page: "tests/regression.html", global: "__REGRESSION", label: "regression guards (audit fixes)" },
  { page: "tests/index.html", global: "__TESTS", label: "widget-factory contract" },
  { page: "tests/widget-contract.html", global: "__CONTRACT", label: "widget runtime contract" },
  { page: "tests/propscan.html", global: "__PROPSCAN", label: "prop contract (no unknown props)" },
  { page: "tests/doccheck-all.html", global: "__DOCCHECK", label: "documented behavior (ch. 3-7)" },
  { page: "tests/doccheck.html", global: "__DOCCHECK", label: "documented behavior (ch. 1-2)" },
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".map": "application/json; charset=utf-8",
};

/** Minimal static server rooted at the repo, so `/tests/x.html` resolves. */
const startServer = () =>
  new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
        const target = join(root, normalize(urlPath).replace(/^(\.\.[/\\])+/, ""));
        if (!target.startsWith(root)) {
          res.writeHead(403).end("forbidden");
          return;
        }
        const info = await stat(target);
        const file = info.isDirectory() ? join(target, "index.html") : target;
        const body = await readFile(file);
        res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream" });
        res.end(body);
      } catch {
        res.writeHead(404, { "Content-Type": "text/plain" }).end("not found");
      }
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });

/** Finds the puppeteer package, or null when it is not available. */
const resolvePuppeteer = () => {
  const candidates = [
    process.env.FLETBOX_PUPPETEER,
    join(root, "node_modules", "puppeteer"),
    join(root, "..", "flet-box-server", "node_modules", "puppeteer"),
  ].filter(Boolean);
  return candidates.find((p) => existsSync(join(p, "package.json"))) || null;
};

/** Finds a usable Chrome/Chromium binary, or null. */
const resolveChrome = () => {
  const candidates = [
    process.env.FLETBOX_CHROME,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  ].filter(Boolean);
  return candidates.find((p) => existsSync(p)) || null;
};

const puppeteerPath = resolvePuppeteer();
const chromePath = resolveChrome();

if (!puppeteerPath || !chromePath) {
  console.log("\n⏭  Browser tests SKIPPED");
  console.log(`   puppeteer: ${puppeteerPath || "not found"}  (set FLETBOX_PUPPETEER)`);
  console.log(`   browser:   ${chromePath || "not found"}  (set FLETBOX_CHROME)`);
  console.log("   Install puppeteer and/or a Chrome binary to run the behavioral suite.\n");
  process.exit(0);
}

const { default: puppeteer } = await import(join(puppeteerPath, "lib", "esm", "puppeteer", "puppeteer.js"));

const server = await startServer();
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const targets = HARNESSES.filter(
  (h) => filters.length === 0 || filters.some((f) => h.page.toLowerCase().includes(f.toLowerCase())),
);

let totalPass = 0;
let totalFail = 0;
const failedHarnesses = [];

console.log(`\nFletBox browser suite — ${targets.length} harness(es) · Chrome: ${chromePath}\n`);

for (const harness of targets) {
  const page = await browser.newPage();
  if (verbose) {
    page.on("console", (m) => console.log(`   [page] ${m.text()}`));
    page.on("pageerror", (e) => console.error(`   [page error] ${e.message}`));
  }
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));

  try {
    await page.goto(`${base}/${harness.page}`, { waitUntil: "load", timeout: 30000 });
    // Harnesses are async; wait for the global they publish when done.
    await page.waitForFunction(`window.${harness.global} !== undefined`, { timeout: 30000 });
    const result = await page.evaluate(`window.${harness.global}`);

    const pass = result.pass ?? 0;
    const fail = result.fail ?? 0;
    totalPass += pass;
    totalFail += fail;

    const status = fail === 0 ? "✅" : "❌";
    console.log(`${status} ${harness.label.padEnd(38)} ${pass} OK${fail ? ` · ${fail} FALLOS` : ""}`);

    if (fail) {
      failedHarnesses.push({ harness, result });
      for (const r of (result.results || []).filter((r) => !r.ok)) {
        console.log(`      ❌ ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
      }
    }
  } catch (error) {
    totalFail += 1;
    failedHarnesses.push({ harness, error });
    console.log(`❌ ${harness.label.padEnd(38)} ERROR: ${error.message}`);
    for (const e of pageErrors) console.log(`      ${e}`);
  }
  await page.close();
}

await browser.close();
server.close();

console.log(
  `\nTotal: ${totalPass} OK · ${totalFail} fallos` +
    (failedHarnesses.length ? ` · ${failedHarnesses.length} harness(es) con problemas\n` : "  ✔\n"),
);

process.exit(totalFail === 0 ? 0 : 1);
