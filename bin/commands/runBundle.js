// bin/commands/runBundle.js
// Builds the current bundle (www/) and then serves that exact bundle
// so you test precisely what would ship to production (a single src/app.js).
import { createBundle } from "./createBundle.js";
import { runDevServer } from "./runServer.js";
import { c, banner, gradient, dot } from "../utils/colors.js";

export const runBundle = async ({
  target = "www",
  port = 8000,
  askPort = false,
  logRequests = true,
} = {}) => {
  console.log(banner("🚀 Run Bundle", `build + serve ${target}/`));

  // 1) Build the bundle with the current code
  await createBundle(target);

  // 2) Serve the generated bundle (single entry point: <target>/src/app.js)
  console.log(
    `\n  ${dot("#34d399")} ${c("bold", "Bundle ready")} ${c("gray", target + "/ · SPA · hot reload OFF")}\n`,
  );
  process.chdir(target);

  await runDevServer({
    spaMode: true,
    hotReload: false,
    port,
    askPort,
    logRequests,
  });
};

export default runBundle;