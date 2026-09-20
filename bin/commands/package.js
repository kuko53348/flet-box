// bin/commands/package.js
import readline from "readline";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execCmd } from "../utils/helpers.js";
import { c, gradient, rainbow, section, divider, panel } from "../utils/colors.js";
import { execSpin } from "../utils/spinner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let FRAMEWORK_VERSION = "v1.0.0";
try {
  FRAMEWORK_VERSION =
    "v" +
    JSON.parse(
      fs.readFileSync(path.join(__dirname, "../../package.json"), "utf8"),
    ).version;
} catch {}

export const packageManager = async () => {
  const PACKAGE = "flet-box";
  const PKG_PATH = path.join(__dirname, "../..");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const question = (q) => new Promise((resolve) => rl.question(q, resolve));

  process.on("SIGINT", () => {
    console.log(`\n${rainbow("👋 Bye!")}\n`);
    rl.close();
    process.exit(0);
  });

  const run = (label, icon, color = "#6366f1") =>
    console.log(`\n${divider(`${icon}  ${label}`, color)}`);

  const opt = (n, name, desc, from = "#34d399", to = "#22d3ee") =>
    `  ${gradient(`${n}.`, from, to)} ${c("bold", name.padEnd(10))}${c("dim", "·")} ${c("gray", desc)}`;

  while (true) {
    console.clear();
    console.log(`\n${panel("📦 FletBox Package Manager", FRAMEWORK_VERSION, { minW: 64 })}`);
    console.log(
      `
${section("🔧", "LOCAL DEVELOPMENT")}
${opt(1, "link", "Create global link")}
${opt(2, "use", "Use link in current project")}
${opt(3, "unlink", "Remove the link")}
${opt(4, "list", "Show link status")}

${section("📦", "NPM REGISTRY")}
${opt(5, "publish", "Publish to npm", "#38bdf8", "#6366f1")}
${opt(6, "install", "npm install flet-box", "#38bdf8", "#6366f1")}
${opt(7, "uninstall", "npm uninstall flet-box", "#38bdf8", "#6366f1")}

${section("👤", "UTILS")}
${opt(8, "whoami", "Show npm user", "#d946ef", "#8b5cf6")}
${opt(9, "login", "Login to npm", "#d946ef", "#8b5cf6")}
${opt(0, "exit", "Leave the manager", "#f43f5e", "#fb923c")}

${divider("", "#3730a3")}
${c("gray", "  Press Ctrl+C to exit at any time")} ${c("dim", "· " + FRAMEWORK_VERSION)}
`,
    );

    const choice = await question(
      `\n  ${gradient("❯", "#22d3ee", "#a855f7")} ${c("brightCyan", "Select option")}: `,
    );

    switch (choice) {
      case "1":
        execSpin("Creating global link...", `cd "${PKG_PATH}" && npm link`);
        break;

      case "2":
        execSpin("Linking flet-box in current project...", `npm link ${PACKAGE}`);
        break;

      case "3":
        execSpin("Unlinking flet-box...", `npm unlink ${PACKAGE}`);
        break;

      case "4":
        run("STATUS", "📋");
        execCmd(
          `npm list -g --depth=0 2>/dev/null | grep ${PACKAGE} || echo "Not linked globally"`,
        );
        const localPath = path.join(process.cwd(), "node_modules", PACKAGE);
        if (fs.existsSync(localPath)) {
          console.log(` ${gradient("✅ Installed locally", "#34d399", "#22d3ee")}`);
        } else {
          console.log(` ${c("gray", "❌ Not installed locally")}`);
        }
        break;

      case "5":
        execSpin("Publishing to npm...", `cd "${PKG_PATH}" && npm publish`);
        break;

      case "6":
        execSpin("Installing flet-box from npm...", `npm install ${PACKAGE}`);
        break;

      case "7":
        execSpin("Uninstalling flet-box...", `npm uninstall ${PACKAGE}`);
        break;

      case "8":
        run("WHOAMI", "👤");
        execCmd(`npm whoami 2>/dev/null || echo "Not logged in"`);
        break;

      case "9":
        run("LOGIN", "🔐");
        execCmd(`npm adduser`);
        break;

      case "0":
        console.log(`\n${rainbow("👋 Bye!")}\n`);
        rl.close();
        return;

      default:
        console.log(`\n ${c("red", "❌ Invalid option")}`);
    }
    await question(`\n  ${c("gray", "Press Enter to continue...")}`);
  }
};