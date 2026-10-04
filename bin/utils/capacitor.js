/**
 * @file bin/utils/capacitor.js
 * @description Shared plumbing for the Capacitor build commands (`build android`,
 * `build ios`). Both commands do the same three things before they touch a
 * native toolchain: validate the project, make sure the generated npm
 * dependencies exist, and run child processes with readable failures.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { c } from "./colors.js";

/**
 * Runs a command synchronously, inheriting stdio so the user watches Gradle,
 * CocoaPods or Xcode do their work.
 *
 * @param {string} command - Executable to run.
 * @param {string[]} args - Arguments for the executable.
 * @param {string} cwd - Working directory.
 * @param {string} label - Human readable name used in error messages.
 * @param {NodeJS.ProcessEnv} [env] - Environment for the child process.
 * @returns {void}
 * @throws {Error} When the command cannot start or exits with a non-zero code.
 */
export const run = (command, args, cwd, label, env = process.env) => {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
    env,
  });

  if (result.error) {
    throw new Error(`${label} could not start: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(
      `${label} failed with exit code ${result.status ?? "unknown"}`,
    );
  }
};

/**
 * Checks that a command exists and can report a version.
 *
 * @param {string} command - Executable name, resolved through PATH.
 * @param {string[]} [args] - Arguments used as the probe (defaults to `--version`).
 * @returns {boolean} `true` when the probe exits successfully.
 */
export const commandExists = (command, args = ["--version"]) => {
  const result = spawnSync(command, args, { stdio: "ignore" });
  return !result.error && result.status === 0;
};

const hasPackage = (projectRoot, packageName) =>
  fs.existsSync(
    path.join(projectRoot, "node_modules", ...packageName.split("/"), "package.json"),
  );

/**
 * Installs the project npm dependencies when any of the packages the native
 * build needs are missing. Projects created by `flet-box create` already declare
 * them, this only repairs projects whose `node_modules` was never installed.
 *
 * @param {string} projectRoot - Absolute path of the project.
 * @param {string[]} requiredPackages - Packages that must be resolvable.
 * @returns {void}
 */
export const ensureNpmDependencies = (projectRoot, requiredPackages) => {
  const missingPackages = requiredPackages.filter(
    (packageName) => !hasPackage(projectRoot, packageName),
  );
  if (missingPackages.length === 0) return;

  console.log(
    c(
      "yellow",
      `\n📦 Installing project dependencies: ${missingPackages.join(", ")}`,
    ),
  );
  run("npm", ["install"], projectRoot, "npm dependency installation");

  const stillMissing = requiredPackages.filter(
    (packageName) => !hasPackage(projectRoot, packageName),
  );
  if (stillMissing.length > 0) {
    throw new Error(
      `Dependencies are still missing after npm install: ${stillMissing.join(", ")}.`,
    );
  }
};

/**
 * Validates that the current directory is a FletBox project scaffolded for
 * Capacitor, and returns its parsed `package.json`.
 *
 * @param {string[]} requiredScripts - npm scripts the caller needs, for example `["ios:init"]`.
 * @returns {{ projectRoot: string, projectPackage: object }} Project root and manifest.
 * @throws {Error} When the folder is not a Capacitor-enabled FletBox project.
 */
export const assertCapacitorProject = (requiredScripts) => {
  const projectRoot = process.cwd();
  const packagePath = path.join(projectRoot, "package.json");
  const capacitorConfig = [
    "capacitor.config.json",
    "capacitor.config.ts",
    "capacitor.config.js",
  ].some((file) => fs.existsSync(path.join(projectRoot, file)));

  if (!fs.existsSync(path.join(projectRoot, "src", "app.js"))) {
    throw new Error("Run this inside a Flet-Box project with src/app.js.");
  }
  if (!fs.existsSync(packagePath) || !capacitorConfig) {
    throw new Error(
      "This project is not configured for Capacitor. Create it with a recent version of Flet-Box.",
    );
  }

  let projectPackage;
  try {
    projectPackage = JSON.parse(fs.readFileSync(packagePath, "utf8"));
  } catch (error) {
    throw new Error(`Could not read package.json: ${error.message}`);
  }

  const missingScripts = requiredScripts.filter(
    (script) => !projectPackage?.scripts?.[script],
  );
  if (missingScripts.length > 0) {
    throw new Error(
      `Missing npm scripts: ${missingScripts.join(", ")}. Recreate the project with a recent version of Flet-Box.`,
    );
  }

  return { projectRoot, projectPackage };
};
