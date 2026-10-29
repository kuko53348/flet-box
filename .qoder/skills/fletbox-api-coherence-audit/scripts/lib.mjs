/**
 * @file lib.mjs
 * Shared plumbing for the FletBox coherence probes: repo resolution, a static
 * server (the ESM tests cannot open over `file://`), and puppeteer/Chrome
 * resolution identical to scripts/run-browser-tests.mjs.
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { join, normalize, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

/**
 * FletBox checkout: --root, $FLETBOX_ROOT, then walk up from the current
 * directory. The skill lives outside the repo, so the cwd is the useful hint.
 */
const findUp = (start) => {
  let dir = start;
  while (dir !== dirname(dir)) {
    const pkg = join(dir, "package.json");
    if (existsSync(pkg)) {
      try {
        if (JSON.parse(readFileSync(pkg, "utf8")).name === "flet-box") return dir;
      } catch {}
    }
    dir = dirname(dir);
  }
  return null;
};

export const resolveRoot = (argv = process.argv) => {
  const i = argv.indexOf("--root");
  if (i !== -1 && argv[i + 1]) return normalize(argv[i + 1]);
  if (process.env.FLETBOX_ROOT) return normalize(process.env.FLETBOX_ROOT);
  const found = findUp(process.cwd()) || findUp(dirname(fileURLToPath(import.meta.url)));
  if (found) return found;
  throw new Error("FletBox repo not found: pass --root <path> or set FLETBOX_ROOT");
};

export const missingDeps = () => {
  const root = resolveRoot();
  const puppeteer = [
    process.env.FLETBOX_PUPPETEER,
    join(root, "node_modules", "puppeteer"),
    join(root, "..", "flet-box-server", "node_modules", "puppeteer"),
  ]
    .filter(Boolean)
    .find((p) => existsSync(join(p, "package.json")));
  const chrome = [
    process.env.FLETBOX_CHROME,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ]
    .filter(Boolean)
    .find((p) => existsSync(p));
  return { root, puppeteer, chrome };
};

/** Prints the skip notice and exits 0 when puppeteer or Chrome is absent. */
export const requireBrowserDeps = async () => {
  const { root, puppeteer, chrome } = missingDeps();
  if (!puppeteer || !chrome) {
    console.log(
      `SKIPPED - puppeteer: ${puppeteer || "not found"} (set FLETBOX_PUPPETEER), ` +
        `browser: ${chrome || "not found"} (set FLETBOX_CHROME)`
    );
    process.exit(0);
  }
  const { default: pptr } = await import(join(puppeteer, "lib", "esm", "puppeteer", "puppeteer.js"));
  const server = await startServer(root);
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await pptr.launch({
    executablePath: chrome,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  return {
    root,
    base,
    browser,
    close: async () => {
      await browser.close();
      server.close();
    },
  };
};

/** Static server rooted at the repo plus a `/__probe__` blank page. Read-only. */
const startServer = (root) =>
  new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      if ((req.url || "/").startsWith("/__probe__")) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<!doctype html><meta charset=utf-8><body></body>");
        return;
      }
      const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
      const target = join(root, normalize(urlPath).replace(/^(\.\.[/\\])+/, ""));
      if (!target.startsWith(root)) {
        res.writeHead(403).end("forbidden");
        return;
      }
      try {
        const body = await readFile(target);
        res.writeHead(200, { "Content-Type": MIME[extname(target)] || "application/octet-stream" });
        res.end(body);
      } catch {
        res.writeHead(404, { "Content-Type": "text/plain" }).end("not found");
      }
    });
    server.listen(0, "127.0.0.1", () => resolve(server));
  });

/**
 * Neutralize side-effect APIs in the Node main context, so a probe invoked as
 * `node <file> <expr>` cannot hang on a timer or dial out: an expression like
 * `MatrixRain({})` keeps rescheduling itself on the global `setInterval`.
 * Node-side loading is unaffected: these helpers read files from disk, not HTTP.
 */
export const neutralizeDangerousApis = () => {
  if ("setInterval" in globalThis) globalThis.setInterval = () => 0;
  if ("fetch" in globalThis) globalThis.fetch = () => Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
};

/** Race a probe against a wall-clock limit (`timeout` does not exist on macOS). */
export const withTimeout = (promise, ms, label = "probe") =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)),
  ]);
