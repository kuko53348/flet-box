/**
 * @file bin/commands/runBundle.js
 * @description Builds the project bundle and immediately serves it for production preview.
 *
 * Combines `createBundle` and `runDevServer` into a single command so developers
 * can verify the production artefact (a single `src/app.js`) without manually
 * running two separate commands.  Hot reload is intentionally disabled — the goal
 * is to test exactly what would ship, not to iterate on source.
 */

import { createBundle } from "./createBundle.js";
import { runDevServer } from "./runServer.js";
import { c, banner, gradient, dot } from "../utils/colors.js";

/**
 * Builds the project bundle and serves it with a static dev server.
 *
 * Workflow:
 * 1. Runs `createBundle(target)` to produce the minified output directory.
 * 2. Changes the working directory to the bundle folder.
 * 3. Starts `runDevServer` in SPA mode (all unknown paths fall back to `index.html`)
 *    with hot reload disabled so the served content exactly matches the build output.
 *
 * @async
 * @param {object}  [options={}]               - Configuration options.
 * @param {string}  [options.target="www"]      - Name of the bundle directory relative
 *   to the project root.  Passed directly to `createBundle`.
 * @param {number}  [options.port=8000]         - TCP port the server should listen on.
 * @param {boolean} [options.askPort=false]     - When `true`, prompt the user for a port
 *   if the chosen one is unavailable.
 * @param {boolean} [options.logRequests=true]  - Whether to log each HTTP request to stdout.
 * @returns {Promise<void>}
 */
export const runBundle = async ({
  target = "www",
  port = 8000,
  askPort = false,
  logRequests = true,
} = {}) => {
  console.log(banner("🚀 Run Bundle", `build + serve ${target}/`));

  // Step 1: Produce the bundle from the current source tree.
  await createBundle(target);

  // Step 2: Notify the user that the build succeeded and the server is about to start.
  console.log(
    `\n  ${dot("#34d399")} ${c("bold", "Bundle ready")} ${c("gray", target + "/ · SPA · hot reload OFF")}\n`,
  );

  // Step 3: Serve from inside the bundle directory so relative paths resolve correctly.
  process.chdir(target);

  await runDevServer({
    spaMode: true,      // Enable SPA fallback (index.html for unknown routes).
    hotReload: false,   // Hot reload is off — we're previewing the production build.
    port,
    askPort,
    logRequests,
  });
};

export default runBundle;
