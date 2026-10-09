// bin/commands/runCloudflare.js
import { spawn, spawnSync } from "child_process";
import { c, banner, divider } from "../utils/colors.js";
import { spinner } from "../utils/spinner.js";
import { runDevServer } from "./runServer.js";

const TUNNEL_URL_RE = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/;

/**
 * Starts the local dev server and exposes it through a free Cloudflare quick
 * tunnel (no account required), printing the public HTTPS link to the console.
 *
 * @param {{ port?: number, logRequests?: boolean }} [options]
 * @returns {Promise<void>}
 */
export const runCloudflareDemo = async (options = {}) => {
  const { port = 8000, logRequests = false } = options;

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

  console.log(banner("☁️  FletBox Cloudflare Demo", "public HTTPS tunnel"));

  await runDevServer({
    spaMode: false,
    hotReload: true,
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
    console.log(c("gray", `  Local:  http://localhost:${port}`));
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
