// scripts/lib/staticServer.mjs
//
// The static file server the browser harnesses are served from.
//
// It exists because the harnesses cannot be opened over `file://` (ESM +
// CORS), and because two scripts need the same server: the behavioral suite
// and the visual baseline. One server, one place that knows the MIME types
// and the path guard.

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, normalize, extname } from "node:path";

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

/**
 * Serve a directory over HTTP on an ephemeral port.
 *
 * @param {string} root The directory to serve.
 * @returns {Promise<{ server: import("node:http").Server, port: number, close: () => void }>}
 */
export const startStaticServer = (root) =>
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
    server.listen(0, "127.0.0.1", () => {
      resolve({
        server,
        port: server.address().port,
        close: () => server.close(),
      });
    });
  });
