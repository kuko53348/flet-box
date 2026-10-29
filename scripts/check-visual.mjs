#!/usr/bin/env node
/**
 * @file check-visual.mjs
 * @description
 * The visual baseline: the same gallery, in both themes, measured twice.
 *
 * A widget's default state is the state a regression hits first — a token
 * that changed, a radius that grew, a row that now wraps. None of that
 * shows up in a type check or a prop contract, and a screenshot in git is a
 * binary nobody can review in a diff. So the gallery is **measured**: every
 * widget's colours, radius, padding, type and box become numbers, and the
 * numbers are compared with `scripts/visual-baseline.json`.
 *
 * What is compared, and how strictly:
 *
 *   - colours, radius, padding, type — **exactly**. A token that moved is a
 *     defect, and the two machines agree on them because they come from the
 *     same tokens.
 *   - heights — with a 2 px tolerance. A height follows the line box of the
 *     local font, and a font's line box is not identical on macOS and on the
 *     CI runner. A real regression moves a row by more than that.
 *   - widths — only for the widgets whose size the framework pins (an icon, a
 *     switch, a code), with a 1 px tolerance. The width of a word is not the
 *     framework's business and not this gate's either.
 *   - contrast — with a 0.15 tolerance, because it is derived from the
 *     colours and only its rounding is in question.
 *
 * The browser is Chrome, driven over the DevTools protocol with `ws` — the
 * driver this repository already depends on for the dev server. No puppeteer,
 * no downloaded browser, and nothing added to the package: CI's runner
 * already ships Chrome.
 *
 * Usage:
 *   node scripts/check-visual.mjs                  # compare with the baseline
 *   node scripts/check-visual.mjs --write-baseline # accept what is on screen
 *   node scripts/check-visual.mjs --list          # print the measurement
 */

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { WebSocket } from "ws";
import { startStaticServer } from "./lib/staticServer.mjs";

const root = path.resolve(import.meta.dirname, "..");
const baselinePath = path.join(root, "scripts", "visual-baseline.json");
const GALLERY = "/tests/visual.html";

/** How far a height may drift before it is a regression, in CSS pixels. */
const HEIGHT_TOLERANCE = 2;
/** The same for the width of a widget whose size the framework pins. */
const WIDTH_TOLERANCE = 1;
/** The same for a contrast ratio. */
const CONTRAST_TOLERANCE = 0.15;

const THEMES = ["light", "dark"];

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

// ---------------------------------------------------------------------------
// Chrome
// ---------------------------------------------------------------------------

const CHROME_CANDIDATES = [
  process.env.FLETBOX_CHROME,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter(Boolean);

const findChrome = () => CHROME_CANDIDATES.find((p) => existsSync(p)) || null;

/**
 * Launch Chrome headless and wait for its DevTools endpoint.
 *
 * Chrome writes the port it chose into `DevToolsActivePort` inside the
 * profile directory, which is how the endpoint is found without guessing a
 * port that might already be taken.
 *
 * @param {string} chromePath
 * @param {string} profileDir
 * @returns {Promise<{ proc: import("node:child_process").ChildProcess, wsUrl: string }>}
 */
const launchChrome = async (chromePath, profileDir) => {
  const proc = spawn(
    chromePath,
    [
      "--headless=new",
      "--remote-debugging-port=0",
      `--user-data-dir=${profileDir}`,
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "about:blank",
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );

  const portFile = path.join(profileDir, "DevToolsActivePort");
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    if (existsSync(portFile)) {
      const [port, route] = readFileSync(portFile, "utf8").split("\n");
      if (port && route) {
        return { proc, wsUrl: `ws://127.0.0.1:${port.trim()}${route.trim()}` };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  proc.kill();
  throw new Error(`Chrome did not publish a DevTools port within 20s (${chromePath})`);
};

/**
 * A DevTools client: one socket, numbered commands, and the events that come
 * back.
 */
class DevTools {
  /**
   * @param {import("ws").WebSocket} socket
   */
  constructor(socket) {
    this.socket = socket;
    this.nextId = 0;
    this.pending = new Map();
    this.waiting = new Map();
    this.listeners = new Map();
    socket.on("message", (raw) => {
      const message = JSON.parse(raw.toString());
      if (message.id !== undefined && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(`${message.error.message} (${message.method})`));
        else resolve(message.result);
        return;
      }
      if (!message.method) return;
      const key = `${message.sessionId || ""}:${message.method}`;
      for (const callback of this.listeners.get(key) || []) callback(message.params);
      const listeners = this.waiting.get(key);
      if (listeners && listeners.length) {
        this.waiting.delete(key);
        for (const resolve of listeners) resolve(message.params);
      }
    });
  }

  /**
   * Listen for an event for as long as the session lasts.
   *
   * @param {string} method
   * @param {(params: object) => void} callback
   * @param {string} [sessionId]
   */
  on(method, callback, sessionId) {
    const key = `${sessionId || ""}:${method}`;
    const callbacks = this.listeners.get(key) || [];
    callbacks.push(callback);
    this.listeners.set(key, callbacks);
  }

  /**
   * @param {string} method
   * @param {object} [params]
   * @param {string} [sessionId]
   * @returns {Promise<object>}
   */
  send(method, params = {}, sessionId) {
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }

  /**
   * Wait for one event. Registered before the command that triggers it, or
   * the event is missed.
   *
   * @param {string} method
   * @param {string} [sessionId]
   * @returns {Promise<object>}
   */
  once(method, sessionId) {
    const key = `${sessionId || ""}:${method}`;
    return new Promise((resolve) => {
      const listeners = this.waiting.get(key) || [];
      listeners.push(resolve);
      this.waiting.set(key, listeners);
    });
  }
}

// ---------------------------------------------------------------------------
// The measurement
// ---------------------------------------------------------------------------

/**
 * Load the gallery in one theme and read its fingerprint.
 *
 * @param {DevTools} devtools
 * @param {string} sessionId
 * @param {string} url
 * @param {string[]} errors Collects what the page complained about.
 * @returns {Promise<object>}
 */
const readFingerprint = async (devtools, sessionId, url, errors) => {
  const loaded = devtools.once("Page.loadEventFired", sessionId);
  await devtools.send("Page.navigate", { url }, sessionId);
  await loaded;

  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    const { result, exceptionDetails } = await devtools.send(
      "Runtime.evaluate",
      { expression: "window.__VISUAL ? JSON.stringify(window.__VISUAL) : ''", returnByValue: true },
      sessionId,
    );
    if (exceptionDetails) {
      throw new Error(
        exceptionDetails.exception?.description || exceptionDetails.text || "the page threw",
      );
    }
    if (result.value) return JSON.parse(result.value);
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  // A page that throws says nothing on its own; the console is the only
  // place the reason is written down.
  throw new Error(
    `the gallery never published its fingerprint (${url})` +
      (errors.length ? `\n  the page said:\n    ${errors.join("\n    ")}` : ""),
  );
};

// ---------------------------------------------------------------------------
// The comparison
// ---------------------------------------------------------------------------

/**
 * The fields compared exactly, and the ones compared with a tolerance.
 */
const EXACT = ["bg", "fg", "border", "radius", "font", "pad"];
const TOLERANT = { h: HEIGHT_TOLERANCE, w: WIDTH_TOLERANCE, contrast: CONTRAST_TOLERANCE };

/**
 * Compare one widget's measurement with the baseline.
 *
 * @param {object} current
 * @param {object} baseline
 * @returns {string[]} The differences.
 */
const diffWidget = (current, baseline) => {
  const out = [];
  if (!baseline) return ["the widget is not in the baseline"];
  for (const key of EXACT) {
    if (current[key] === undefined) continue;
    if (current[key] !== baseline[key]) {
      out.push(`${key}: ${baseline[key]} → ${current[key]}`);
    }
  }
  for (const [key, tolerance] of Object.entries(TOLERANT)) {
    if (current[key] === undefined || baseline[key] === undefined) continue;
    const delta = Math.abs(current[key] - baseline[key]);
    if (delta > tolerance) {
      out.push(`${key}: ${baseline[key]} → ${current[key]} (${delta.toFixed(2)} > ${tolerance})`);
    }
  }
  return out;
};

const args = process.argv.slice(2);
const writeBaseline = args.includes("--write-baseline");
const listAll = args.includes("--list");

// ---------------------------------------------------------------------------
// The run
// ---------------------------------------------------------------------------

const chromePath = findChrome();
if (!chromePath) {
  console.log(
    "\n⚠️  No Chrome binary found — the visual baseline cannot be measured.\n" +
      "   Set FLETBOX_CHROME to a Chrome/Chromium binary.\n",
  );
  process.exit(0);
}

const profileDir = mkdtempSync(path.join(tmpdir(), "fletbox-visual-"));
const { server, port, close } = await startStaticServer(root);
let chrome;
let runError = null;

try {
  chrome = await launchChrome(chromePath, profileDir);
  const socket = new WebSocket(chrome.wsUrl);
  await new Promise((resolve, reject) => {
    socket.on("open", resolve);
    socket.on("error", reject);
  });
  const devtools = new DevTools(socket);

  const { targetId } = await devtools.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await devtools.send("Target.attachToTarget", {
    targetId,
    flatten: true,
  });
  await devtools.send("Page.enable", {}, sessionId);
  await devtools.send("Runtime.enable", {}, sessionId);

  // What the page complains about, in its own words.
  const pageErrors = [];
  devtools.on("Runtime.exceptionThrown", (params) => {
    const details = params.exceptionDetails;
    pageErrors.push(
      details?.exception?.description || details?.text || "the page threw something",
    );
  });
  devtools.on("Runtime.consoleAPICalled", (params) => {
    if (params.type !== "error" && params.type !== "warning") return;
    pageErrors.push(
      `${params.type}: ${(params.args || []).map((a) => a.value ?? a.description ?? "").join(" ")}`,
    );
  });

  // The gallery is a phone-width column: the viewport is pinned so the
  // measurement is the same on every machine.
  await devtools.send(
    "Emulation.setDeviceMetricsOverride",
    { width: 420, height: 900, deviceScaleFactor: 1, mobile: false },
    sessionId,
  );

  const measured = {};
  for (const theme of THEMES) {
    measured[theme] = await readFingerprint(
      devtools,
      sessionId,
      `http://127.0.0.1:${port}${GALLERY}?theme=${theme}`,
      pageErrors,
    );
    const count = Object.keys(measured[theme].items).length;
    console.log(`  ${theme}: ${count} widgets measured`);
  }

  if (listAll) {
    console.log("\n" + JSON.stringify(measured, null, 2));
  }

  if (writeBaseline) {
    const next = {};
    for (const theme of THEMES) next[theme] = measured[theme].items;
    writeFileSync(baselinePath, JSON.stringify(next, null, 2) + "\n", "utf8");
    const total = Object.values(next).reduce((n, items) => n + Object.keys(items).length, 0);
    console.log(`\nvisual-baseline.json escrito: ${total} widgets en ${THEMES.length} temas.`);
    process.exit(0);
  }

  await check("the baseline file exists", () => {
    if (!existsSync(baselinePath)) {
      throw new Error(
        "scripts/visual-baseline.json is missing — run this script with --write-baseline",
      );
    }
  });

  const baseline = existsSync(baselinePath)
    ? JSON.parse(readFileSync(baselinePath, "utf8"))
    : {};

  await check("the gallery looks the same as the baseline", () => {
    const differences = [];
    for (const theme of THEMES) {
      const current = measured[theme].items;
      const expected = baseline[theme] || {};
      for (const name of Object.keys(current)) {
        for (const line of diffWidget(current[name], expected[name])) {
          differences.push(`${theme}/${name} ${line}`);
        }
      }
      for (const name of Object.keys(expected)) {
        if (!current[name]) differences.push(`${theme}/${name} the widget is missing`);
      }
    }
    if (!differences.length) return;
    const lines = [
      `${differences.length} visual difference(s):`,
      ...differences.slice(0, 40).map((d) => `  · ${d}`),
      "  if the change is intended: node scripts/check-visual.mjs --write-baseline",
    ];
    throw new Error(lines.join("\n"));
  });

  await check("both themes were measured", () => {
    for (const theme of THEMES) {
      const count = Object.keys(measured[theme].items).length;
      if (!count) throw new Error(`the ${theme} theme measured nothing`);
    }
  });

  await check("the comparison bites", () => {
    const before = { bg: "rgb(1, 2, 3)", h: 100 };
    const after = { bg: "rgb(1, 2, 4)", h: 140 };
    const differences = diffWidget(after, before);
    if (!differences.length) throw new Error("a changed colour and height were accepted");
    if (diffWidget(before, before).length) {
      throw new Error("an unchanged widget was reported as different");
    }
  });
} catch (error) {
  runError = error;
} finally {
  if (chrome) {
    chrome.proc.kill();
    // Chrome keeps writing to its profile for a moment after the signal;
    // removing the directory underneath it is what produced ENOTEMPTY.
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 3000);
      chrome.proc.once("exit", () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }
  close();
  try {
    rmSync(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  } catch {
    // A profile Chrome still holds open is not worth failing the run over.
  }
}

if (runError) {
  console.error(`\n❌ the visual baseline could not run: ${runError.message}\n`);
  process.exit(1);
}

console.log(
  failures.length
    ? `\n❌ ${failures.length} visual baseline failure(s): ${failures.join(", ")}\n`
    : "\n✅ The gallery looks the same in both themes.\n",
);
process.exit(failures.length ? 1 : 0);
