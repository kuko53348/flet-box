// bin/commands/runCloudflare.js
import { spawn, spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { c, banner, divider } from "../utils/colors.js";
import { spinner } from "../utils/spinner.js";
import { createBundle } from "./createBundle.js";
import { runDevServer } from "./runServer.js";

const TUNNEL_URL_RE = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/;

/**
 * Builds the production bundle and exposes it through a free Cloudflare quick
 * tunnel (no account required), printing the public HTTPS link to the console.
 *
 * The bundle is the thing on the tunnel, never the source tree: `index.html`
 * maps the bare `flet-box` specifier to `./node_modules/...`, so serving `src/`
 * publicly only works once `npm install` has run on that machine, and a fresh
 * clone, a phone on 4G or a deep link showed a module-resolution error instead
 * of the app. `createBundle` inlines the framework, so what the visitor gets is
 * exactly what would be deployed.
 *
 * @param {{ target?: string, port?: number, logRequests?: boolean }} [options]
 * @returns {Promise<void>}
 */
export const runCloudflareDemo = async ({
  target = "www",
  port = 8000,
  logRequests = false,
} = {}) => {
  // Check the tunnel binary before spending a build on a command that cannot run.
  const probe = spawnSync("cloudflared", ["--version"], { encoding: "utf-8" });
  if (probe.error) {
    console.error(c("red", "❌ cloudflared is not installed"));
    console.log(c("gray", "  Install it first:"));
    console.log(c("cyan", "    macOS:   brew install cloudflared"));
    console.log(
      c("cyan", "    Linux:   https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"),
    );
    process.exit(1);
  }

  console.log(banner("☁️  FletBox Cloudflare Demo", `bundle ${target}/ → public HTTPS tunnel`));

  await createBundle(target);

  // The bundle's `update.url` points at the production OTA source (the GitHub
  // Pages site). A tunnel is not that origin, so every visitor's first action was
  // a cross-origin fetch that the browser logged as a CORS error. Same-origin is
  // both quieter and honest: the demo checks itself and reports "up to date".
  try {
    const configPath = path.join(process.cwd(), target, "config.json");
    const cfg = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (cfg?.update) {
      cfg.update.url = "/";
      fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2) + "\n");
    }
  } catch (e) {
    console.warn(c("yellow", `⚠️  Could not retarget the OTA url: ${e.message}`));
  }

  console.log(
    `\n  ${c("gray", `Bundle built · serving ${target}/ (SPA, hot reload OFF)`)}\n`,
  );

  // Serve from inside the bundle so every relative path the visitor requests
  // resolves against the build output.
  process.chdir(target);

  await runDevServer({
    spaMode: true,
    hotReload: false,
    port,
    askPort: false,
    logRequests,
  });

  const boot = spinner("Opening Cloudflare quick tunnel...");
  const tunnel = spawn(
    "cloudflared",
    ["tunnel", "--url", `http://localhost:${port}`],
    { stdio: ["ignore", "pipe", "pipe"] },
  );

  let announced = false;

  const announce = (url) => {
    announced = true;
    boot.succeed("Cloudflare tunnel ready");
    console.log("");
    console.log(c("brightCyan", "  🌐 Public link (open this):"));
    console.log(`  ${c("bold", c("brightGreen", url))}`);
    console.log("");
    console.log(c("gray", `  Local:  http://localhost:${port} · ${target}/`));
    console.log(
      c("gray", "  The tunnel stays alive while this process runs. Ctrl+C to stop."),
    );
    console.log(divider("", "#3730a3"));
  };

  const onData = (chunk) => {
    if (announced) return;
    const match = chunk.toString().match(TUNNEL_URL_RE);
    if (match) announce(match[0]);
  };

  tunnel.stdout.on("data", onData);
  tunnel.stderr.on("data", onData);

  tunnel.on("exit", (code) => {
    if (announced) return;
    boot.fail(`Cloudflare tunnel exited (code ${code})`);
    console.log(
      c("gray", "  The local server is still running; the tunnel could not start."),
    );
  });

  // runDevServer's SIGINT handler calls process.exit, so also release the
  // tunnel on the synchronous "exit" event to avoid leaving it orphaned.
  process.on("exit", () => {
    try {
      tunnel.kill("SIGTERM");
    } catch (e) {}
  });
};

export default runCloudflareDemo;
