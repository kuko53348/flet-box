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
import { fileURLToPath } from "url";
import { createFile, copyFile, makeExecutable } from "../utils/helpers.js";
import * as templates from "../utils/templates.js";
import { c, banner, gradient } from "../utils/colors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parses the raw CLI arguments passed after the project name to determine
 * which template was requested and whether an explicit name was given.
 *
 * Flag-to-template mapping:
 * - `--adaptive` → `"adaptive"`
 * - `--blank`    → `"blank"`
 * - `--full`     → `"full"`
 * - `--sidebar`  → `"sidebar"`
 * - (none)       → `"basic"` (default)
 *
 * Any non-flag argument (does not start with `--`) is treated as the project name.
 *
 * @param {string[]} args - Raw CLI arguments, may include flags and a project name.
 * @returns {{ template: string, projectName: string|null }}
 */
const parseCreateArgs = (args) => {
  let template = "basic"; // default template
  let projectName = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--adaptive") {
      template = "adaptive";
    } else if (args[i] === "--blank") {
      template = "blank";
    } else if (args[i] === "--full") {
      template = "full";
    } else if (args[i] === "--sidebar") {
      template = "sidebar";
    } else if (!args[i].startsWith("--")) {
      projectName = args[i];
    }
  }
  return { template, projectName };
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
  const { template, projectName: name } = parseCreateArgs([
    projectName,
    ...rawArgs,
  ]);
  const finalName = name || projectName;
  if (!finalName) {
    console.error(c("red", "❌ Project name required"));
    console.log(
      c(
        "gray",
        "Usage: flet-box create <name> [--adaptive|--blank|--full|--sidebar]",
      ),
    );
    process.exit(1);
  }

  const projectPath = path.join(process.cwd(), finalName);
  if (fs.existsSync(projectPath)) {
    console.error(c("red", `❌ Folder "${finalName}" already exists`));
    process.exit(1);
  }

  console.log(banner("📦 Creating project", `${finalName} · ${template}`));

  // Build the list of directories to create.
  // All templates share a common base; non-blank templates add screens/components.
  const commonDirs = ["src", "src/assets/fonts", "src/database"];
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
  createFile(path.join(projectPath, "index.html"), templates.indexHtml());
  createFile(
    path.join(projectPath, "package.json"),
    templates.packageJson(finalName),
  );
  createFile(path.join(projectPath, ".gitignore"), templates.gitignore());
  createFile(
    path.join(projectPath, "README.md"),
    templates.readme(finalName, template),
  );
  createFile(path.join(projectPath, "run.sh"), templates.runSh());
  createFile(
    path.join(projectPath, "service-worker.js"),
    templates.serviceWorkerJs(),
  );
  createFile(path.join(projectPath, "manifest.json"), templates.manifest());
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
    if (template === "adaptive") {
      createFile(
        path.join(projectPath, "src/screens/ProfileScreen.js"),
        templates.profileScreenJs(),
      );
      // Barrel export so app.js can import all screens from one place.
      createFile(
        path.join(projectPath, "src/screens/index.js"),
        templates.screensIndexJs(),
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

  makeExecutable(path.join(projectPath, "run.sh"));

  console.log(
    `\n${gradient(` ✅ Project "${finalName}" created successfully!`, "#34d399", "#22d3ee")}\n`,
  );
  console.log(`  ${c("brightCyan", "cd")} ${finalName}`);
  console.log(`  ${c("brightCyan", "npm install")}`);
  console.log(`  ${c("brightCyan", "npm run dev")}\n`);
  console.log(`${c("gray", `📱 Template: ${template}`)}\n`);
};
