#!/usr/bin/env node
/**
 * @file check-router-base.mjs
 * @description
 * Guard for the router's deployment base path — the bug that broke every deep
 * link of a FletBox app hosted under a subpath (GitHub Pages, `/repo/…`).
 *
 * A router that writes app-relative routes as root-absolute URLs ejects the app
 * from its own prefix on the first navigation, so `kuko53348.github.io/flet-box-docs/`
 * + a click to `/documentation` landed on `…/documentation` → 404.
 *
 * Runs in plain Node: the router only touches `window` when it is there, so the
 * resolution logic can be exercised without a browser (and without hijacking the
 * real history of the browser harness).
 *
 * Usage:
 *   node scripts/check-router-base.mjs
 */
import {
  initRouter,
  getCurrentPath,
  getBasePath,
  clearRouter,
} from "../src/navigations/Router.js";

const ROUTES = {
  "/": "home",
  "/documentation": "docs",
  "/doc": "viewer",
  "/demo/:module/:widget": "demo",
};

/** [requested URL, explicit base option, expected base, expected app path] */
const cases = [
  // Detected from the route table: the prefix is whatever makes the rest match.
  ["/flet-box-docs/documentation", null, "/flet-box-docs", "/documentation"],
  ["/flet-box-docs/", null, "/flet-box-docs", "/"],
  ["/flet-box-docs/demo/forms/Input", null, "/flet-box-docs", "/demo/forms/Input"],
  ["/flet-box-docs/doc", null, "/flet-box-docs", "/doc"],
  // Hosted at the root: nothing to strip.
  ["/documentation", null, "", "/documentation"],
  ["/", null, "", "/"],
  ["/demo/forms/Input", null, "", "/demo/forms/Input"],
  // Explicit base wins, and an unknown deep path normalises to the app root
  // instead of producing a route that cannot render.
  ["/flet-box-docs/nope", "/flet-box-docs", "/flet-box-docs", "/"],
  ["/app/deep/documentation", "/app/deep", "/app/deep", "/documentation"],
];

let failures = 0;

for (const [url, base, wantBase, wantPath] of cases) {
  clearRouter();
  initRouter(ROUTES, url, base === null ? {} : { base });
  const gotBase = getBasePath();
  const gotPath = getCurrentPath();

  if (gotBase === wantBase && gotPath === wantPath) {
    console.log(`✅ ${url}${base ? ` (base: ${base})` : ""} → base="${gotBase}" path="${gotPath}"`);
    continue;
  }
  failures++;
  console.error(
    `❌ ${url}${base ? ` (base: ${base})` : ""} → base="${gotBase}" path="${gotPath}"` +
      ` (expected base="${wantBase}" path="${wantPath}")`,
  );
}

clearRouter();

// ---------------------------------------------------------------------------
// The same prefix rule applied to what `flet-box create` writes out. A project
// site is served under /<repo>/, so any root-absolute URL in the generated
// shell escapes the app; and the generated workflow is the other half of the
// deploy, so its shape is asserted here too, because a file GitHub cannot parse
// fails with no job and no step to read.
// ---------------------------------------------------------------------------
const templates = await import("../bin/utils/templates.js");
const generated = {
  "index.html": templates.indexHtml("Guard Test"),
  "service-worker.js": templates.serviceWorkerJs(),
  // Two shapes: no repo given (the placeholder is what the developer edits) and
  // a repo given (the address is written as text, like the docs repo does).
  "build.yml": templates.githubWorkflow("Guard Test"),
  "build.yml (repo)": templates.githubWorkflow("Guard Test", "https://octocat.guard-test/"),
};

const checks = [
  // Root-absolute URLs, allowed only where the file is deliberately at the
  // origin root (none today).
  ["index.html: no root-absolute src/href", !/(?:src|href)="\//.test(generated["index.html"])],
  ["index.html: registers the worker app-relative", generated["index.html"].includes("register('./service-worker.js')")],
  ["index.html: no absolute fetch('/…')", !generated["index.html"].includes("fetch('/")],
  ["service-worker.js: derives its own base", generated["service-worker.js"].includes("new URL('./', self.location)")],
  ["service-worker.js: precache is prefixed", !/PRECACHE = \[\s*['"]\//.test(generated["service-worker.js"])],
  // A workflow that publishes a source tree instead of the bundle, and one whose
  // release gate depends on a ref that can never deploy, are both refused here.
  ["build.yml: triggers on main only", /^  push:\n    branches: \[ main \]$/m.test(generated["build.yml"]) && !/^ *tags:/m.test(generated["build.yml"])],
  ["build.yml: checkout can see the tags", generated["build.yml"].includes("fetch-tags: true")],
  // A run that starts from a tag cannot deploy: github-pages refuses it. So the
  // release decision must read the commit, never github.ref.
  ["build.yml: release reads the commit, not the ref", generated["build.yml"].includes("git tag --points-at HEAD")],
  ["build.yml: no github.ref tag gate", !generated["build.yml"].includes("startsWith(github.ref, 'refs/tags/v')")],
  ["build.yml: sets up Pages", generated["build.yml"].includes("actions/configure-pages@v5")],
  ["build.yml: uploads only www", /upload-pages-artifact@v?\d+[\s\S]{0,40}?path: www/.test(generated["build.yml"])],
  ["build.yml: deploy needs build", /^\s+needs: build$/m.test(generated["build.yml"])],
  ["build.yml: never cancels a live deploy", generated["build.yml"].includes("cancel-in-progress: false")],
  // Node 20 is EOL; a generated app must not announce it on every build.
  ["build.yml: builds on a live Node LTS", /node-version: (22|24)\b/.test(generated["build.yml"])],
  // The address lives in the file, not only in the log: opening build.yml on
  // GitHub has to say where this app goes. With no repo at scaffold time the
  // owner stays the placeholder the developer must edit.
  ["build.yml: names a site address in the header", /^# This app goes live at:\n#   https:\/\/\S+\/$/m.test(generated["build.yml"])],
  ["build.yml: no repo keeps TU-USUARIO visible", generated["build.yml"].includes("https://TU-USUARIO.github.io/guard-test/")],
  ["build.yml: a repo writes its real Pages URL", generated["build.yml (repo)"].includes("https://octocat.guard-test/")],
  // The placeholder comment names fletbox.config.json and says the build reads
  // it as "not configured": the address an installed app polls is derived, not
  // copied from that file. A real repo drops the whole note.
  [
    "build.yml: a placeholder explains the config file is derived past",
    /fletbox\.config\.json[\s\S]{0,400}derives? the address/i.test(
      generated["build.yml"],
    ),
  ],
  ["build.yml: a known repo says nothing about placeholders", !generated["build.yml (repo)"].includes("placeholder")],
  ["build.yml: a value that is not a URL is refused", templates.githubWorkflow("Guard Test", "com.check.app").includes("TU-USUARIO")],
  ["build.yml: web deploys on push, natives are not here", generated["build.yml"].includes("Web: AUTOMATIC") && !/deploy-pages/.test(generated["build.yml"].split("\n  deploy:")[0])],
];

let templateFailures = 0;
for (const [name, ok] of checks) {
  if (ok) {
    console.log(`✅ ${name}`);
    continue;
  }
  templateFailures++;
  console.error(`❌ ${name}`);
}

if (templateFailures) {
  console.error(`\nGenerated shell/workflow: ${templateFailures} of ${checks.length} guards failed.`);
  process.exit(1);
}

if (failures) {
  console.error(`\nRouter base path: ${failures} of ${cases.length} cases failed.`);
  process.exit(1);
}
console.log(`\nRouter base path: ${cases.length} cases OK, ${checks.length} generated-file guards OK.`);
