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
 * The `<meta>` tags a social scraper resolves against its own machine.
 *
 * Facebook, WhatsApp and X do not run the page and do not resolve `./assets/…`
 * the way a browser does, so a relative `og:image` produces a share card with no
 * picture — the silent kind of breakage, because the site itself looks perfect
 * when somebody opens it.
 */
export const SHARE_TAGS = ["og:image", "og:url", "twitter:image", "twitter:url"];

/**
 * Rewrite the share-card tags in a built `index.html` to absolute URLs.
 *
 * Only the bundle copy is touched: the project's own `index.html` stays
 * host-agnostic, which is what lets one folder run on `:8000`, through a tunnel
 * and on Pages. Values that already carry a scheme are left alone, so building
 * twice over the same output cannot produce `https://…/https://…`.
 *
 * @param {string} html - The built index.html.
 * @param {string|null} base - Site origin ending in "/", or null to leave as is.
 * @returns {string}
 */
export const absoluteShareTags = (html, base) => {
  if (!base || !base.endsWith("/")) return html;
  return html.replace(/<meta\b[^>]*>/gi, (tag) => {
    const key = tag.match(/\b(?:property|name)\s*=\s*(["'])([^"']+)\1/i)?.[2];
    if (!key || !SHARE_TAGS.includes(key)) return tag;
    const found = tag.match(/\bcontent\s*=\s*(["'])([^"']*)\1/i);
    if (!found || !found[2] || /^(https?:)?\/\//i.test(found[2])) return tag;
    const absolute = base + found[2].replace(/^\.?\//, "");
    return tag.slice(0, found.index) + `content="${absolute}"` + tag.slice(found.index + found[0].length);
  });
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
 * Directories never worth walking when resolving release assets: they are either
 * tooling output or would turn a small build into a filesystem scan.
 */
const PRUNED_DIRS = new Set(["node_modules", "dist", "www", "build", "coverage"]);

/**
 * Translates an asset glob into a regular expression over bundle-relative paths
 * that always use forward slashes. Supports `**` (any depth, and zero dirs when
 * written as `a/** /b`), `*` (one segment) and `?`.
 *
 * @param {string} pattern
 * @returns {RegExp}
 */
const globToRegExp = (pattern) => {
  let source = "";
  for (let i = 0; i < pattern.length; i += 1) {
    const char = pattern[i];
    if (char === "*") {
      if (pattern[i + 1] === "*") {
        i += 1;
        const trailingSlash = pattern[i + 1] === "/";
        if (trailingSlash) i += 1;
        source += trailingSlash ? "(?:.*/)?" : ".*";
      } else {
        source += "[^/]*";
      }
    } else if (char === "?") {
      source += "[^/]";
    } else {
      source += char.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    }
  }
  return new RegExp(`^${source}$`);
};

/**
 * Lists every file under `dir` (relative to `projectRoot`) as a forward-slash
 * path, skipping tooling folders and dot-directories.
 *
 * @param {string} projectRoot
 * @param {string} dir - "" for the project root itself.
 * @param {string[]} found - Accumulator, mutated.
 * @returns {string[]}
 */
const listFiles = (projectRoot, dir, found) => {
  let entries;
  try {
    entries = fs.readdirSync(path.join(projectRoot, dir), { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const rel = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (PRUNED_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
      listFiles(projectRoot, rel, found);
    } else if (entry.isFile()) {
      found.push(rel);
    }
  }
  return found;
};

/**
 * Reads the asset globs a project declares for its OTA releases
 * (`update.assets` in `fletbox.config.json`).
 *
 * @param {string} projectRoot - Absolute path to the project root.
 * @returns {string[]} Absolute-free glob list, empty when none is configured.
 */
export const resolveAssetPatterns = (projectRoot) => {
  const fletboxConfig = readJsonSafe(
    path.join(projectRoot, "fletbox.config.json"),
    {},
  );
  const patterns = fletboxConfig?.update?.assets;
  if (!Array.isArray(patterns)) return [];
  return patterns
    .filter((p) => typeof p === "string" && p.trim())
    .map((p) => p.trim().replace(/^\.\//, "").replace(/^\/+/, ""));
};

/**
 * Resolves asset globs into the manifest entries a release ships next to the
 * bundle. Each file is hashed so a running app can verify what it downloads.
 *
 * @param {string} projectRoot - Absolute path to the project root.
 * @param {string[]} patterns - Globs relative to the project root.
 * @returns {Array<{path: string, hash: string, size: number}>} Sorted by path.
 */
export const collectAssets = (projectRoot, patterns = []) => {
  const globs = patterns.map((p) => globToRegExp(p));
  if (!globs.length) return [];

  // Start the walk at each pattern's literal first segment when there is one,
  // so `docs/**` never reads the rest of the project.
  const starts = new Set(
    patterns.map((pattern) => {
      const first = pattern.split("/")[0];
      if (/[*?]/.test(first)) return "";
      const absolute = path.join(projectRoot, first);
      return fs.existsSync(absolute) && fs.statSync(absolute).isDirectory()
        ? first
        : "";
    }),
  );

  const files = [];
  for (const start of starts) listFiles(projectRoot, start, files);

  return [...new Set(files)]
    .filter((file) => globs.some((re) => re.test(file)))
    .sort()
    .map((file) => {
      const content = fs.readFileSync(path.join(projectRoot, file));
      return { path: file, hash: sha256(content), size: content.length };
    });
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
 * @param {Array<{path: string, hash: string, size: number}>} [opts.assets=[]]
 *   Extra files the release serves at `update.url`, as returned by
 *   {@link collectAssets}. `hash` still describes only the bundle.
 * @returns {object} The config.json manifest.
 */
export const buildBundleConfig = ({
  projectRoot,
  bundleContent,
  bundlePath = "src/app.js",
  assets = [],
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
    // Files the release serves beside the bundle (markdown, JSON, images). An
    // installed app reads them through the loader's asset helper; without this
    // list they are frozen at whatever version the APK/IPA was built with.
    assets: Array.isArray(assets)
      ? assets
          .filter((a) => a && typeof a.path === "string" && typeof a.hash === "string")
          .map((a) => ({ path: a.path, hash: a.hash, size: Number(a.size) || 0 }))
      : [],
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
