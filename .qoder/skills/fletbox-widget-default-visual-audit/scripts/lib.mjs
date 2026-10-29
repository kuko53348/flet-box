// Shared helpers for the default-visual audit scripts.
// Node core only: this runs against a checkout, never inside the published package.
import { createServer } from "node:http";
import { createReadStream, existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

export const HERE = dirname(fileURLToPath(import.meta.url));

/** Signals "this environment cannot run the browser half"; the script skips, not fails. */
export class Skip extends Error {}

export function flag(argv, name, fallback = undefined) {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && i + 1 < argv.length ? argv[i + 1] : fallback;
}

export function hasFlag(argv, name) {
  return argv.includes(`--${name}`);
}

const looksLikeRepo = (dir) =>
  dir && existsSync(join(dir, "src", "index.js")) && existsSync(join(dir, "package.json"));

/**
 * The framework checkout: --root, then FLETBOX_ROOT, then the gallery's own ./src
 * symlink (the audit almost always runs from the scratch dir, where walking up the
 * tree finds nothing), then walking up from the cwd.
 * A wrong root silently audits a stale copy, so the package name is checked too.
 */
export function repoRoot(argv, hint) {
  const realHint = hint && existsSync(hint) ? dirname(realpathSync(hint)) : null;
  const explicit = flag(argv, "root") || process.env.FLETBOX_ROOT;
  const tried = [];
  const candidates = [explicit, realHint, process.cwd()];
  let up = resolve(process.cwd());
  for (let i = 0; i < 6; i++) {
    candidates.push(up);
    const parent = dirname(up);
    if (parent === up) break;
    up = parent;
  }
  for (const c of candidates) {
    if (!c) continue;
    const dir = resolve(c);
    tried.push(dir);
    if (!looksLikeRepo(dir)) continue;
    let name = "";
    try {
      name = JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).name;
    } catch {
      continue;
    }
    if (name === "flet-box") return dir;
  }
  throw new Skip(
    `flet-box checkout not found (tried:\n  ${tried.join("\n  ")}\n)` +
      ` Pass --root <dir> or set FLETBOX_ROOT.`
  );
}

const PUPPETEER_ENTRIES = [
  "puppeteer/lib/esm/puppeteer/puppeteer.js",
  "puppeteer-core/lib/esm/puppeteer/puppeteer-core.js",
];

/** puppeteer is a devDependency of the sibling server checkout, never of this repo. */
export function resolvePuppeteer(root) {
  const fromEnv = process.env.FLETBOX_PUPPETEER;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;
  const bases = [
    resolve(root, "..", "flet-box-server", "node_modules"),
    resolve(root, "node_modules"),
    resolve(root, "..", "..", "node_modules"),
  ];
  for (const base of bases) {
    for (const entry of PUPPETEER_ENTRIES) {
      const p = join(base, entry);
      if (existsSync(p)) return p;
    }
  }
  try {
    const require = createRequire(import.meta.url);
    for (const entry of PUPPETEER_ENTRIES) {
      const p = require.resolve(entry, { paths: [resolve(root, "..", "flet-box-server"), root] });
      if (existsSync(p)) return p;
    }
  } catch {
    /* fall through to the skip message */
  }
  return null;
}

export function resolveChrome() {
  const candidates = [
    process.env.FLETBOX_CHROME,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);
  return candidates.find((c) => existsSync(c)) || null;
}

/** Launches headless Chrome or throws Skip with the exact one-line fix. */
export async function openBrowser(root) {
  const puppeteerPath = resolvePuppeteer(root);
  if (!puppeteerPath) {
    throw new Skip(
      "puppeteer not found. Set FLETBOX_PUPPETEER to the .../puppeteer/lib/esm/puppeteer/puppeteer.js" +
        ` of a checkout that has it (this repo keeps none; looked in ${resolve(root, "..")})`
    );
  }
  const executablePath = resolveChrome();
  if (!executablePath) {
    throw new Skip("Chrome not found. Set FLETBOX_CHROME to the browser executable.");
  }
  const puppeteer = await import(`file://${puppeteerPath}`);
  const browser = await puppeteer.default.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  return { browser, puppeteer };
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
};

/**
 * Static server for the scratch gallery, on a free port, with no-store on every
 * response. A cached module is the single most common reason a visual fix looks
 * like "nothing changed", so caching is not an option here.
 */
export function serve(dir) {
  const root = realpathSync(dir);
  const server = createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
    const file = resolve(root, rel);
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403).end("forbidden");
      return;
    }
    if (!existsSync(file)) {
      res.writeHead(404, { "Cache-Control": "no-store" }).end("not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": MIME[extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store, max-age=0",
    });
    createReadStream(file).pipe(res);
  });
  return new Promise((done) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      done({
        port,
        url: `http://127.0.0.1:${port}/`,
        close: () => new Promise((k) => server.close(k)),
      });
    });
  });
}

/** The gallery reports itself; never screenshot a half-built page. */
export async function waitForGallery(page, timeout = 20000) {
  await page.waitForFunction(() => window.__GALLERY && window.__GALLERY.cards > 0, { timeout });
  // canvas widgets (Chart, QRCode, Maps) and webfonts settle after the first paint.
  await new Promise((r) => setTimeout(r, 1200));
  return page.evaluate(() => window.__GALLERY);
}

export async function switchTheme(page, theme) {
  await page.evaluate((t) => document.getElementById(t).click(), theme);
  await page.waitForFunction(
    (t) => window.__GALLERY && window.__GALLERY.theme === t,
    { timeout: 20000 },
    theme
  );
  await new Promise((r) => setTimeout(r, 1200));
  return page.evaluate(() => window.__GALLERY);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export { sleep };
