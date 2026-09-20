#!/usr/bin/env node

/**
 * @file bin/cli.js
 * @description FletBox CLI entry point with hot reload support.
 *
 * Parses process.argv, sets up the global Ctrl+C handler, and dispatches
 * to the appropriate command handler.  All commands are lazy-imported so
 * startup stays fast even on slow disks.
 */

import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { createProject } from "./commands/create.js";
import { packageManager } from "./commands/package.js";
import { createBundle } from "./commands/createBundle.js";
import { runDevServer } from "./commands/runServer.js";
import { createScreen } from "./commands/createScreen.js";
import { createComponent } from "./commands/createComponent.js";
import { killServer } from "./commands/killServer.js";
import { runBundle } from "./commands/runBundle.js";
import { c, gradient, section, banner, divider, width, setupCtrlC } from "./utils/colors.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json");

// Register the global Ctrl+C handler early so every command benefits from it.
setupCtrlC();

const args = process.argv.slice(2);
const command = args[0];
const projectName = args[1];

// Clear the terminal only when attached to an interactive session to avoid
// polluting piped output (e.g. CI logs).
if (process.stdout.isTTY) {
  console.clear();
}

/**
 * Prints the full help message, including all available commands and options.
 * Rendered with gradient colors when the terminal supports truecolor.
 *
 * @returns {void}
 */
const showHelp = () => {
  const cmd = (name, desc, alias = "") =>
    `  ${c("bold", gradient(name, "#22d3ee", "#6366f1"))}${" ".repeat(Math.max(1, 22 - width(name)))}${c("gray", desc)}${alias ? c("dim", "  (" + alias + ")") : ""}`;

  const opt = (name, desc) =>
    `  ${c("brightCyan", name)}${" ".repeat(Math.max(1, 24 - name.length))}${c("gray", desc)}`;

  console.log(`
${banner("🚀 FletBox CLI", `v${version}`)}

${section("🧭", "COMMANDS")}
${cmd("create <name>", "Create a new project")}
${cmd("create --adaptive", "responsive (mobile + desktop)")}
${cmd("create --blank", "empty project")}
${cmd("create --full", "AppBar+Drawer+BottomNav")}
${cmd("create --sidebar", "desktop (Sidebar+AppBar)")}
${cmd("screen <name|num>", "Create screen(s) (1-10)")}
${cmd("component <name|num>", "Create component(s) (1-10)")}
${cmd("createBundle [dir]", "Unified production bundle")}
${cmd("   └─ [dir]", "target folder (default www)")}
${cmd("run", "Static file server")}
${cmd("run --hot", "Dev server with hot reload")}
${cmd("run-spa", "SPA + hot reload")}
${cmd("run-bundle [dir]", "Build & serve the bundle (single app.js)")}
${cmd("pkg", "Open the package manager")}
${cmd("kill-server [port]", "Kill servers on a port")}
${cmd("--version | --help", "Version and this help")}

${section("⚙️", "OPTIONS")}
${opt("--port <n>, -p <n>", "Port (default 8000) — asked if not provided")}
${opt("--hot", "Hot reload with run")}
${opt("--quiet", "No request logging")}
${opt("--dry-run | --list", "kill-server: just list, do not kill")}

${section("✨", "EXAMPLES")}
  ${c("gray", "flet-box create my-app --adaptive")}
  ${c("gray", "cd my-app && flet-box run-spa")}
  ${c("gray", "flet-box run-bundle            # build & preview production")}
  ${c("gray", "flet-box kill-server 8000      # kill the parasite server")}

${divider("", "#3730a3")}
${c("dim", "  FletBox — ultra-light vanilla-JS UI framework")}
`);
};

/**
 * Parses the CLI flags from `process.argv`.
 *
 * Recognised flags:
 * - `--port <n>` / `-p <n>` — override the default port (8000).
 * - `--quiet`               — suppress per-request HTTP logging.
 * - `--hot` / `--hot-reload`— enable hot-module-replacement.
 * - `--dry-run` / `--list` / `--check` — list-only mode for `kill-server`.
 *
 * Invalid port values produce a warning and fall back to the default.
 *
 * @returns {{ port: number, portExplicit: boolean, logRequests: boolean, hot: boolean, dryRun: boolean }}
 */
const parseFlags = () => {
  const flags = {
    port: 8000,
    portExplicit: false,
    logRequests: true,
    hot: false,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if ((arg === "--port" || arg === "-p") && args[i + 1]) {
      const p = Number(args[i + 1]);
      if (Number.isInteger(p) && p > 0 && p < 65536) {
        flags.port = p;
        flags.portExplicit = true;
      } else {
        console.warn(
          c("yellow", `⚠️ Invalid port "${args[i + 1]}", using ${flags.port}`),
        );
      }
      i++;
    } else if (arg === "--quiet") {
      flags.logRequests = false;
    } else if (arg === "--hot" || arg === "--hot-reload") {
      flags.hot = true;
    } else if (arg === "--dry-run" || arg === "--list" || arg === "--check") {
      flags.dryRun = true;
    }
  }

  return flags;
};

/**
 * Guards commands that must run inside a FletBox project directory.
 * Exits with a descriptive error when `src/app.js` is not found in the
 * current working directory — this prevents confusing failures later.
 *
 * @returns {void}
 */
const ensureProject = () => {
  const inProject = fs.existsSync(path.join(process.cwd(), "src", "app.js"));
  if (!inProject) {
    console.error(c("red", "❌ Not inside a FletBox project"));
    console.log(
      c(
        "gray",
        "Run this inside a project folder with src/app.js (create one with: flet-box create <name>)",
      ),
    );
    process.exit(1);
  }
};

/**
 * Main async entry point.  Parses flags, then delegates to the matching
 * command handler via a `switch` on the first positional argument.
 *
 * Unrecognised commands print the help message and exit with code 1.
 *
 * @async
 * @returns {Promise<void>}
 */
async function main() {
  try {
    const flags = parseFlags();

    switch (command) {
      case "create":
      case "new":
        if (!projectName) {
          console.error(c("red", "❌ Error: Project name required"));
          console.log(
            c(
              "gray",
              "Usage: flet-box create <project-name> [--adaptive|--blank|--full|--sidebar]",
            ),
          );
          process.exit(1);
        }
        if (!/^[a-z0-9-]+$/i.test(projectName)) {
          console.error(
            c(
              "red",
              "❌ Error: Invalid project name. Use only letters, numbers, and hyphens.",
            ),
          );
          process.exit(1);
        }
        // Forward all remaining args (template flags like --adaptive) to createProject.
        await createProject(projectName, args.slice(2));
        break;

      case "screen":
      case "screens": {
        ensureProject();
        const screenInput = args[1];
        if (!screenInput) {
          console.error(c("red", "❌ Error: Screen name or number required"));
          console.log(c("gray", "Usage: flet-box screen <name>"));
          console.log(c("gray", "       flet-box screen <number> (1-10)"));
          process.exit(1);
        }
        await createScreen(screenInput);
        break;
      }

      case "component":
      case "comp": {
        ensureProject();
        const componentInput = args[1];
        if (!componentInput) {
          console.error(
            c("red", "❌ Error: Component name or number required"),
          );
          console.log(c("gray", "Usage: flet-box component <name>"));
          console.log(c("gray", "       flet-box component <number> (1-10)"));
          process.exit(1);
        }
        await createComponent(componentInput);
        break;
      }

      case "createBundle":
      case "bundle":
      case "build":
        await createBundle(args[1]);
        break;

      case "pkg":
      case "package":
      case "manager":
        await packageManager();
        break;

      case "kill-server":
      case "kill":
      case "killServer":
      case "killsrv":
        await killServer(
          args[1] && /^\d+$/.test(args[1]) ? args[1] : flags.port,
          { dryRun: flags.dryRun },
        );
        break;

      case "run":
      case "dev":
      case "serve":
        ensureProject();
        await runDevServer({
          spaMode: false,
          hotReload: flags.hot,
          port: flags.port,
          askPort: !flags.portExplicit,
          logRequests: flags.logRequests,
        });
        break;

      case "run-bundle":
      case "runBundle":
      case "preview": {
        ensureProject();
        // Accept an explicit target directory as the second argument, but reject
        // anything that looks like a flag (starts with "-") to avoid misparses.
        const targetDir =
          args[1] &&
          /^[a-zA-Z0-9_][a-zA-Z0-9_-]*$/.test(args[1]) &&
          !args[1].startsWith("-")
            ? args[1]
            : "www";
        await runBundle({
          target: targetDir,
          port: flags.port,
          askPort: !flags.portExplicit,
          logRequests: flags.logRequests,
        });
        break;
      }

      case "run-spa":
      case "runSpa":
      case "spa":
        ensureProject();
        await runDevServer({
          spaMode: true,
          hotReload: true,
          port: flags.port,
          askPort: !flags.portExplicit,
          logRequests: flags.logRequests,
        });
        break;

      case "--version":
      case "-v":
        console.log(`flet-box v${version}`);
        break;

      case "--help":
      case "-h":
      case "help":
        showHelp();
        break;

      default:
        if (command) {
          console.error(c("red", `❌ Unknown command: ${command}`));
          console.log("");
          showHelp();
        } else {
          showHelp();
        }
        process.exit(1);
    }
  } catch (error) {
    console.error(c("red", "❌ CLI Error:"), error.message);
    // Show the full stack trace only when DEBUG is set, to keep normal output clean.
    if (process.env.DEBUG) console.error(error);
    process.exit(1);
  }
}

main();
