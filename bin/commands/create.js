/**
 * @file bin/commands/create.js
 * @description Scaffolds a new FletBox project from one of several built-in templates.
 *
 * Supported templates:
 * - `basic`    — AppBar + Drawer (default)
 * - `blank`    — Minimal app with a single screen
 * - `full`     — AppBar + Drawer + BottomNavigation
 * - `sidebar`  — AppBar + Sidebar (desktop-first)
 * - `adaptive` — Responsive layout that adapts between mobile and desktop
 */

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";
import { createFile, copyFile, makeExecutable } from "../utils/helpers.js";
import * as templates from "../utils/templates.js";
import { parseGithubRepo } from "../utils/bundleConfig.js";
import { checkApi } from "../commands/checkApi.js";
import { unpack } from "../commands/unpack.js";
import { skillNames, readSkill } from "../utils/skills.js";
import { CONTRACT_FILE, readContract } from "../utils/contract.js";
import { c, banner, gradient } from "../utils/colors.js";

/**
 * Skills that every screen needs, whatever the task. Their Cursor twin rule loads
 * with the file instead of waiting to be picked by description; the rest are
 * read when their description matches what the agent is about to do.
 */
const ALWAYS_ON_SKILLS = new Set(["fletbox-rules", "fletbox-design"]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const capacitorAppId = (projectName) => {
  const segments = projectName
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((segment) => (/^[a-z]/.test(segment) ? segment : `app${segment}`));
  return `com.fletbox.${segments.join(".") || "app"}`;
};

/**
 * Parses the raw CLI arguments passed after the project name to determine
 * which template was requested, whether an explicit name was given, and the
 * optional `--repo <user/repo>` for OTA updates.
 *
 * Flag-to-template mapping:
 * - `--adaptive` → `"adaptive"`
 * - `--blank`    → `"blank"`
 * - `--full`     → `"full"`
 * - `--sidebar`  → `"sidebar"`
 * - (none)       → `"basic"` (default)
 *
 * Any non-flag argument (does not start with `--`) is treated as the project name.
 * `--repo` consumes the next positional as its value (a GitHub user/repo or URL).
 *
 * @param {string[]} args - Raw CLI arguments, may include flags and a project name.
 * @returns {{ template: string, projectName: string|null, repo: string|null }}
 */
const parseCreateArgs = (args) => {
  const TEMPLATES = ["basic", "adaptive", "blank", "full", "sidebar"];
  let template = "basic"; // default template
  let projectName = null;
  let repo = null;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--adaptive") {
      template = "adaptive";
    } else if (arg === "--blank") {
      template = "blank";
    } else if (arg === "--full") {
      template = "full";
    } else if (arg === "--sidebar") {
      template = "sidebar";
    } else if (arg === "--template" || arg.startsWith("--template=")) {
      // `--template blank` was read as a bare positional, so the value became the
      // project name and `flet-box create myapp --template blank` built a folder
      // called `blank` running the `basic` template.
      const inline = arg.startsWith("--template=");
      const value = inline ? arg.slice("--template=".length) : args[++i];
      if (TEMPLATES.includes(value)) template = value;
      else if (value !== undefined)
        console.warn(c("yellow", `⚠️ Unknown template "${value}", using ${template}`));
    } else if (arg === "--repo") {
      if (i + 1 < args.length && !args[i + 1].startsWith("--")) {
        repo = args[i + 1];
        i++;
      }
    } else if (!arg.startsWith("--") && projectName === null) {
      // The FIRST positional is the name. A later one is an unclaimed flag value
      // and must not silently rename the project.
      projectName = arg;
    }
  }
  return { template, projectName, repo };
};

/** Asks the user for the OTA repo interactively (TTY only). */
const askRepo = () =>
  new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(
      c(
        "cyan",
        "GitHub repo for OTA updates (user/repo or https://... ) [Enter to skip]: ",
      ),
      (answer) => {
        rl.close();
        resolve(answer.trim());
      },
    );
  });

/**
 * The GitHub Pages address a repo value implies, or null when the value is not
 * a GitHub repo. Kept apart from `resolveOtaUrl` because the workflow header
 * names the *Pages* site: a custom-domain OTA URL is not an address this file
 * can publish to, so it must not be printed as one.
 *
 * @param {string|null} input - "user/repo" or a github.com URL.
 * @returns {string|null} Base URL ending in "/", or null.
 */
const pagesSiteUrl = (input) => {
  if (!input) return null;
  const gh = parseGithubRepo(input.trim());
  return gh ? `https://${gh.user}.github.io/${gh.repo}/` : null;
};

/**
 * Normalizes the user's OTA target into a base URL ending in "/".
 * - "user/repo" (or any GitHub URL shape) → GitHub Pages URL.
 * - A full http(s) URL is used as-is.
 * - Unrecognized input → null (the placeholder URL is left in the template).
 *
 * @param {string|null} input - The value from `--repo` or the interactive prompt.
 * @returns {string|null} Base URL ending in "/", or null.
 */
const resolveOtaUrl = (input) => {
  if (!input) return null;
  const value = input.trim();
  if (/^https?:\/\//i.test(value)) {
    return value.endsWith("/") ? value : `${value}/`;
  }
  return pagesSiteUrl(value);
};

/**
 * Creates a new FletBox project in a subdirectory of the current working directory.
 *
 * Steps performed:
 * 1. Validates the project name and checks that the target folder does not exist.
 * 2. Creates the required directory tree (varies by template).
 * 3. Writes all static files: `index.html`, `package.json`, `.gitignore`, etc.
 * 4. Copies bundled Material Icons fonts from the package's own `src/fonts/` directory.
 * 5. Generates screens, layout components, and `src/app.js` based on the chosen template.
 * 6. Makes `run.sh` executable.
 *
 * @async
 * @param {string} projectName - Desired project folder name (validated by the caller).
 * @param {string[]} [rawArgs=[]] - Additional CLI arguments forwarded from the main CLI dispatcher.
 * @returns {Promise<void>}
 */
export const createProject = async (projectName, rawArgs = []) => {
  const { template, projectName: name, repo: repoArg } = parseCreateArgs([
    projectName,
    ...rawArgs,
  ]);
  const finalName = name || projectName;
  if (!finalName) {
    console.error(c("red", "❌ Project name required"));
    console.log(
      c(
        "gray",
        "Usage: flet-box create <name> [--adaptive|--blank|--full|--sidebar|--repo user/repo]",
      ),
    );
    process.exit(1);
  }

  // OTA target: asked interactively when --repo is missing and stdin is a TTY.
  // The value becomes update.url in fletbox.config.json (placeholder if skipped).
  let repoInput = repoArg;
  if (!repoInput && process.stdin.isTTY) {
    repoInput = await askRepo();
  }
  const otaUrl = resolveOtaUrl(repoInput);
  // The Pages address the workflow file prints as its own header. Derived from
  // the repo alone: `flet-box create myapp --repo me/my-website` says so in
  // build.yml, and a missing or unparsable repo leaves the placeholder to edit.
  const siteUrl = pagesSiteUrl(repoInput);
  if (repoInput && !otaUrl) {
    console.warn(
      c(
        "yellow",
        `⚠️ Could not parse repo "${repoInput}" — leaving the placeholder OTA URL in fletbox.config.json.`,
      ),
    );
  }

  const appId = capacitorAppId(finalName);
  const projectPath = path.join(process.cwd(), finalName);
  if (fs.existsSync(projectPath)) {
    console.error(c("red", `❌ Folder "${finalName}" already exists`));
    process.exit(1);
  }

  console.log(banner("📦 Creating project", `${finalName} · ${template}`));

  // Build the list of directories to create.
  // All templates share a common base; non-blank templates add screens/components.
  const commonDirs = [
    ".github/workflows",
    "assets",
    "scripts",
    "src",
    "src/assets/fonts",
    "src/database",
    // AI agent contract: rules, memory and the generated API cheatsheet.
    ".fletbox/api",
    ".fletbox/memory/notes",
    ".fletbox/metrics",
    ".claude",
    ".claude/skills",
    ".qoder/skills",
    ".cursor/rules",
  ];
  const extraDirs =
    template === "blank" ? [] : ["src/screens", "src/components"];
  if (template === "sidebar" || template === "adaptive") {
    extraDirs.push("src/components/layouts");
  }
  const allDirs = [...commonDirs, ...extraDirs];
  for (const dir of allDirs) {
    const fullPath = path.join(projectPath, dir);
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`${c("green", "📁")} Created: ${dir}`);
  }

  // Write files shared by every template.
  createFile(
    path.join(projectPath, "index.html"),
    templates.indexHtml(finalName),
  );
  createFile(
    path.join(projectPath, "package.json"),
    templates.packageJson(finalName),
  );
  createFile(
    path.join(projectPath, "jsconfig.json"),
    templates.jsconfig(),
  );
  createFile(
    path.join(projectPath, "fletbox.config.json"),
    templates.fletboxConfig(otaUrl || undefined),
  );
  createFile(path.join(projectPath, ".gitignore"), templates.gitignore());
  createFile(
    path.join(projectPath, ".github/workflows/build.yml"),
    templates.githubWorkflow(finalName, siteUrl),
  );
  createFile(
    path.join(projectPath, ".github/workflows/build-native.yml"),
    templates.nativeWorkflow(finalName),
  );
  createFile(
    path.join(projectPath, "README.md"),
    templates.readme(finalName, template, appId),
  );
  createFile(path.join(projectPath, "run.sh"), templates.runSh());
  createFile(
    path.join(projectPath, "service-worker.js"),
    templates.serviceWorkerJs(),
  );
  createFile(
    path.join(projectPath, "manifest.json"),
    templates.manifest(finalName),
  );
  createFile(
    path.join(projectPath, "capacitor.config.json"),
    templates.capacitorConfig(finalName, appId),
  );
  createFile(
    path.join(projectPath, "scripts/sync-android-icons.mjs"),
    templates.syncAndroidIconsScript(),
  );
  createFile(
    path.join(projectPath, "scripts/sync-ios-assets.mjs"),
    templates.syncIOSAssetsScript(),
  );
  createFile(
    path.join(projectPath, "src/database/themes.js"),
    templates.themesJs(),
  );

  // Copy bundled Material Icons fonts from the package's own src/fonts/ directory.
  // The package ships the fonts so projects work offline without an extra install step.
  const sourcePackageDir = path.join(__dirname, "..", "..");
  const sourceFontsDir = path.join(sourcePackageDir, "src/fonts");
  const destFontsDir = path.join(projectPath, "src/assets/fonts");
  if (fs.existsSync(sourceFontsDir)) {
    const iconsCss = path.join(sourceFontsDir, "icons.css");
    const woff = path.join(sourceFontsDir, "MaterialIcons-Regular.woff2");
    if (fs.existsSync(iconsCss))
      copyFile(iconsCss, path.join(destFontsDir, "icons.css"));
    if (fs.existsSync(woff))
      copyFile(woff, path.join(destFontsDir, "MaterialIcons-Regular.woff2"));
  }

  const sourceAssetsDir = path.join(sourcePackageDir, "src/assets");
  const appAssetsDir = path.join(projectPath, "src/assets");
  for (const icon of [
    "icon-192.png",
    "icon-192-maskable.png",
    "icon-512.png",
    "icon-512-maskable.png",
  ]) {
    const source = path.join(sourceAssetsDir, icon);
    if (!fs.existsSync(source)) {
      throw new Error(`Required Flet-Box app icon is missing: ${source}`);
    }
    copyFile(source, path.join(appAssetsDir, icon));
  }
  const sourceLogo = path.join(sourceAssetsDir, "icon-1024-maskable.png");
  if (!fs.existsSync(sourceLogo)) {
    throw new Error(`Required Capacitor logo is missing: ${sourceLogo}`);
  }
  copyFile(sourceLogo, path.join(projectPath, "assets/logo.png"));

  // Generate screens and components according to the chosen template.
  if (template === "blank") {
    createFile(path.join(projectPath, "src/app.js"), templates.blankAppJs());
  } else {
    // All non-blank templates share these three starter screens.
    createFile(
      path.join(projectPath, "src/screens/RootScreen.js"),
      templates.rootScreenJs(),
    );
    createFile(
      path.join(projectPath, "src/screens/HomeScreen.js"),
      templates.homeScreenJs(),
    );
    createFile(
      path.join(projectPath, "src/screens/AboutScreen.js"),
      templates.aboutScreenJs(),
    );
    // Barrel export so app.js and screens can import all screens from one place.
    createFile(
      path.join(projectPath, "src/screens/index.js"),
      templates.screensIndexJs(template),
    );
    if (template === "adaptive") {
      createFile(
        path.join(projectPath, "src/screens/ProfileScreen.js"),
        templates.profileScreenJs(),
      );
    }
    // Layout components (skipped for blank).
    if (template !== "blank") {
      createFile(
        path.join(projectPath, "src/components/layouts/AppBarComponent.js"),
        templates.appBarComponentJs(),
      );
      if (template === "full" || template === "adaptive") {
        createFile(
          path.join(projectPath, "src/components/layouts/BottomNav.js"),
          templates.bottomNavJs(),
        );
      }
      if (template === "sidebar" || template === "adaptive") {
        createFile(
          path.join(projectPath, "src/components/layouts/Sidebar.js"),
          templates.sidebarJs(),
        );
      }
      // Use the simpler, non-parameterised DrawerMenu for the basic template;
      // all other templates get the modular version that accepts a custom items array.
      if (template === "basic") {
        createFile(
          path.join(projectPath, "src/components/layouts/DrawerMenu.js"),
          templates.drawerMenuJs(),
        );
      } else {
        createFile(
          path.join(projectPath, "src/components/layouts/DrawerMenu.js"),
          templates.drawerMenuModularJs(),
        );
      }
    }
    // Write the template-specific app entry point.
    switch (template) {
      case "basic":
        createFile(
          path.join(projectPath, "src/app.js"),
          templates.basicAppJs(),
        );
        break;
      case "full":
        createFile(path.join(projectPath, "src/app.js"), templates.fullAppJs());
        break;
      case "sidebar":
        createFile(
          path.join(projectPath, "src/app.js"),
          templates.sidebarAppJs(),
        );
        break;
      case "adaptive":
        createFile(
          path.join(projectPath, "src/app.js"),
          templates.adaptiveAppJs(),
        );
        break;
      default:
        createFile(
          path.join(projectPath, "src/app.js"),
          templates.basicAppJs(),
        );
    }
  }

  // ---------------------------------------------------------------------------
  // AI agent contract (AGENTS.md + pointers + memory + checker)
  // ---------------------------------------------------------------------------
  // Written into every app so an AI editing it looks APIs up instead of inventing
  // them, and has a machine gate that proves it right or wrong offline.
  const pkgVersion = (() => {
    try {
      return JSON.parse(
        fs.readFileSync(path.join(sourcePackageDir, "package.json"), "utf8"),
      ).version;
    } catch {
      return "unknown";
    }
  })();

  createFile(
    path.join(projectPath, "AGENTS.md"),
    templates.agentsMd(finalName, template, pkgVersion),
  );
  createFile(
    path.join(projectPath, ".claude/CLAUDE.md"),
    templates.claudeMd(),
  );
  createFile(
    path.join(projectPath, ".cursor/rules/fletbox.mdc"),
    templates.cursorRules(),
  );

  // The code-generation contract: one file at the package root, copied here
  // byte-for-byte. AGENTS.md is this app's rules; this one is what an agent
  // that *writes* code in the app must obey — the golden rule, the
  // prohibitions, the ten design rules and the verification protocol.
  createFile(path.join(projectPath, CONTRACT_FILE), readContract());

  // The agent skills: `skills/` at the package root is the only source, one
  // kebab-case folder per subject (rules, design, motion, memory). The app gets
  // the same text twice over: once as `skills/` at its own root — the folder any
  // assistant or person reads first, and the one AGENTS.md §0 indexes — and once
  // mirrored into `.claude/skills/` and `.qoder/skills/`, because Claude Code and
  // Qoder load a skill by frontmatter description from those two roots and offer it
  // without being told. Cursor has no skills folder, so each skill also ships as a
  // pointer rule in `.cursor/rules/`. One text, three loaders, never three edits.
  const skillList = skillNames();
  if (skillList.length === 0) {
    console.log(
      c(
        "yellow",
        "⚠️  This flet-box package ships no skills/ folder — the app will have no design or motion contract.",
      ),
    );
  }
  for (const name of skillList) {
    const text = readSkill(name);
    createFile(path.join(projectPath, "skills", name, "SKILL.md"), text);
    createFile(
      path.join(projectPath, ".claude/skills", name, "SKILL.md"),
      text,
    );
    createFile(path.join(projectPath, ".qoder/skills", name, "SKILL.md"), text);
    createFile(
      path.join(projectPath, ".cursor/rules", `${name}.mdc`),
      templates.skillCursorRule(name, { alwaysApply: ALWAYS_ON_SKILLS.has(name) }),
    );
  }
  createFile(
    path.join(projectPath, "scripts/check-ui.mjs"),
    templates.checkUiScript(finalName),
  );

  createFile(
    path.join(projectPath, ".fletbox/memory/MEMORY.md"),
    templates.memoryIndexMd(finalName),
  );
  createFile(
    path.join(projectPath, ".fletbox/memory/notes/baseline.md"),
    templates.memoryBaselineMd(finalName, template, pkgVersion),
  );
  createFile(
    path.join(projectPath, ".fletbox/memory/notes/current-status.md"),
    templates.memoryStatusMd(finalName, template),
  );
  // The metrics log: one row per verify run, so the north metric can say how
  // much of the generated code passed the gate with no correction at all.
  createFile(
    path.join(projectPath, ".fletbox/metrics/generations.md"),
    templates.metricsLogMd(),
  );
  createFile(
    path.join(projectPath, "scripts/check-app.mjs"),
    templates.checkAppScript(finalName),
  );

  // Generate the API cheatsheet from the framework the CLI was installed with.
  // `npm install` is not required here: check-api resolves the package sources
  // from its own copy, so a fresh app can be validated fully offline.
  await checkApi(["--emit-api", "--root", projectPath], {
    print: (line) => console.log(line),
  });

  // The machine-readable twin of the cheatsheet: one entry per widget per prop,
  // each with the engine route, the default and a sample value that the types
  // prove. The agent inside the app writes calls from this file.
  const dump = await unpack(["--all", "--md", "--root", projectPath], { print: () => {} });
  if (dump.exitCode !== 0)
    console.warn(
      c("yellow", "⚠️  Could not generate .fletbox/api/api.json — run `npm run api` after installing."),
    );
  else
    console.log(`   ${c("gray", ".fletbox/api/api.json + api.md — the verified surface, for the agent")}`);

  makeExecutable(path.join(projectPath, "run.sh"));

  console.log(
    `\n${gradient(` ✅ Project "${finalName}" created successfully!`, "#34d399", "#22d3ee")}\n`,
  );

  // Prove the starter code passes the gate the agent will be held to.
  const { exitCode } = await checkApi(["--root", projectPath]);
  if (exitCode !== 0) {
    console.warn(
      c(
        "yellow",
        `⚠️  Starter code reported issues — check-api exited ${exitCode}. Fix them before building on top.`,
      ),
    );
  }

  console.log(`  ${c("brightCyan", "cd")} ${finalName}`);
  console.log(`  ${c("brightCyan", "npm install")}`);
  console.log(`  ${c("brightCyan", "npm run dev")}\n`);
  console.log(`${c("gray", `📱 Template: ${template}`)}`);
  if (otaUrl) {
    console.log(`${c("gray", `⬆️  OTA updates: ${gradient(otaUrl, "#22d3ee", "#38bdf8")}`)}`);
  } else {
    console.log(
      c(
        "gray",
        `⬆️  OTA: ${templates.OTA_PLACEHOLDER_URL} is a placeholder, and the build knows it —\n` +
          `         it derives the real Pages address from the project's \`repository\`/git remote.\n` +
          `         So: push this folder to a public GitHub repo and build, or name the repo now\n` +
          `         with ${c("brightCyan", "flet-box create <name> --repo user/repo")} / edit fletbox.config.json.\n`,
      ),
    );
  }
  console.log(
    c(
      "gray",
      "Android: npm run android:init && npm run android:sync && npm run android:open\n",
    ),
  );
  console.log(
    c(
      "gray",
      "iOS:     npm install && flet-box build ios   (macOS + Xcode + CocoaPods)\n",
    ),
  );
  console.log(
    c(
      "gray",
      "CI:      .github/workflows/build.yml publishes the web to GitHub Pages on every push.\n" +
        `         It goes live at: ${siteUrl || `https://TU-USUARIO.github.io/${finalName}/`}\n` +
        "         Enable it once: Settings → Pages → Source: GitHub Actions. The job prints the URL.\n" +
        "         Android and iOS are manual: .github/workflows/build-native.yml, Run workflow.\n",
    ),
  );
  console.log(
    c(
      "gray",
      "AI:      AGENTS.md is the contract for any assistant editing this app.\n" +
        "         npm run check verifies every widget/prop against the installed package.\n",
    ),
  );
};
