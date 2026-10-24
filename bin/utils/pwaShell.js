/**
 * @file bin/utils/pwaShell.js
 * @description Two build-time corrections that make a bundle deployable as a PWA
 * on a static host, which is where every generated app actually ends up
 * (GitHub Pages, S3, any bucket under `/repo/`).
 *
 * Neither can be left to the app author to remember, because both fail silently
 * on the developer's own machine and only show up once deployed:
 *
 *  1. `writeSpaFallback` — a single-page app has routes the host does not know.
 *     GitHub Pages has no rewrite rule, so a refresh on `/repo/menu` is answered
 *     with Pages' own "Page not found": the app looks broken exactly on the
 *     entry point a shared link or a reload produces. `404.html` is the portable
 *     remedy: every static host serves that file for a missing path, so copying
 *     the built shell over it hands the deep link to the router instead.
 *
 *  2. `normaliseManifest` — a generated `manifest.json` says `"start_url": "/"`
 *     and `"scope": "/"`. Resolved against the manifest's own URL that is the
 *     host root, i.e. `https://user.github.io/`, which is outside the app's
 *     directory and outside its service worker's scope. Chrome then refuses to
 *     offer the install at all: the site renders, works offline, and never shows
 *     "Add to Home Screen". Icons have the quieter version of the same bug — a
 *     copied logo declared as `192x192` that is really 512 px wide.
 *
 * Both only touch the bundle output. The project's own `manifest.json` and
 * `index.html` stay host-agnostic so the same folder still runs on `:8000`.
 */

import fs from "fs";
import path from "path";

/**
 * Read the intrinsic size of a PNG from its IHDR chunk.
 *
 * @param {string} filePath - Absolute path to the candidate icon.
 * @returns {{width: number, height: number}|null} Nothing for a non-PNG file.
 */
export const pngDimensions = (filePath) => {
  const header = Buffer.alloc(24);
  let handle;
  try {
    handle = fs.openSync(filePath, "r");
    if (fs.readSync(handle, header, 0, 24, 0) !== 24) return null;
  } catch {
    return null;
  } finally {
    if (handle !== undefined) fs.closeSync(handle);
  }

  const isPng =
    header[0] === 0x89 &&
    header.subarray(12, 16).toString("ascii") === "IHDR";
  if (!isPng) return null;
  return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
};

/**
 * Make the bundled `manifest.json` launch and stay inside the app it ships with.
 *
 * `start_url` and `scope` are resolved against the manifest URL, so `"/"` means
 * the host root. Rewriting only that value (and an empty string) to `"./"` keeps
 * a root-hosted app identical to what it was while pulling a sub-path app back
 * inside its own directory; any other value is a deliberate base path and is left
 * alone. Each icon's declared `sizes` is corrected to the pixels the file really
 * has, which is also what makes the 192 px requirement provable to the browser.
 *
 * @param {string} targetDir - Absolute path of the bundle directory.
 * @returns {string[]} Human-readable description of each correction made.
 */
export const normaliseManifest = (targetDir) => {
  const manifestPath = path.join(targetDir, "manifest.json");
  if (!fs.existsSync(manifestPath)) return [];

  let raw;
  try {
    raw = fs.readFileSync(manifestPath, "utf8");
  } catch {
    return [];
  }

  let manifest;
  try {
    manifest = JSON.parse(raw);
  } catch {
    return [];
  }

  const changes = [];

  // "/" escapes the app on a sub-path host; "" is the same mistake written
  // differently. Anything else was typed on purpose.
  for (const field of ["start_url", "scope"]) {
    if (manifest[field] === "/" || manifest[field] === "") {
      manifest[field] = "./";
      changes.push(`${field}: "/" → "./"`);
    }
  }

  if (Array.isArray(manifest.icons)) {
    for (const icon of manifest.icons) {
      if (!icon || typeof icon.src !== "string") continue;
      // Strip any query/hash and the leading "./" before hitting the disk; the
      // bundle keeps icons relative to its own directory.
      const clean = icon.src.split(/[?#]/)[0].replace(/^\.\//, "");
      const size = pngDimensions(path.join(targetDir, clean));
      if (!size) continue;
      const actual = `${size.width}x${size.height}`;
      if (icon.sizes !== actual) {
        const declared = icon.sizes;
        icon.sizes = actual;
        changes.push(`${clean}: sizes now ${actual} (was ${declared})`);
      }
    }
  }

  if (changes.length) {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  }
  return changes;
};

/**
 * Copy the finished shell to `404.html` so unknown paths serve the app.
 *
 * Called last, after the OTA loader is wired and the share tags are absolute, so
 * the fallback document is byte-identical to `index.html` and boots the same
 * bundle. Idempotent: rebuilding the project always rewrites it.
 *
 * @param {string} targetDir - Absolute path of the bundle directory.
 * @returns {boolean} False when there is no `index.html` to copy.
 */
export const writeSpaFallback = (targetDir) => {
  const index = path.join(targetDir, "index.html");
  if (!fs.existsSync(index)) return false;
  fs.copyFileSync(index, path.join(targetDir, "404.html"));
  return true;
};
