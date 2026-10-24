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
import { c, banner, gradient, section } from "../utils/colors.js";
import { buildBundleConfig, collectAssets, getGitRemoteUrl, resolveAssetPatterns, absoluteShareTags } from "../utils/bundleConfig.js";
import { normaliseManifest, writeSpaFallback } from "../utils/pwaShell.js";
import { INITIAL_VERSION, incrementVersion, isValidVersion } from "../utils/version.js";

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
 *   404.html          ← copy of the shell, so a refresh on a deep link serves the app
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

  // The icon font is a stylesheet, not a bundle input, so it is copied as
  // written. A generated app keeps it in src/assets/fonts (covered above); the
  // framework root keeps it in src/fonts, which is the path its own index.html
  // links — without this the bundled demo 404s the font and every <Icon/> is
  // spelled as text.
  if (fs.existsSync(path.join(srcDir, "fonts"))) {
    fs.cpSync(
      path.join(srcDir, "fonts"),
      path.join(targetDir, "src", "fonts"),
      { recursive: true },
    );
    console.log(c("green", "✅ Copied: src/fonts (icon font)"));
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

  // ---- OTA manifest -------------------------------------------------------
  // Stamp a version header into the bundle (so the deployed app.js is
  // self-describing), then hash the FINAL file and write www/config.json.
  // The running app fetches this manifest to decide whether to self-update.
  const outAppJs = path.join(targetDir, "src", "app.js");
  const pkg = JSON.parse(
    fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"),
  );
  const appVersion = isValidVersion(pkg.version) ? pkg.version : INITIAL_VERSION;
  const builtAt = new Date().toISOString();

  // Visual reference only: createBundle NEVER bumps the version — only
  // `flet-box release` does. Print what each release flag would produce so the
  // next version is visible at build time.
  console.log(section("🔢", `Versión del bundle: ${appVersion}`, "#34d399"));
  console.log(c("gray", "     Qué haría cada release:"));
  for (const [flag, type] of [
    ["--patch", "patch"],
    ["--minor", "minor"],
    ["--major", "major"],
  ]) {
    const next = incrementVersion(appVersion, type);
    console.log(
      `       ${c("cyan", flag.padEnd(8))} ` +
        `${c("gray", appVersion)} ${c("gray", "→")} ` +
        `${gradient(next, "#34d399", "#22d3ee")}`,
    );
  }

  const bundledCode = fs.readFileSync(outAppJs, "utf8");
  const header = `/*! FletBox bundle v${appVersion} · built ${builtAt} */\n`;
  const stampedCode = header + bundledCode;
  fs.writeFileSync(outAppJs, stampedCode);

  // ---- Release assets -----------------------------------------------------
  // `update.assets` in fletbox.config.json lists files the app serves that are
  // not part of the JS bundle (markdown docs, JSON data, images). They are copied
  // into the bundle AND named in config.json with a hash, so an app that updated
  // its bundle by OTA can still fetch the current copy of a file that its
  // packaged build predates.
  const assets = collectAssets(projectRoot, resolveAssetPatterns(projectRoot));
  for (const asset of assets) {
    const from = path.join(projectRoot, asset.path);
    const to = path.join(targetDir, asset.path);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
  if (assets.length) {
    const kb = (assets.reduce((sum, a) => sum + a.size, 0) / 1024).toFixed(0);
    console.log(
      c("green", `✅ Copied: ${assets.length} OTA asset file(s) (${kb} KB)`),
    );
  }

  const bundleConfig = buildBundleConfig({
    projectRoot,
    bundleContent: stampedCode,
    bundlePath: "src/app.js",
    assets,
  });
  fs.writeFileSync(
    path.join(targetDir, "config.json"),
    JSON.stringify(bundleConfig, null, 2) + "\n",
  );
  console.log(
    c("green", "✅ Wrote config.json ") +
      c("gray", `(v${bundleConfig.version} · ${bundleConfig.hash.slice(0, 12)}…)`),
  );
  if (!bundleConfig.update.url) {
    const remote = getGitRemoteUrl(projectRoot);
    console.log(
      "\n" +
        c("yellow", "⚠️  THIS APP DOES NOT SUPPORT OTA UPDATES.") +
        "\n" +
        c(
          "gray",
          "    The bundle still works: installed apps will run the version that is inside this build (the local/current bundle).",
        ) +
        "\n" +
        c(
          "gray",
          "    OTA activates only once a PUBLIC GitHub repository exists. " +
            (remote
              ? `Your origin remote is: ${c("cyan", remote)}`
              : "No git remote `origin` was found in this project."),
        ) +
        "\n" +
        c("gray", "    To enable OTA updates:") +
        "\n" +
        c("gray", "      1. Create the repository on GitHub (must be PUBLIC and readable).") +
        "\n" +
        c("gray", "      2. Push this project so `origin` is that GitHub repo, then rebuild here.") +
        "\n" +
        c("gray", "         (or set `update.url` in fletbox.config.json / `repository` in package.json)") +
        "\n",
    );
  } else if (/TU-USUARIO|TU-REPO/.test(bundleConfig.update.url)) {
    console.log(
      c(
        "yellow",
        "⚠️ update.url is still the placeholder — OTA points at a fake site. Replace TU-USUARIO/TU-REPO in fletbox.config.json before releasing.",
      ),
    );
  } else {
    console.log(
      c("green", "⬆️  OTA source: ") +
        c("gray", bundleConfig.update.url + " · override with `fletbox.config.json`"),
    );
  }

  // ---- OTA loader ---------------------------------------------------------
  // Ship bin/ota/loader.js verbatim as www/loader.js and rewrite index.html so
  // the module entry is the loader instead of src/app.js. The loader runs first,
  // checks config.json for a newer bundle, and then imports the app. When OTA is
  // disabled (no update URL) the loader still works — it just runs the shipped
  // bundle directly, so wiring it unconditionally keeps the output consistent.
  const loaderSrc = path.join(__dirname, "..", "ota", "loader.js");
  const loaderDest = path.join(targetDir, "loader.js");
  if (fs.existsSync(loaderSrc)) {
    fs.copyFileSync(loaderSrc, loaderDest);
    console.log(c("green", "✅ Wrote loader.js (OTA boot)"));

    const indexFile = path.join(targetDir, "index.html");
    if (fs.existsSync(indexFile)) {
      const html = fs.readFileSync(indexFile, "utf8");
      // Swap the bundled app entry (src="src/app.js" or "./src/app.js") for the
      // loader, preserving any other attributes (e.g. type="module").
      const patched = html.replace(
        /<script\b([^>]*?)\bsrc=(["'])\.?\/?src\/app\.js\2([^>]*)>\s*<\/script>/i,
        (_m, before, _q, after) =>
          `<script${before}src="./loader.js"${after}></script>`,
      );
      if (patched !== html) {
        fs.writeFileSync(indexFile, patched);
        console.log(c("green", "✅ index.html → loads ./loader.js"));
      } else {
        console.log(
          c(
            "yellow",
            "⚠️ Could not find the app.js <script> in index.html to wire the loader — OTA boot not installed.",
          ),
        );
      }
    }
  }

  // ---- Social preview card --------------------------------------------------
  // A scraper fetches the HTML and resolves the tags itself; it does not run the
  // app and does not treat `./assets/hero.jpg` as the page origin does. Left
  // relative, every share of the site posts a headline with no picture — and the
  // site looks perfect to anyone who opens it, so nobody notices. The base is the
  // URL OTA already derived, so the card points where the bundle is actually
  // reachable, and only the built copy changes: `index.html` in the project stays
  // host-agnostic so the same folder still runs on :8000 and through a tunnel.
  const shareIndex = path.join(targetDir, "index.html");
  if (fs.existsSync(shareIndex) && bundleConfig.update?.url) {
    const html = fs.readFileSync(shareIndex, "utf8");
    const stamped = absoluteShareTags(html, bundleConfig.update.url);
    if (stamped !== html) {
      fs.writeFileSync(shareIndex, stamped);
      console.log(c("green", `✅ share card → absolute images at ${bundleConfig.update.url}`));
    }
  }

  // ---- Installable, deep-linkable output ----------------------------------
  // Both corrections belong to the deployable folder, not to the project: the
  // app's own manifest.json stays host-agnostic and this bundle is what a static
  // host serves. See bin/utils/pwaShell.js for the two failure modes.
  const manifestFixes = normaliseManifest(targetDir);
  if (manifestFixes.length) {
    console.log(c("green", `✅ manifest.json → ${manifestFixes.length} correction(s)`));
    for (const fix of manifestFixes) console.log(c("gray", `      ${fix}`));
  }

  if (writeSpaFallback(targetDir)) {
    console.log(
      c(
        "green",
        "✅ 404.html → copy of the shell (hosts without SPA rewrites now serve the app on a refresh)",
      ),
    );
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
