#!/usr/bin/env node
/**
 * @file check-pwa-shell.mjs
 * @description
 * Guard for the two defects that made a deployed FletBox PWA look broken while
 * the app itself was healthy.
 *
 * 1. `https://user.github.io/repo/menu` refreshed → "Page not found · GitHub
 *    Pages". Pages has no SPA rewrite and answers the unknown path with a real
 *    404 *response*. The service worker's shell fallback used to live only in the
 *    `catch`, which a response never reaches, so the host's error page was handed
 *    to the browser. Reproduced below by running the generated worker against a
 *    fake 404 network: before the fix, the navigate case returned status 404.
 *
 * 2. No install prompt. A generated manifest declared `"start_url": "/"` and
 *    `"scope": "/"`, which resolve against the manifest URL to the host root —
 *    outside the app's own directory and outside its worker's scope, so Chrome
 *    refused to offer the install. The build now rewrites those two fields in the
 *    bundle copy and corrects each icon's declared size against the PNG on disk.
 *
 * Usage:
 *   node scripts/check-pwa-shell.mjs
 */
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import os from "os";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";
import * as templates from "../bin/utils/templates.js";
import { normaliseManifest, pngDimensions, writeSpaFallback } from "../bin/utils/pwaShell.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let failures = 0;
const check = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`${ok ? "✅" : "❌"} ${label}${ok ? "" : `\n     got  ${JSON.stringify(got)}\n     want ${JSON.stringify(want)}`}`);
  if (!ok) failures += 1;
};

// ---------------------------------------------------------------------------
// 1. The generated service worker, executed.
// ---------------------------------------------------------------------------
const ORIGIN = "https://user.github.io";
const BASE = "/guantanamera/";
const SHELL = "<!doctype html><title>shell</title>";

const abs = (u) => new URL(u, ORIGIN).href;

/**
 * Run `src` (the generated worker) against a modelled network + CacheStorage.
 *
 * @param {string} src - Worker source.
 * @param {Object<string, number>} routes - Pathname → HTTP status of the host.
 */
const bootWorker = (src, routes) => {
  const state = { offline: false };
  const stores = new Map();

  const entryKey = (x) => abs(typeof x === "string" ? x : x.url);
  const openStore = (name) => {
    if (!stores.has(name)) stores.set(name, new Map());
    return stores.get(name);
  };

  const makeRes = (url, status) => {
    const pathname = new URL(url, ORIGIN).pathname;
    const body = status === 200
      ? (pathname.endsWith(".html") || !path.extname(pathname) ? SHELL : "{}")
      : "<html>Page not found</html>";
    return { ok: status >= 200 && status < 300, status, url: abs(url), body, clone: () => makeRes(url, status) };
  };

  const network = (target) => {
    // A worker may fetch a scope-relative URL ('/repo/index.html'); the browser
    // resolves it against the worker location, so the model has to as well.
    if (state.offline) return Promise.reject(new TypeError("Failed to fetch"));
    const p = new URL(target, ORIGIN).pathname;
    return Promise.resolve(makeRes(target, p.startsWith(BASE) ? (routes[p] ?? 404) : 404));
  };

  const listeners = {};
  const self = {
    // A real ServiceWorkerGlobalScope.location is a URL: the worker reads
    // `.origin` from it and hands it to `new URL('./', self.location)`.
    location: new URL("service-worker.js", ORIGIN + BASE),
    addEventListener: (name, fn) => { listeners[name] = fn; },
    skipWaiting: () => {},
    clients: { claim: () => Promise.resolve() },
  };

  const sandbox = {
    self,
    console: { log() {}, error() {} },
    URL,
    URLSearchParams,
    fetch: (input) => network(typeof input === "string" ? input : input.url),
    Response: { error: () => ({ type: "error", ok: false, status: 500, body: "error" }) },
    caches: {
      open: async (name) => ({
        put: async (req, res) => { openStore(name).set(entryKey(req), res); },
        match: async (req) => openStore(name).get(entryKey(req)),
      }),
      keys: async () => [...stores.keys()],
      delete: async (name) => stores.delete(name),
    },
  };
  sandbox.globalThis = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: "service-worker.js" });

  const fire = async (name, event) => {
    listeners[name](event);
    if (event.pending) await event.pending;
  };

  return {
    install: () => {
      const event = { waitUntil: (p) => { event.pending = p; } };
      return fire("install", event);
    },
    fetchWith: async (req) => {
      const event = { request: req, respondWith: (p) => { event.pending = p; } };
      await fire("fetch", event);
      return event.pending;
    },
    cached: () => [...openStore("fletbox-v2").keys()],
    goOffline: () => { state.offline = true; },
  };
};

const workerSrc = templates.serviceWorkerJs();
const shellPath = BASE + "index.html";
const healthy = { [shellPath]: 200, [BASE]: 200, [BASE + "loader.js"]: 200, [BASE + "config.json"]: 200, [BASE + "src/app.js"]: 200, [BASE + "assets/landing/favicon.png"]: 200 };

const nav = (p, mode = "navigate") => ({ url: abs(p), method: "GET", mode });

const deepLink404 = bootWorker(workerSrc, { ...healthy, [BASE + "menu"]: 404 });
await deepLink404.install();

const answered404 = await deepLink404.fetchWith(nav(BASE + "menu"));
check(
  "a deep link the host 404s is served as the app, not as Pages' error page",
  { status: answered404.status, body: answered404.body },
  { status: 200, body: SHELL },
);

const missingImage = await deepLink404.fetchWith({ url: abs(BASE + "assets/nope.png"), method: "GET", mode: "cors" });
check(
  "a missing asset keeps its 404 (only page loads fall back to the shell)",
  missingImage.status,
  404,
);

const goodPage = await deepLink404.fetchWith(nav(BASE));
check("a normal page load is still the host's own response", goodPage.status, 200);
check("the shell is precached at install", deepLink404.cached().includes(abs(shellPath)), true);

deepLink404.goOffline();
const answeredOffline = await deepLink404.fetchWith(nav(BASE + "menu"));
check(
  "offline, the cached shell still boots a deep link",
  { status: answeredOffline.status, body: answeredOffline.body },
  { status: 200, body: SHELL },
);

let parses = true;
try { new vm.Script(workerSrc, { filename: "service-worker.js" }); } catch { parses = false; }
check("the worker still parses standalone", parses, true);


// ---------------------------------------------------------------------------
// 2. The build-time corrections, on a fixture bundle.
// ---------------------------------------------------------------------------
const fixture = mkdtempSync(path.join(os.tmpdir(), "fletbox-pwa-shell-"));
try {
  const bundle = path.join(fixture, "www");
  mkdirSync(path.join(bundle, "assets", "landing"), { recursive: true });

  writeFileSync(path.join(bundle, "index.html"), '<html><body><script src="./loader.js"></script></body></html>');

  // A 512x512 PNG, hand-assembled: signature + IHDR is all that gets read.
  const ihdr = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(ihdr, 0);
  ihdr.writeUInt32BE(512, 16);
  ihdr.writeUInt32BE(512, 20);
  ihdr.write("IHDR", 12, "ascii");
  writeFileSync(path.join(bundle, "assets", "landing", "favicon.png"), ihdr);
  writeFileSync(path.join(bundle, "assets", "not-a-png.txt"), "hello");

  check("pngDimensions reads the IHDR of a real PNG", pngDimensions(path.join(bundle, "assets", "landing", "favicon.png")), { width: 512, height: 512 });
  check("pngDimensions returns null for a non-PNG file", pngDimensions(path.join(bundle, "assets", "not-a-png.txt")), null);
  check("pngDimensions returns null for a missing file", pngDimensions(path.join(bundle, "assets", "gone.png")), null);

  writeFileSync(
    path.join(bundle, "manifest.json"),
    JSON.stringify({
      name: "Guantanamera",
      start_url: "/",
      scope: "/",
      icons: [
        { src: "./assets/landing/favicon.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "./assets/landing/favicon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        { src: "./assets/not-a-png.txt", sizes: "64x64", type: "text/plain" },
      ],
    }, null, 2) + "\n",
  );

  const fixes = normaliseManifest(bundle);
  const after = JSON.parse(readFileSync(path.join(bundle, "manifest.json"), "utf8"));
  check("start_url no longer points at the host root", after.start_url, "./");
  check("scope no longer escapes the app directory", after.scope, "./");
  check("an icon lying about its size is corrected to the file on disk", after.icons[0].sizes, "512x512");
  check("an honest icon is left alone", after.icons[1].sizes, "512x512");
  check("a non-PNG icon entry is not guessed at", after.icons[2].sizes, "64x64");
  check("each correction is reported", fixes.length, 3);
  check("running the build twice cannot drift", normaliseManifest(bundle), []);

  writeFileSync(
    path.join(bundle, "manifest.json"),
    JSON.stringify({ name: "Pinned", start_url: "/guantanamera/", scope: "/guantanamera/" }, null, 2),
  );
  normaliseManifest(bundle);
  const pinned = JSON.parse(readFileSync(path.join(bundle, "manifest.json"), "utf8"));
  check("an explicit base path typed on purpose survives", [pinned.start_url, pinned.scope], ["/guantanamera/", "/guantanamera/"]);

  writeFileSync(path.join(bundle, "manifest.json"), "{ not json");
  check("a broken manifest is skipped, not a build crash", normaliseManifest(bundle), []);
  rmSync(path.join(bundle, "manifest.json"));
  check("no manifest at all is not an error", normaliseManifest(bundle), []);

  check("404.html is written", writeSpaFallback(bundle), true);
  check("the fallback is the finished shell, byte for byte", readFileSync(path.join(bundle, "404.html"), "utf8"), readFileSync(path.join(bundle, "index.html"), "utf8"));
  check("a bundle without a shell has nothing to copy", writeSpaFallback(fixture), false);
} finally {
  rmSync(fixture, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// 3. What a fresh project is born with, and where the build hooks in.
// ---------------------------------------------------------------------------
const freshManifest = JSON.parse(templates.manifest("Guard Test"));
check("a generated manifest starts inside its own folder", freshManifest.start_url, "./");
check("a generated manifest stays inside its own folder", freshManifest.scope, "./");

const createBundle = readFileSync(path.join(repoRoot, "bin", "commands", "createBundle.js"), "utf8");
const iFallback = createBundle.indexOf("writeSpaFallback(targetDir)");
const iShare = createBundle.indexOf("absoluteShareTags(html");
const iSrcTree = createBundle.indexOf('for (const dir of ["modules", "screens"');
check("the fallback is copied after the share tags are stamped (so it is identical to the shipped shell)", iFallback > iShare && iShare > 0, true);
check("the manifest is corrected during the bundle, not by an app script", createBundle.includes("normaliseManifest(targetDir)"), true);
check("both corrections run before the build reports success", iSrcTree > iFallback, true);

// ---------------------------------------------------------------------------
// 4. The browser chrome: what an installed app paints before it can paint itself.
// ---------------------------------------------------------------------------
// An installed PWA takes its status bar and navigation bar from
// <meta name="theme-color">, and its splash from the manifest. Those are static
// files, so they carried the pre-zinc indigo long after the palette moved to
// zinc — the reader toggled the theme, the app changed, the bars did not. Two
// separate guards keep that from coming back.
const nodeThemes = await import("../src/utils/themes.js");
const { palettes } = nodeThemes;

const freshIndex = templates.indexHtml("Guard Test");
const freshCapacitor = JSON.parse(templates.capacitorConfig("Guard Test", "com.guard.test"));
const shellFiles = {
  "index.html": freshIndex,
  "manifest.json": JSON.stringify(freshManifest),
  "capacitor.config.json": JSON.stringify(freshCapacitor),
  "scripts/sync-android-icons.mjs": templates.syncAndroidIconsScript(),
  "scripts/sync-ios-assets.mjs": templates.syncIOSAssetsScript(),
  "AGENTS.md": templates.agentsMd("Guard Test", "basic", "0.0.0"),
  "README.md": templates.readme("Guard Test", "basic", "com.guard.test"),
};

check(
  "nothing a fresh app is born with still carries the old shell indigo",
  Object.entries(shellFiles)
    .filter(([, text]) => /#1a1a2e/i.test(text))
    .map(([name]) => name),
  [],
);
check(
  "the launch plate IS the dark palette's surface — one value, so the two cannot drift apart again",
  templates.SHELL_BRAND,
  palettes.dark.surface,
);
check(
  "the splash, the manifest and the meta all read that one constant",
  [
    freshIndex.includes(`<meta name="theme-color" content="${templates.SHELL_BRAND}">`),
    freshManifest.theme_color === templates.SHELL_BRAND,
    freshManifest.background_color === templates.SHELL_BRAND,
    freshCapacitor.backgroundColor === templates.SHELL_BRAND,
  ],
  [true, true, true, true],
);
check(
  "the icon scripts composite the same brand, as channels",
  [
    templates.syncAndroidIconsScript().includes(`const background = { r: ${templates.SHELL_BRAND_RGB.r}, g: ${templates.SHELL_BRAND_RGB.g}, b: ${templates.SHELL_BRAND_RGB.b} };`),
    templates.syncIOSAssetsScript().includes(`const background = { r: ${templates.SHELL_BRAND_RGB.r}, g: ${templates.SHELL_BRAND_RGB.g}, b: ${templates.SHELL_BRAND_RGB.b} };`),
    [templates.SHELL_BRAND_RGB.r, templates.SHELL_BRAND_RGB.g, templates.SHELL_BRAND_RGB.b],
  ],
  [true, true, templates.SHELL_BRAND.slice(1).match(/../g).map((h) => parseInt(h, 16))],
);

// The framework's own demo is a PWA too (`flet-box run` serves it, the docs
// tunnel ships it), so it has to agree with what `create` writes.
const demoIndex = readFileSync(path.join(repoRoot, "index.html"), "utf8");
const demoManifest = JSON.parse(readFileSync(path.join(repoRoot, "manifest.json"), "utf8"));
check(
  "the framework demo's own shell carries the live brand, not a remembered one",
  [
    !/#1a1a2e/i.test(demoIndex) && !/#1a1a2e/i.test(JSON.stringify(demoManifest)),
    demoIndex.includes(`<meta name="theme-color" content="${templates.SHELL_BRAND}">`),
    demoManifest.theme_color,
  ],
  [true, true, templates.SHELL_BRAND],
);

// The runtime half: applyPalette must rewrite the meta, not only the CSS vars.
// Without this the bars are frozen at whatever the scaffold wrote, which is
// exactly the defect, because Chrome reads the document, not the stylesheet.
const themesSrc = readFileSync(path.join(repoRoot, "src", "utils", "themes.js"), "utf8");
const applyBody = themesSrc.slice(
  themesSrc.indexOf("const applyPalette = "),
  themesSrc.indexOf("export const setTheme"),
);
check("applyPalette repaints the browser chrome", applyBody.includes("syncBrowserChrome()"), true);
const syncBody = themesSrc.slice(
  themesSrc.indexOf("const syncBrowserChrome = "),
  themesSrc.indexOf("const applyPalette = "),
);
check(
  "it updates the single theme-color meta and follows the palette's surface",
  [
    syncBody.includes('meta[name="theme-color"]'),
    /setAttribute\(\s*"content",\s*colors\.surface\s*\)/.test(syncBody),
    syncBody.includes("style.colorScheme"),
  ],
  [true, true, true],
);
// `nodeThemes` was imported above for the palette, in this same Node process —
// so calling `setTheme` here is the honest proof that the chrome sync is a no-op
// when there is no `document`, not a crash on import.
let nodeSafe = true;
let nodeError = "";
try {
  nodeThemes.setTheme("dark");
  nodeThemes.setTheme("light");
} catch (e) {
  nodeSafe = false;
  nodeError = String(e && e.message);
}
check("painting the chrome in Node is a no-op, not a crash", [nodeSafe, nodeError], [true, ""]);

if (failures) {
  console.error(`\nPWA shell: ${failures} guard(s) failed.`);
  process.exit(1);
}
console.log("\nAll PWA shell checks passed.");
