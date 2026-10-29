// Shared bootstrap for the examples-app verification probes.
// Resolves puppeteer and Chrome without hardcoding a machine path, and opens a
// page with the theme and viewport already set.

import { existsSync } from "node:fs";
import { basename, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// The probes live at <flet-box>/.qoder/skills/<skill>/scripts/lib.mjs, so the
// default app is that checkout's sibling — no machine path to keep in sync.
const REPO_ROOT = fileURLToPath(new URL("../../../../", import.meta.url));

export const APP =
  process.env.FLETBOX_EXAMPLES_APP || join(REPO_ROOT, "..", "flet-box-widgets-exemples");

const flags = new Map(
  process.argv
    .slice(2)
    .reduce((acc, arg, i, all) => {
      if (arg.startsWith("--")) acc.push([arg.slice(2), all[i + 1] && !all[i + 1].startsWith("--") ? all[++i] : true]);
      return acc;
    }, []),
);

export const opt = (name, fallback) => {
  const value = flags.get(name);
  return value === undefined || value === true ? fallback : String(value);
};

export const has = (name) => flags.has(name);

// 9130 by default, and the port is never trusted on its own: a probe that
// reuses "whatever is listening" can measure another app's routes as a pass.
export const PORT = opt("port", "9130");
export const BASE = `http://127.0.0.1:${PORT}`;
export const WIDTH = Number(opt("width", 1600));
// Keyed by app and port so two probes (or two apps) never overwrite each
// other's PNGs when they run at the same time.
export const OUT_DIR = opt("out", `/tmp/shots/${basename(APP)}-${PORT}`);

if (!existsSync(APP)) {
  console.error(`APP NOT FOUND: ${APP}\nSet FLETBOX_EXAMPLES_APP to the examples app checkout.`);
  process.exit(1);
}

async function resolvePuppeteer() {
  const roots = [APP, `${APP}/../flet-box-server`, `${APP}/../flet-box`];
  for (const root of roots) {
    const entry = `${root}/node_modules/puppeteer/lib/esm/puppeteer/puppeteer.js`;
    if (existsSync(entry)) return (await import(pathToFileURL(entry).href)).default;
  }
  try {
    return (await import("puppeteer")).default;
  } catch {}
  console.error("NO PUPPETEER: not in the app, its sibling flet-box-server, or the framework.");
  console.error("Copy puppeteer's ESM entry into one of those, or set FLETBOX_EXAMPLES_APP there.");
  process.exit(1);
}

function resolveChrome() {
  if (process.env.FLETBOX_CHROME && existsSync(process.env.FLETBOX_CHROME)) return process.env.FLETBOX_CHROME;
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta",
  ];
  const found = candidates.find(existsSync);
  if (!found) {
    console.error("NO CHROME: set FLETBOX_CHROME to a browser binary.");
    process.exit(1);
  }
  return found;
}

let browserPromise;

export async function launch() {
  if (!browserPromise) {
    const puppeteer = await resolvePuppeteer();
    browserPromise = puppeteer.launch({
      executablePath: resolveChrome(),
      headless: true,
      args: ["--no-sandbox"],
    });
  }
  return browserPromise;
}

export async function withBrowser(run) {
  const browser = await launch();
  try {
    return await run(browser);
  } finally {
    await browser.close().catch(() => {});
  }
}

// One page, themed before its first script runs, sized, with its error channels
// collected into the returned `problems` array. Close it with `page.close()`.
export async function openPage(browser, { theme, width = WIDTH, height = 1000, deviceScaleFactor = 1 } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor });
  const problems = [];
  page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
  page.on("console", (message) => message.type() === "error" && problems.push(`console: ${message.text()}`));
  page.on("response", (response) => response.status() >= 400 && problems.push(`http ${response.status()} ${response.url()}`));
  if (theme) {
    await page.evaluateOnNewDocument((value) => localStorage.setItem("fletbox-theme", value), theme);
  }
  return { page, problems };
}

// Reusing a live server is the rule, but "something answers on the port" is not
// the same as "the examples app answers on the port": another app serves a
// different shell and has no `[data-example-error]` stages. Every probe goes
// through gotoAndWait, so the identity is checked there, once per process,
// before a single measurement is trusted.
const APP_MARKER = "flet-box-widgets-exemples";
let identified = null;

async function assertRightApp() {
  if (identified !== null) return;
  let html = "";
  try {
    const response = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(5000) });
    html = response.ok ? await response.text() : "";
  } catch {}
  if (!html.includes(APP_MARKER)) {
    console.error(
      `WRONG APP on :${PORT} — the page does not say "${APP_MARKER}"${html ? "" : " (nothing answered)"}.\n` +
        `The examples app is ${APP}; start it with:\n` +
        `  cd ${APP} && node ../flet-box/bin/cli.js run-spa --port ${PORT} --quiet`,
    );
    process.exit(1);
  }
  identified = true;
}

export async function gotoAndWait(page, route, ms = 400) {
  await assertRightApp();
  const path = route.startsWith("/") ? route : `/${route}`;
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle0" });
  await new Promise((resolve) => setTimeout(resolve, ms));
  return page;
}

export async function loadCatalog() {
  const catalog = await import(pathToFileURL(`${APP}/src/database/catalog.js`).href);
  const names = (catalog.ALL_WIDGETS ?? []).map((widget) => widget.name ?? widget).filter(Boolean);
  const categories = (catalog.CATEGORIES ?? []).map((category) => category.id).filter(Boolean);
  if (!names.length) {
    console.error("CATALOG EMPTY: ALL_WIDGETS is not exported from src/database/catalog.js");
    process.exit(1);
  }
  return { names, categories, catalog };
}
