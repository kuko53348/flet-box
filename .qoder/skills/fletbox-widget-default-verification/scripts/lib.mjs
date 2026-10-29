/**
 * Shared helpers for the FletBox default-verification probes.
 *
 * Both probes serve the repo over HTTP (ESM + CORS means nothing here opens
 * over `file://`), resolve puppeteer and Chrome the same way
 * `scripts/run-browser-tests.mjs` does, and close everything they open.
 */
import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { readFile, stat, mkdir } from "node:fs/promises";
import { join, extname, normalize, resolve } from "node:path";

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
  ".map": "application/json; charset=utf-8",
};

/** Minimal static server rooted at the repo, on an ephemeral port. */
export const startServer = (root) =>
  new Promise((done, fail) => {
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
        res.writeHead(200, {
          "Content-Type": MIME[extname(file)] || "application/octet-stream",
          "Cache-Control": "no-store",
        });
        res.end(body);
      } catch {
        res.writeHead(404, { "Content-Type": "text/plain" }).end("not found");
      }
    });
    server.on("error", fail);
    server.listen(0, "127.0.0.1", () => done(server));
  });

const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

export const resolvePuppeteer = (root) =>
  [
    process.env.FLETBOX_PUPPETEER,
    join(root, "node_modules", "puppeteer"),
    resolve(root, "..", "flet-box-server", "node_modules", "puppeteer"),
  ]
    .filter(Boolean)
    .find((p) => existsSync(join(p, "package.json"))) || null;

export const resolveChrome = () =>
  [process.env.FLETBOX_CHROME, ...CHROME_CANDIDATES]
    .filter(Boolean)
    .find((p) => existsSync(p)) || null;

/**
 * Boot a probe page against the repo.
 *
 * `root` must be a FletBox checkout: the demo `index.html` is only a module
 * host, and the probe mounts its own fixed overlay, so it needs `src/index.js`
 * and nothing else from the app.
 */
export const openProbe = async ({ root, scale = 2 }) => {
  if (!existsSync(join(root, "src", "index.js")) || !existsSync(join(root, "index.html"))) {
    fail(`not a FletBox checkout: ${root} has no src/index.js + index.html (pass --root <repo>)`);
  }
  const puppeteerPath = resolvePuppeteer(root);
  const chromePath = resolveChrome();
  if (!puppeteerPath || !chromePath) {
    fail(
      `probe needs both a puppeteer package and a Chrome binary.\n` +
        `   puppeteer: ${puppeteerPath || "not found"}  (set FLETBOX_PUPPETEER)\n` +
        `   browser:   ${chromePath || "not found"}  (set FLETBOX_CHROME)`,
    );
  }

  const { default: puppeteer } = await import(
    join(puppeteerPath, "lib", "esm", "puppeteer", "puppeteer.js")
  );
  const server = await startServer(resolve(root));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1100, height: 800, deviceScaleFactor: scale });
  // `#root` is a static element of the demo page: waiting on it means the page
  // and its module map are served, not that the demo finished drawing.
  await page.goto(`${base}/index.html`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.querySelector("#root") !== null, { timeout: 15000 });

  return {
    page,
    async close() {
      await browser.close();
      server.close();
    },
  };
};

/** Print a message and exit 1 — probes are gates, so silence must be loud. */
export const fail = (message) => {
  console.error(`PROBE FAILED: ${message}`);
  process.exit(1);
};

export const parseArgs = (argv) => {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) {
      out._.push(a);
      continue;
    }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) out[key] = true;
    else {
      out[key] = next;
      i++;
    }
  }
  return out;
};

export const need = (value, flag) => {
  if (value === undefined || value === true) fail(`missing --${flag}`);
  return value;
};

/** Props come in as one JSON argument; a typo must not print a stack trace. */
export const parsePropsArg = (raw) => {
  if (raw === undefined || raw === true) return {};
  try {
    return JSON.parse(String(raw));
  } catch {
    fail(`--props is not valid JSON: ${String(raw).slice(0, 80)}`);
  }
};

/** The three geometry numbers of a CSS shadow (x, y, blur), or null.
 *
 * Mirrors `shadowGeometry` in `src/widget-factory/effects.js`: the colour is
 * stripped first and the numbers are parsed, because the scale writes
 * `0 3px 6px rgba(...)` while the browser serialises the live style as
 * `rgba(...) 0px 3px 6px 0px` — comparing literals never matches a level.
 */
export const shadowGeometry = (value) => {
  const numbers = String(value ?? "")
    .replace(/rgba?\([^)]*\)/g, "")
    .trim()
    .split(/\s+/)
    .map(parseFloat);
  return numbers.length >= 3 && numbers.every(Number.isFinite) ? numbers.slice(0, 3) : null;
};

export const ensureDir = (dir) => mkdir(dir, { recursive: true }).then(() => dir);
