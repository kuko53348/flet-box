// bin/commands/createBundle.js
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { c, banner, gradient } from "../utils/colors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Recursively copy a folder
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

export const createBundle = async (targetArg) => {
  const TARGET = targetArg || "www";
  console.log(banner("📦 FletBox Bundle", TARGET + "/"));

  const projectRoot = process.cwd();
  const targetDir = path.join(projectRoot, TARGET);
  const srcDir = path.join(projectRoot, "src");
  const appJs = path.join(srcDir, "app.js");
  const nodeModulesDir = path.join(projectRoot, "node_modules");
  const fletBoxDir = path.join(nodeModulesDir, "flet-box");

  // Make sure we are inside a FletBox project
  if (!fs.existsSync(appJs)) {
    console.error(c("red", "❌ Not a FletBox project"));
    console.log(c("gray", "Make sure you are in a project with src/app.js"));
    process.exit(1);
  }

  // Check if flet-box is installed; otherwise copy it
  if (!fs.existsSync(fletBoxDir)) {
    console.log(
      c("yellow", "⚠️ flet-box not found in node_modules, copying..."),
    );

    if (!fs.existsSync(nodeModulesDir)) {
      fs.mkdirSync(nodeModulesDir, { recursive: true });
    }

    const sourceFletBox = path.join(__dirname, "..", "..");
    fs.mkdirSync(fletBoxDir, { recursive: true });

    // Copy src/
    const sourceSrc = path.join(sourceFletBox, "src");
    const destSrc = path.join(fletBoxDir, "src");
    if (fs.existsSync(sourceSrc)) {
      copyFolderSync(sourceSrc, destSrc);
      console.log(c("green", "✅ Copied flet-box/src"));
    }

    // Copy package.json
    const sourcePackage = path.join(sourceFletBox, "package.json");
    if (fs.existsSync(sourcePackage)) {
      fs.copyFileSync(sourcePackage, path.join(fletBoxDir, "package.json"));
      console.log(c("green", "✅ Copied flet-box/package.json"));
    }
  }

  // Make sure esbuild is available
  try {
    execSync("npx --no-install esbuild --version", { stdio: "pipe" });
  } catch {
    console.log(c("yellow", "📦 Installing esbuild (devDependency)…"));
    execSync("npm install --save-dev esbuild", { stdio: "inherit" });
  }

  // Create a clean structure
  console.log(c("blue", "\n📁 Creating structure..."));
  fs.rmSync(targetDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(targetDir, "src"), { recursive: true });
  fs.mkdirSync(path.join(targetDir, "assets"), { recursive: true });

  // Root static files (PWA + preview)
  for (const file of ["index.html", "manifest.json", "run.sh", "service-worker.js"]) {
    const src = path.join(projectRoot, file);
    if (fs.existsSync(src)) {
      const dest = path.join(targetDir, file);
      fs.copyFileSync(src, dest);
      if (file === "run.sh") fs.chmodSync(dest, 0o755);
      console.log(c("green", `✅ Copied: ${file}`));
    }
  }

  // Si no hay index.html, usar uno por defecto
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

  // Assets: iconos PWA + fuentes de iconos
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

  // CSS global (lo carga index.html)
  const globalCss = path.join(srcDir, "styles", "global.css");
  if (fs.existsSync(globalCss)) {
    fs.mkdirSync(path.join(targetDir, "src", "styles"), { recursive: true });
    fs.copyFileSync(globalCss, path.join(targetDir, "src", "styles", "global.css"));
    console.log(c("green", "✅ Copied: global.css"));
  }

  // Bundle with esbuild (including flet-box in the bundle)
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
  // The newline is for readability; execSync runs it as a single shell command
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

  // App source code (required by the "View code" button)
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