#!/usr/bin/env node
/**
 * @file check-app-types.mjs
 * @description
 * Guard for the autocomplete a generated app is promised.
 *
 * `flet-box create` writes a `jsconfig.json`, and the editor's own JavaScript
 * language service reads it over the package's `.d.ts`. That promise only holds
 * if the starter code and the declarations agree: the first draft of the config
 * turned `npm run create` into seventeen red squiggles, because `Column({ maxWidth })`,
 * `Scaffold({ bottomBar: () => BottomNav() })` and `Chip({ size: 12 })` were all
 * real at runtime and absent from the types. So this script creates every
 * template, runs the real TypeScript checker over `src/`, and requires zero
 * diagnostics — then injects one invented prop to prove the checker still bites.
 *
 * TypeScript is a devDependency and is never shipped: the app installs nothing,
 * the editor brings its own service. When it is not installed this script skips
 * with a notice, the way `scripts/run-browser-tests.mjs` does without puppeteer.
 *
 * Usage:
 *   node scripts/check-app-types.mjs
 *   FLETBOX_TYPESCRIPT=/path/to/typescript node scripts/check-app-types.mjs
 */
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TEMPLATES = ["basic", "full", "adaptive", "sidebar", "blank"];

const require = createRequire(import.meta.url);
const resolveTsc = () => {
  const explicit = process.env.FLETBOX_TYPESCRIPT;
  const packagePath = explicit
    ? path.join(explicit, "lib", "tsc.js")
    : (() => {
        try {
          return path.join(path.dirname(require.resolve("typescript")), "tsc.js");
        } catch {
          return null;
        }
      })();
  return packagePath && fs.existsSync(packagePath) ? packagePath : null;
};

const tsc = resolveTsc();
if (!tsc) {
  console.log(
    "⏭  check-app-types skipped: typescript is not installed.\n" +
      "   Run `npm install` in the framework, or set FLETBOX_TYPESCRIPT to a typescript directory.",
  );
  process.exit(0);
}

let failures = 0;
const fail = (message, detail = "") => {
  failures += 1;
  console.error(`❌ ${message}`);
  if (detail) console.error(detail.split("\n").map((l) => `     ${l}`).join("\n"));
};

/** Runs the real checker; returns { code, output }. */
const typecheck = (appRoot) => {
  try {
    const output = execFileSync(process.execPath, [tsc, "-p", "jsconfig.json"], {
      cwd: appRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { code: 0, output };
  } catch (error) {
    return { code: error.status ?? 1, output: `${error.stdout ?? ""}${error.stderr ?? ""}` };
  }
};

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "fletbox-app-types-"));

for (const template of TEMPLATES) {
  const name = `types-${template}`;
  const appRoot = path.join(scratch, name);
  try {
    execFileSync(
      process.execPath,
      [path.join(repoRoot, "bin", "cli.js"), "create", name, "--template", template, "--quiet"],
      { cwd: scratch, stdio: ["ignore", "pipe", "pipe"] },
    );
  } catch (error) {
    fail(`create --template ${template} failed`, `${error.stdout ?? ""}${error.stderr ?? ""}`);
    continue;
  }

  const configPath = path.join(appRoot, "jsconfig.json");
  if (!fs.existsSync(configPath)) {
    fail(`${template}: create wrote no jsconfig.json — the editor gets no completions`);
    continue;
  }
  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (error) {
    fail(`${template}: jsconfig.json is not parseable JSON`, String(error.message));
    continue;
  }
  if (config.compilerOptions?.checkJs !== true)
    fail(`${template}: jsconfig.json has checkJs off, so a wrong prop is not underlined`);
  if (!JSON.stringify(config.include ?? []).includes("src/"))
    fail(`${template}: jsconfig.json does not include src/`);

  // The package is installed by `npm install`; link the checkout so the run is
  // offline and tests this working tree's declarations, not the published ones.
  const modules = path.join(appRoot, "node_modules");
  fs.mkdirSync(modules, { recursive: true });
  fs.symlinkSync(repoRoot, path.join(modules, "flet-box"), "dir");

  const { code, output } = typecheck(appRoot);
  if (code !== 0) fail(`${template}: the starter does not typecheck`, output.trim());

  // Negative control, once: an invented prop must still be caught, or a checker
  // that silently stopped resolving the package would report a clean app.
  if (template === TEMPLATES[0]) {
    const probe = path.join(appRoot, "src", "__type_probe.js");
    fs.writeFileSync(
      probe,
      'import { Button } from "flet-box";\n\nexport const probe = Button({ text: "x", notARealProp: 1 });\n',
    );
    const after = typecheck(appRoot);
    fs.rmSync(probe);
    if (after.code === 0 || !after.output.includes("notARealProp"))
      fail("the checker no longer bites — an invented prop passed", after.output.trim() || "(no diagnostics)");
  }
}

fs.rmSync(scratch, { recursive: true, force: true });

if (failures > 0) {
  console.error(`\n❌ ${failures} problem(s): the generated app is not type-clean.`);
  process.exit(1);
}
console.log(
  `ok   ${TEMPLATES.length} templates: jsconfig present, checkJs on, and zero diagnostics over src/`,
);
console.log("ok   the checker bites — an invented prop is still an error");
