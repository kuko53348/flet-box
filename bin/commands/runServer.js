// bin/commands/runServer.js
import http from "http";
import fs from "fs";
import path from "path";
import readline from "readline";
import { WebSocketServer, WebSocket } from "ws";
import chokidar from "chokidar";
import { c, banner, rainbow, dot, typewriter } from "../utils/colors.js";
import { spinner } from "../utils/spinner.js";

// Ask for a port interactively (Enter = use the default)
const askPort = (message, fallback) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(message, (answer) => {
      rl.close();
      const trimmed = (answer || "").trim();
      if (trimmed === "") {
        resolve(fallback);
        return;
      }
      const n = Number(trimmed);
      if (Number.isInteger(n) && n > 0 && n < 65536) {
        resolve(n);
      } else {
        console.warn(c("yellow", `⚠️ Invalid port "${trimmed}", using ${fallback}`));
        resolve(fallback);
      }
    });
  });

// Detect if we are in the framework root directory
const isFrameworkRoot = (projectRoot) => {
  const packageJson = path.join(projectRoot, "package.json");
  if (fs.existsSync(packageJson)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJson, "utf-8"));
      return pkg.name === "flet-box";
    } catch (e) {
      return false;
    }
  }
  return false;
};

export const runDevServer = async (options = {}) => {
  const {
    spaMode = false,
    hotReload = true,
    port = process.env.PORT || 8000,
    logRequests = process.env.LOG_REQUESTS !== "false",
  } = options;

  const projectRoot = process.cwd();
  const clients = new Set();
  let watcher = null;
  let PORT = Number(port) || 8000;

  console.log(
    banner(
      "📡 FletBox Server",
      `${spaMode ? "SPA" : "Static"}${hotReload ? " + Hot Reload" : ""}`,
    ),
  );

  // Interactive port: if no --port was passed and there is a TTY, ask
  if (options.askPort && process.stdin.isTTY) {
    PORT = await askPort(
      c("cyan", `🌐 Server port [${PORT}]: `),
      PORT,
    );
  }

  // Detectar si estamos en el framework
  const isFramework = isFrameworkRoot(projectRoot);

  const mimeTypes = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".mjs": "text/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
  };

  const broadcast = (message) => {
    const msg = typeof message === "string" ? message : JSON.stringify(message);
    // `readyState` is a `WebSocket` constant, not a `WebSocketServer` one:
    // comparing against `WebSocketServer.OPEN` (undefined) matched no client and
    // silently disabled hot reload for everybody.
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  };

  const extractExports = (content) => {
    const exports = [];
    const patterns = [
      /export\s+(?:const|let|var|function|class)\s+(\w+)/g,
      /export\s+default\s+(?:function\s+)?(\w+)/g,
      /export\s+\{\s*([^}]+)\s*\}/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        if (match[1]) {
          if (match[1].includes(",")) {
            const names = match[1].split(",").map((s) => s.trim());
            exports.push(...names);
          } else {
            exports.push(match[1]);
          }
        }
      }
    }
    return [...new Set(exports)];
  };

  const getChangeType = (filePath, oldContent, newContent) => {
    if (filePath.endsWith(".css")) return "css";
    if (filePath.endsWith(".html")) return "full-reload";

    if (oldContent && newContent) {
      const oldExports = extractExports(oldContent);
      const newExports = extractExports(newContent);

      if (JSON.stringify(oldExports) !== JSON.stringify(newExports)) {
        return "exports-changed";
      }
    }
    return "code-changed";
  };

  const server = http.createServer((req, res) => {
    try {
      let url = req.url;
      try {
        url = decodeURIComponent(url);
      } catch (e) {
        url = req.url;
      }

      const safePath = path.normalize(url).replace(/^(\.\.[\/\\])+/, "");
      let filePath = path.join(
        projectRoot,
        safePath === "/" ? "index.html" : safePath,
      );
      let ext = path.extname(filePath).toLowerCase();

      fs.access(filePath, fs.constants.F_OK, (err) => {
        // SPA fallback: if the file doesn't exist and has no extension, serve index.html
        let isFallback = false;
        if (err && spaMode && (!ext || ext === "")) {
          filePath = path.join(projectRoot, "index.html");
          ext = ".html";
          isFallback = true;
        }

        fs.readFile(filePath, (err2, content) => {
          if (err2) {
            if (logRequests) {
              console.log(`${c("red", "404")} ${req.method} ${url}`);
            }
            res.writeHead(404);
            res.end("404 - File Not Found");
            return;
          }

          const contentType = mimeTypes[ext] || "text/plain";

          // A rewritten deep link is served from `index.html`, but the browser
          // still resolves `./loader.js` against `/demo/forms/`, so the page came
          // up blank on every shared link. Anchoring the page at the served root
          // keeps the app's relative URLs working whatever the route is.
          if (isFallback && ext === ".html") {
            let html = content.toString("utf-8");
            if (!/<base [^>]*href=/i.test(html)) {
              html = html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}\n<base href="/">`);
            }
            content = html;
          }

          if (logRequests) {
            const sizeKB = (content.length / 1024).toFixed(1);
            console.log(
              `${c("green", "200")} ${req.method} ${url} → ${contentType} ${sizeKB}KB`,
            );
          }

          // Inyectar HMR solo en HTML
          if (ext === ".html" && hotReload) {
            let html = content.toString("utf-8");

            let hmrScript;
            if (isFramework) {
              // ✅ Estamos en el framework: usar ruta directa
              hmrScript = `
                                <script type="module">
                                    import { initHMR } from '/src/core/hmr-client.js';
                                    initHMR();
                                </script>
                            `;
              if (logRequests)
                console.log(
                  c("blue", "🔧 Framework mode: using direct HMR import"),
                );
            } else {
              // A static import, not `import('flet-box').then(...)`: the client
              // restores the state snapshot and that must run before the app's
              // own `useState` call. A `.then()` is a microtask later, so the
              // app would already have booted with defaults.
              hmrScript = `
                                <script type="module">
                                    import { initHMR } from 'flet-box';
                                    initHMR();
                                </script>
                            `;
            }

            if (!html.includes("initHMR")) {
              // Inserted before the app's module tag, so module execution order
              // puts the restore first; `</head>` and `</body>` are the fallbacks
              // for a page that has no module script yet.
              const anchor = /<script[^>]*type=["']module["'][^>]*>/i.exec(html);
              if (anchor)
                html = html.slice(0, anchor.index) + hmrScript + html.slice(anchor.index);
              else if (html.includes("</head>"))
                html = html.replace("</head>", `${hmrScript}</head>`);
              else if (html.includes("</body>"))
                html = html.replace("</body>", `${hmrScript}</body>`);
              else html += hmrScript;
              content = html;
            }
          }

          // A dev server that lets the browser cache a module is a hot reload
          // that "does nothing": the page reloads and re-gets the old code.
          res.writeHead(200, {
            "Content-Type": contentType,
            "Cache-Control": "no-store, no-cache, must-revalidate",
          });
          res.end(content);
        });
      });
    } catch (error) {
      console.error("Server error:", error);
      if (!res.headersSent) {
        res.writeHead(500);
        res.end("Internal Server Error");
      }
    }
  });

  let serverErrorHandled = false;

  const stateDot = (on, color) => (on ? dot(color) : c("gray", "●"));
  let boot = null;

  const printReady = async (p) => {
    if (boot) boot.succeed(`Dev server running on port ${p}`);
    console.log("");
    await typewriter(`● http://localhost:${p}`, { ms: 10, color: "#34d399" });
    console.log(
      `  ${stateDot(spaMode, "#22d3ee")} ${c("gray", "SPA")}        ${c("brightGreen", spaMode ? "ON " : "OFF")}`,
    );
    console.log(
      `  ${stateDot(hotReload, "#a855f7")} ${c("gray", "Hot Reload")} ${c("brightGreen", hotReload ? "ON " : "OFF")}`,
    );
    console.log(
      `  ${stateDot(logRequests, "#fbbf24")} ${c("gray", "Logging")}   ${c("brightGreen", logRequests ? "ON " : "OFF")}`,
    );
    if (isFramework) {
      console.log(`\n  ${rainbow("🔧 Framework mode — direct HMR imports")}`);
    }
    console.log(c("gray", "\n  Press Ctrl+C to stop\n"));
  };

  const onServerError = async (err) => {
    if (serverErrorHandled) return;
    serverErrorHandled = true;

    if (err && err.code === "EADDRINUSE") {
      if (options.askPort && process.stdin.isTTY) {
        if (boot) boot.stop();
        boot = null;
        const next = Number(PORT) + 1;
        const newPort = await askPort(
          c("yellow", `⚠️ Port ${PORT} in use. New port [${next}]: `),
          next,
        );
        if (newPort !== PORT) {
          console.log(c("blue", `🔄 Retrying on port ${newPort}...`));
          PORT = newPort;
          serverErrorHandled = false;
          server.listen(PORT, () => printReady(PORT));
          return;
        }
      }
      console.error(c("red", `❌ Port ${PORT} is already in use`));
      console.log(
        c(
          "gray",
          `  → Try another port: flet-box run-spa --port ${Number(PORT) + 1}`,
        ),
      );
      console.log(
        c("gray", `  → Or stop the process: lsof -ti tcp:${PORT} | xargs kill`),
      );
    } else {
      if (boot) boot.fail("Server startup failed");
      console.error(c("red", "❌ Server error:"), err && err.message);
    }
    process.exit(1);
  };
  server.on("error", onServerError);

  // WebSocket para HMR
  if (hotReload) {
    const wss = new WebSocketServer({ server });

    // A browser tab that vanishes mid-flight (a tunnel closing an idle socket is
    // enough) makes `ws` emit "error". With no listener that is an uncaught
    // exception and the dev server dies with the tab — the usual reason hot
    // reload "crashes" during a live demo.
    wss.on("error", (err) => {
      console.warn(c("yellow", `⚠️  HMR socket error: ${err && err.message}`));
    });

    wss.on("connection", (ws) => {
      clients.add(ws);
      if (logRequests) console.log(c("green", "🔌 HMR client connected"));
      ws.on("error", () => {
        // The peer is already gone; `close` follows and drops it from the set.
      });
      ws.send(JSON.stringify({ type: "request-modules" }));
      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === "register-modules") {
            console.log(
              c(
                "gray",
                `📦 Registered ${message.modules?.length || 0} modules`,
              ),
            );
          }
        } catch (e) {}
      });
      ws.on("close", () => {
        clients.delete(ws);
        if (logRequests) console.log(c("gray", "🔌 HMR client disconnected"));
      });
    });

    // chokidar 4 removed glob support: `src/**/*.js` is watched as a literal
    // path that never exists, so the watcher silently reported "Watching…" and
    // never fired once. Watch the real roots and filter by extension instead.
    const watchPaths = ["src", "index.html"];
    const isWatched = (filePath) =>
      /\.(js|mjs|css)$/.test(filePath) || filePath === "index.html";
    const moduleVersions = new Map();

    watcher = chokidar.watch(watchPaths, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      cwd: projectRoot,
      ignoreInitial: true,
      // An editor saves in two or three writes (write, rename, chmod). Firing on
      // each one reloads the page several times per Ctrl+S.
      awaitWriteFinish: { stabilityThreshold: 150, pollInterval: 25 },
    });

    const lastSent = new Map();

    watcher.on("change", async (filePath) => {
      if (!isWatched(filePath)) return;
      const fullPath = path.join(projectRoot, filePath);
      try {
        const newContent = fs.readFileSync(fullPath, "utf-8");
        const oldContent = moduleVersions.get(filePath);
        const changeType = getChangeType(filePath, oldContent, newContent);
        moduleVersions.set(filePath, newContent);
        const key = `${filePath}:${changeType}`;
        const now = Date.now();
        if (now - (lastSent.get(key) || 0) < 700) return;
        lastSent.set(key, now);
        console.log(c("yellow", `📝 Changed: ${filePath} (${changeType})`));
        broadcast(
          JSON.stringify({
            type: "hmr",
            file: filePath,
            changeType,
            timestamp: now,
          }),
        );
      } catch (err) {
        console.error(c("red", `Error reading file: ${filePath}`));
      }
    });

    watcher.on("add", (filePath) => {
      if (!isWatched(filePath)) return;
      console.log(c("green", `➕ Added: ${filePath}`));
      broadcast(JSON.stringify({ type: "reload", reason: "file-added" }));
    });

    watcher.on("unlink", (filePath) => {
      if (!isWatched(filePath)) return;
      console.log(c("red", `➖ Removed: ${filePath}`));
      broadcast(JSON.stringify({ type: "reload", reason: "file-removed" }));
    });

    console.log(c("blue", "👀 Watching for file changes..."));
  }

  // Boot spinner (skipped when an interactive port prompt may still happen)
  boot = options.askPort && process.stdin.isTTY ? null : spinner(`Starting ${spaMode ? "SPA" : "static"} server...`);
  server.listen(PORT, () => printReady(PORT));

  const cleanup = () => {
    console.log(c("yellow", "\n👋 Shutting down..."));
    if (watcher) watcher.close();
    clients.forEach((client) => client.close());
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  return server;
};

export default runDevServer;
