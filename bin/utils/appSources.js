/**
 * @file bin/utils/appSources.js
 * @description What a generated app's own sources actually name.
 *
 * Two CLI commands need this question and must not answer it two ways:
 * `prune-assets` deletes the image files no source references, and `images
 * --referenced` refuses to build a WebP the app never asks for (an assets folder
 * routinely holds the declared `favicon.png` and a social-preview JPG, and
 * converting them would add files nothing loads).
 *
 * `www/` is not a source: it is generated output, so a name that appears only
 * there is a stale bundle, not a consumer.
 */

import fs from "node:fs";
import path from "node:path";

const SOURCE_FILE = /\.(js|mjs|css|html|json|md)$/i;
const SKIPPED_DIRS = new Set(["node_modules", ".git", "dist", "build", ".cache", "www", "vendor", "ios", "android"]);

/**
 * Roots a reference may legitimately live in.
 *
 * `scripts/` counts because the native icon steps sit there, and a template that
 * moves a filename into one of them must not have its master deleted.
 */
export const SOURCE_ROOTS = ["src", "index.html", "scripts", "fletbox.config.json", "package.json", "README.md", "AGENTS.md"];

/**
 * Reads the app's sources into one string, with comments taken out.
 *
 * A note like `mojito.jpg is the frappé` is documentation, not a load, and
 * keeping a dead file alive because of it defeats the command.
 *
 * @param {string} root - Absolute project root.
 * @returns {string}
 */
export const readAppSources = (root) => {
  const parts = [];
  const walk = (target) => {
    if (!fs.existsSync(target)) return;
    const stack = [target];
    while (stack.length) {
      const p = stack.pop();
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        for (const entry of fs.readdirSync(p)) {
          if (SKIPPED_DIRS.has(entry)) continue;
          stack.push(path.join(p, entry));
        }
        continue;
      }
      if (SOURCE_FILE.test(p)) {
        try {
          parts.push(fs.readFileSync(p, "utf8"));
        } catch {
          /* unreadable text is not evidence of anything */
        }
      }
    }
  };
  for (const rel of SOURCE_ROOTS) walk(path.resolve(root, rel));
  return parts
    .join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .split("\n")
    .filter((line) => !/^\s*(\/\/|#|\*)/.test(line))
    .join("\n");
};

/**
 * Files a cleanup or a conversion must not touch, whatever the sources say.
 *
 * `assets/logo.png` is the app icon: the native build scripts read it and resize
 * it into launcher icons and splash screens, so it has to stay the lossless
 * master the sensor produced. A text scan alone cannot be trusted to notice it —
 * those scripts build the path with `path.join(root, "assets", "logo.png")`, so
 * the string `assets/logo.png` never appears in them — and a lossy WebP at a
 * 40 KB budget would silently become the icon on every phone.
 *
 * Matched by project-relative path or by exact filename.
 */
export const PROTECTED_MASTERS = [
  { rel: "assets/logo.png", why: "the app icon master: native icons and splash screens are resized from it" },
];

/**
 * @param {string} text - The corpus from `readAppSources`.
 * @param {string} rel - Path relative to the project root, e.g. `assets/x.webp`.
 * @returns {boolean} Whether the app names it — by path, or by exact filename.
 */
export const references = (text, rel) => text.includes(rel) || text.includes(path.basename(rel));

/**
 * @param {string} rel - Project-relative path with `/` separators.
 * @returns {{rel: string, why: string}|null} The protection that covers it, if any.
 */
export const protectedMaster = (rel) =>
  PROTECTED_MASTERS.find((entry) => entry.rel === rel || entry.rel.split("/").pop() === path.basename(rel)) || null;

