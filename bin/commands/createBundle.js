// bin/commands/createBundle.js
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { c } from "../utils/colors.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para copiar carpetas recursivamente
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

export const createBundle = async () => {
  console.log(`\n${c("cyan", "📦 FletBox Bundle Command")}\n`);

  const projectRoot = process.cwd();
  const distDir = path.join(projectRoot, "dist");
  const srcDir = path.join(projectRoot, "src");
  const appJs = path.join(srcDir, "app.js");
  const nodeModulesDir = path.join(projectRoot, "node_modules");
  const fletBoxDir = path.join(nodeModulesDir, "flet-box");

  // Verificar que estamos en un proyecto FletBox
  if (!fs.existsSync(appJs)) {
    console.error(c("red", "❌ Not a FletBox project"));
    console.log(c("gray", "Make sure you are in a project with src/app.js"));
    process.exit(1);
  }

  // Verificar si flet-box está instalado, si no, copiarlo
  if (!fs.existsSync(fletBoxDir)) {
    console.log(
      c("yellow", "⚠️ flet-box not found in node_modules, copying..."),
    );

    if (!fs.existsSync(nodeModulesDir)) {
      fs.mkdirSync(nodeModulesDir, { recursive: true });
    }

    const sourceFletBox = path.join(__dirname, "..", "..");
    fs.mkdirSync(fletBoxDir, { recursive: true });

    // Copiar src/
    const sourceSrc = path.join(sourceFletBox, "src");
    const destSrc = path.join(fletBoxDir, "src");
    if (fs.existsSync(sourceSrc)) {
      copyFolderSync(sourceSrc, destSrc);
      console.log(c("green", "✅ Copied flet-box/src"));
    }

    // Copiar package.json
    const sourcePackage = path.join(sourceFletBox, "package.json");
    if (fs.existsSync(sourcePackage)) {
      fs.copyFileSync(sourcePackage, path.join(fletBoxDir, "package.json"));
      console.log(c("green", "✅ Copied flet-box/package.json"));
    }
  }

  // Crear estructura de carpetas
  console.log(c("blue", "\n📁 Creating directory structure..."));
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  const distSrcDir = path.join(distDir, "src");
  const distAssetsFontsDir = path.join(distDir, "src", "assets", "fonts");
  fs.mkdirSync(distSrcDir, { recursive: true });
  fs.mkdirSync(distAssetsFontsDir, { recursive: true });

  // Copiar index.html
  const indexHtml = path.join(projectRoot, "index.html");
  if (fs.existsSync(indexHtml)) {
    fs.copyFileSync(indexHtml, path.join(distDir, "index.html"));
    console.log(c("green", "✅ Copied: index.html"));
  } else {
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
    fs.writeFileSync(path.join(distDir, "index.html"), defaultHtml);
    console.log(c("green", "✅ Created: index.html"));
  }

  // Copiar run.sh si existe
  const runSh = path.join(projectRoot, "run.sh");
  if (fs.existsSync(runSh)) {
    fs.copyFileSync(runSh, path.join(distDir, "run.sh"));
    fs.chmodSync(path.join(distDir, "run.sh"), 0o755);
    console.log(c("green", "✅ Copied: run.sh"));
  }

  // Copiar service-worker.js si existe
  const sw = path.join(projectRoot, "service-worker.js");
  if (fs.existsSync(sw)) {
    fs.copyFileSync(sw, path.join(distDir, "service-worker.js"));
    console.log(c("green", "✅ Copied: service-worker.js"));
  }

  // Copiar assets/fonts
  const fontsDir = path.join(srcDir, "assets", "fonts");
  if (fs.existsSync(fontsDir)) {
    const iconsCss = path.join(fontsDir, "icons.css");
    const woff = path.join(fontsDir, "MaterialIcons-Regular.woff2");
    if (fs.existsSync(iconsCss)) {
      fs.copyFileSync(iconsCss, path.join(distAssetsFontsDir, "icons.css"));
      console.log(c("green", "✅ Copied: icons.css"));
    }
    if (fs.existsSync(woff)) {
      fs.copyFileSync(
        woff,
        path.join(distAssetsFontsDir, "MaterialIcons-Regular.woff2"),
      );
      console.log(c("green", "✅ Copied: MaterialIcons-Regular.woff2"));
    }
  }

  // Bundle con esbuild (incluyendo flet-box en el bundle)
  console.log(c("blue", "\n📦 Bundling app.js with esbuild..."));

  try {
    let esbuildCmd = "esbuild";
    try {
      execSync("esbuild --version", { stdio: "pipe" });
    } catch {
      esbuildCmd = "npx esbuild";
      console.log(c("yellow", "⚠️ Using npx esbuild"));
    }

    // Añadir node_modules a la ruta de resolución
    const bundleCmd = `${esbuildCmd} src/app.js \
            --bundle \
            --outfile=dist/src/app.js \
            --format=esm \
            --minify \
            --tree-shaking=true \
            --target=es2020 \
            --external:*.css \
            --external:*.woff2 \
            --resolve-extensions=.js,.json`;

    execSync(bundleCmd, {
      stdio: "inherit",
      env: { ...process.env, NODE_PATH: nodeModulesDir },
    });

    const stats = fs.statSync(path.join(distDir, "src", "app.js"));
    const sizeKB = (stats.size / 1024).toFixed(1);

    console.log(`\n${c("green", "✅ Bundle complete!")}`);
    console.log(c("gray", `📊 Size: ${sizeKB} KB (includes flet-box)`));
    console.log(c("gray", "📁 Output: dist/"));
    console.log(c("gray", "🚀 To preview: cd dist && ./run.sh"));
  } catch (error) {
    console.error(c("red", "❌ Esbuild failed:"), error.message);
    process.exit(1);
  }
};
