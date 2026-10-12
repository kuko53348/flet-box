/**
 * @file bin/utils/bundleConfig.js
 * @description Builds the OTA `config.json` manifest that ships inside a
 * FletBox bundle (`www/config.json`).
 *
 * The manifest is what a running app fetches to decide whether an update is
 * available: it carries the app version, a sha256 of the bundle, the build
 * timestamp, and update policy (channel / mode / mandatory / notes). The
 * comparison that drives the OTA is the `hash` — the version is a human label.
 *
 * Update source URL resolution order:
 *   1. `update.url` in `fletbox.config.json` (explicit wins)
 *   2. derived from the `repository` field of the project's package.json,
 *      mapped to its GitHub Pages URL: https://<user>.github.io/<repo>/
 *   3. derived from the CURRENT PROJECT's git remote `origin` (when it is a
 *      GitHub URL), so a bundle always points at the project itself — never at
 *      the flet-box package that happens to be installed
 *   4. null (OTA disabled — the bundle just runs what shipped in it)
 */

import crypto from "crypto";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { INITIAL_VERSION, isValidVersion } from "./version.js";

/**
 * Computes the sha256 hex digest of a string or buffer.
 *
 * @param {string|Buffer} content
 * @returns {string} `"<hex>"`
 */
export const sha256 = (content) =>
  crypto.createHash("sha256").update(content).digest("hex");

/**
 * Reads and JSON-parses a file, returning `fallback` when it is missing or
 * cannot be parsed. Never throws.
 *
 * @param {string} file - Absolute path.
 * @param {*} fallback - Value returned on any failure.
 * @returns {*}
 */
const readJsonSafe = (file, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
};

/**
 * Extracts `user` and `repo` from a GitHub repository reference.
 * Accepts the shapes npm produces/accepts:
 *   - "git+https://github.com/user/repo.git"
 *   - "https://github.com/user/repo"
 *   - "git@github.com:user/repo.git"
 *   - "user/repo"
 *
 * @param {string} repository - The `repository` value (string form).
 * @returns {{ user: string, repo: string } | null}
 */
export const parseGithubRepo = (repository) => {
  if (!repository || typeof repository !== "string") return null;
  const match = repository.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
  if (match) return { user: match[1], repo: match[2] };
  const short = repository.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (short) return { user: short[1], repo: short[2] };
  return null;
};

/**
 * Resolves the OTA update URL for a project.
 *
 * @param {string} projectRoot - Absolute path to the project root.
 * @returns {string|null} A base URL ending in "/", or null when it cannot be
 *   determined (OTA disabled).
 */
export const resolveUpdateUrl = (projectRoot) => {
  const fletboxConfig = readJsonSafe(
    path.join(projectRoot, "fletbox.config.json"),
    {},
  );

  // 1. Explicit configuration always wins.
  const explicit = fletboxConfig?.update?.url;
  if (typeof explicit === "string" && explicit.trim()) {
    return explicit.endsWith("/") ? explicit : `${explicit}/`;
  }

  // 2. Derive from package.json repository → GitHub Pages URL.
  const pkg = readJsonSafe(path.join(projectRoot, "package.json"), {});
  const repository =
    typeof pkg.repository === "string"
      ? pkg.repository
      : pkg.repository?.url || null;
  const gh = parseGithubRepo(repository);
  if (gh) return `https://${gh.user}.github.io/${gh.repo}/`;

  // 3. Derive from the current project's git remote. This guarantees the
  // bundle targets the project it was built in, not the flet-box framework
  // that may be present as a dependency elsewhere.
  const remote = getGitRemoteUrl(projectRoot);
  const ghRemote = parseGithubRepo(remote);
  if (ghRemote) return `https://${ghRemote.user}.github.io/${ghRemote.repo}/`;

  return null;
};

/**
 * Returns the `origin` remote URL of the git repo at `projectRoot`, or null.
 *
 * @param {string} projectRoot - Absolute path to the project root.
 * @returns {string|null}
 */
export const getGitRemoteUrl = (projectRoot) => {
  try {
    const out = execSync("git remote get-url origin", {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 5000,
    });
    return out.trim() || null;
  } catch {
    return null;
  }
};

/**
 * Builds the OTA config manifest object for a freshly written bundle.
 *
 * @param {object} opts
 * @param {string} opts.projectRoot - Absolute path to the project root.
 * @param {string|Buffer} opts.bundleContent - Exact bytes of the shipped
 *   `app.js` (after the version header is stamped), used for the hash + size.
 * @param {string} [opts.bundlePath="src/app.js"] - Bundle path, relative to
 *   the bundle root, as the loader should request it.
 * @returns {object} The config.json manifest.
 */
export const buildBundleConfig = ({
  projectRoot,
  bundleContent,
  bundlePath = "src/app.js",
}) => {
  const pkg = readJsonSafe(path.join(projectRoot, "package.json"), {});
  const fletboxConfig = readJsonSafe(
    path.join(projectRoot, "fletbox.config.json"),
    {},
  );
  const updateCfg = fletboxConfig.update || {};

  const version = isValidVersion(pkg.version) ? pkg.version : INITIAL_VERSION;
  const content = Buffer.from(bundleContent);

  return {
    version,
    hash: sha256(content),
    builtAt: new Date().toISOString(),
    bundle: bundlePath,
    size: content.length,
    // Minimum native (APK/IPA) version this bundle is compatible with. When the
    // installed native shell is older, the loader must fall back to a store
    // update instead of applying the OTA. Defaults to "0.0.0" (always compatible).
    minNativeVersion:
      typeof updateCfg.minNativeVersion === "string"
        ? updateCfg.minNativeVersion
        : "0.0.0",
    update: {
      // Where the app fetches config.json + bundle from. null disables OTA.
      url: resolveUpdateUrl(projectRoot),
      mode: updateCfg.mode === "auto" ? "auto" : "prompt",
      channel: typeof updateCfg.channel === "string" ? updateCfg.channel : "stable",
      mandatory: updateCfg.mandatory === true,
      notes: typeof updateCfg.notes === "string" ? updateCfg.notes : "",
    },
  };
};
