/**
 * @file bin/commands/createBundle.js
 * @description Builds a production-ready, self-contained bundle of a FletBox project.
 *
 * The command uses esbuild to tree-shake and minify the entire app (including the
 * flet-box dependency) into a single `src/app.js` file inside the target directory.
 * PWA assets (service worker, manifest, icons, fonts) are copied alongside it so
 * the output folder can be served or deployed as-is.
 *
 * If flet-box is not present in `node_modules` (e.g. a fresh clone without
 * `npm install`) the package is copied from the CLI's own source tree so the build
 * can proceed without an internet connection.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { c, banner, gradient } from "../utils/colors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Recursively copies a directory tree from `src` to `dest`, creating any
 * missing intermediate directories.  Mirrors the behaviour of `cp -R`.
 *
 * @param {string} src  - Absolute path to the source directory.
 * @param {string} dest - Absolute path to the destination directory.
 * @returns {void}
 */
const copyFolderSync = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyFolderSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

/**
 * Builds the current FletBox project into a deployable bundle directory.
 *
 * Output structure:
 * ```
 * <target>/
 *   index.html
 *   manifest.json
 *   service-worker.js
 *   run.sh
 *   assets/           ← PWA icons (duplicate of src/assets for root-relative paths)
 *   src/
 *     app.js          ← single minified bundle (esbuild)
 *     assets/         ← fonts + icons
 *     styles/         ← global.css (if present)
 *     screens/        ← source files (used by "View code" feature)
 *     components/
 *     modules/
 *     database/
 * ```
 *
 * @async
 * @param {string|undefined} targetArg - Target directory name relative to the project
 *   root.  Defaults to `"www"` when omitted.
 * @returns {Promise<void>}
 */
export const createBundle = async (targetArg) => {
  const TARGET = targetArg || "www";
  console.log(banner("📦 FletBox Bundle", TARGET + "/"));

  const projectRoot = process.cwd();
  const targetDir = path.join(projectRoot, TARGET);
  const srcDir = path.join(projectRoot, "src");
  const appJs = path.join(srcDir, "app.js");
  const nodeModulesDir = path.join(projectRoot, "node_modules");
  const fletBoxDir = path.join(nodeModulesDir, "flet-box");

  // Guard: must be run from within a FletBox project.
  if (!fs.existsSync(appJs)) {
    console.error(c("red", "❌ Not a FletBox project"));
    console.log(c("gray", "Make sure you are in a project with src/app.js"));
    process.exit(1);
  }

  // If flet-box is not installed, copy it from the CLI package so we can bundle
  // without requiring `npm install` first (useful in offline / CI environments).
  if (!fs.existsSync(fletBoxDir)) {
    console.log(
      c("yellow", "⚠️ flet-box not found in node_modules, copying..."),
    );

    if (!fs.existsSync(nodeModulesDir)) {
      fs.mkdirSync(nodeModulesDir, { recursive: true });
    }

    const sourceFletBox = path.join(__dirname, "..", "..");
    fs.mkdirSync(fletBoxDir, { recursive: true });

    // Copy src/ from the CLI package into node_modules/flet-box/src/.
    const sourceSrc = path.join(sourceFletBox, "src");
    const destSrc = path.join(fletBoxDir, "src");
    if (fs.existsSync(sourceSrc)) {
      copyFolderSync(sourceSrc, destSrc);
      console.log(c("green", "✅ Copied flet-box/src"));
    }

    // Copy package.json so esbuild can resolve the package correctly.
    const sourcePackage = path.join(sourceFletBox, "package.json");
    if (fs.existsSync(sourcePackage)) {
      fs.copyFileSync(sourcePackage, path.join(fletBoxDir, "package.json"));
      console.log(c("green", "✅ Copied flet-box/package.json"));
    }
  }

  // Ensure esbuild is available; install it as a devDependency if not.
  try {
    execSync("npx --no-install esbuild --version", { stdio: "pipe" });
  } catch {
    console.log(c("yellow", "📦 Installing esbuild (devDependency)…"));
    execSync("npm install --save-dev esbuild", { stdio: "inherit" });
  }

  // Wipe and recreate the target directory for a clean, reproducible output.
  console.log(c("blue", "\n📁 Creating structure..."));
  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(targetDir, "src"), { recursive: true });
  fs.mkdirSync(path.join(targetDir, "assets"), { recursive: true });

  // Copy root-level PWA and preview files to the bundle root.
  for (const file of ["index.html", "manifest.json", "run.sh", "service-worker.js"]) {
    const src = path.join(projectRoot, file);
    if (fs.existsSync(src)) {
      const dest = path.join(targetDir, file);
      fs.copyFileSync(src, dest);
      // run.sh must be executable so `bash run.sh` works without chmod by the user.
      if (file === "run.sh") fs.chmodSync(dest, 0o755);
      console.log(c("green", `✅ Copied: ${file}`));
    }
  }

  // Provide a minimal fallback index.html when the project doesn't have one
  // (e.g. blank template that hasn't been customised yet).
  if (!fs.existsSync(path.join(targetDir, "index.html"))) {
    const defaultHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./src/assets/fonts/icons.css">
    <title>FletBox App</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, sans-serif; }
        #root { width: 100%; height: 100vh; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="./src/app.js"></script>
</body>
</html>`;
    fs.writeFileSync(path.join(targetDir, "index.html"), defaultHtml);
    console.log(c("green", "✅ Created: index.html"));
  }

  // Copy assets (PWA icons + icon fonts) to both src/assets and the root assets/
  // directory so that both relative paths used in index.html resolve correctly.
  if (fs.existsSync(path.join(srcDir, "assets"))) {
    fs.cpSync(
      path.join(srcDir, "assets"),
      path.join(targetDir, "src", "assets"),
      { recursive: true },
    );
    fs.cpSync(
      path.join(srcDir, "assets"),
      path.join(targetDir, "assets"),
      { recursive: true },
    );
    console.log(c("green", "✅ Copied: src/assets (fonts + PWA icons)"));
  }

  // Copy global CSS (loaded directly by index.html, not bundled by esbuild).
  const globalCss = path.join(srcDir, "styles", "global.css");
  if (fs.existsSync(globalCss)) {
    fs.mkdirSync(path.join(targetDir, "src", "styles"), { recursive: true });
    fs.copyFileSync(globalCss, path.join(targetDir, "src", "styles", "global.css"));
    console.log(c("green", "✅ Copied: global.css"));
  }

  // Bundle the entire application (app + flet-box) into a single minified ESM file.
  // --external:*.css and --external:*.woff2 prevent esbuild from trying to inline
  // binary assets, which would break the output or inflate the bundle size.
  console.log(c("blue", "\n📦 Bundling app.js (esbuild + tree-shaking)..."));

  const bundleCmd = [
    "npx esbuild src/app.js",
    "--bundle",
    `--outfile=${TARGET}/src/app.js`,
    "--format=esm",
    "--minify",
    "--tree-shaking=true",
    "--target=es2020",
    "--define:FLETBOX_DEV=false",
    "--external:*.css",
    "--external:*.woff2",
    "--resolve-extensions=.js,.json",
  ].join(" \n    ");
  // The newlines are for readability only; join them back before passing to the shell.
  const cmd = bundleCmd.replace(/\n\s*/g, " ");

  try {
    execSync(cmd, {
      stdio: "inherit",
      env: { ...process.env, NODE_PATH: nodeModulesDir },
    });
  } catch (error) {
    console.error(c("red", "❌ Esbuild failed:"), error.message);
    process.exit(1);
  }

  // Preserve the app source tree so the in-app "View code" feature can read it.
  for (const dir of ["modules", "screens", "database", "components"]) {
    const src = path.join(srcDir, dir);
    if (fs.existsSync(src)) {
      copyFolderSync(src, path.join(targetDir, "src", dir));
    }
  }

  const stats = fs.statSync(path.join(targetDir, "src", "app.js"));
  const sizeKB = (stats.size / 1024).toFixed(1);

  console.log(
    `\n${gradient(" ✅ Bundle complete! ", "#34d399", "#22d3ee")}${c("gray", `(${sizeKB} KB — single app.js)`)}`,
  );
  console.log(c("gray", `      📁 Output: ${gradient(TARGET + "/", "#8b5cf6", "#d946ef")}`));
  console.log(c("gray", `      🚀 Try: ${gradient(`cd ${TARGET} && bash run.sh`, "#22d3ee", "#38bdf8")}`));
  console.log(c("gray", `      ⚡ Or also: ${gradient(`flet-box run-bundle ${TARGET === "www" ? "" : TARGET}`.trim(), "#22d3ee", "#38bdf8")}`));
};
