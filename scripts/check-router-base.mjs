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

if (failures) {
  console.error(`\nRouter base path: ${failures} of ${cases.length} cases failed.`);
  process.exit(1);
}
console.log(`\nRouter base path: ${cases.length} cases OK.`);
