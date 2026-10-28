// bin/utils/migrationGuide.js
//
// The migration guide is the promise a release makes to the app that used the
// previous one: "here is what changed, and here is what you write now".
//
// Three things read it, and all three read the same bytes:
//   • `flet-box release --major` refuses to publish a major that has no
//     section for it — a major is exactly the release where an app has to
//     change something, so the guide must exist before the release does;
//   • `scripts/check-migrations.mjs` proves the guide, the deprecation table
//     and the codemod still agree with each other;
//   • the person whose app is about to break.
//
// Node core only: `bin/` may not import a devDependency at module scope.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** The guide, relative to the package root. */
export const GUIDE_RELATIVE = "docs/guides/migration.md";

/**
 * Absolute path of the guide inside a checkout.
 *
 * @param {string} [root]
 * @returns {string}
 */
export const guidePath = (root = packageDir) =>
  path.join(root, ...GUIDE_RELATIVE.split("/"));

/**
 * The guide's text, or null when there is none.
 *
 * @param {string} [root]
 * @returns {string|null}
 */
export const readGuide = (root = packageDir) => {
  try {
    return fs.readFileSync(guidePath(root), "utf8");
  } catch {
    return null;
  }
};

/**
 * The guide's version sections, as `heading → body`.
 *
 * A section is a `## <version>` heading; anything under it belongs to it.
 *
 * @param {string|null} text
 * @returns {Map<string, string>}
 */
export const sections = (text) => {
  const map = new Map();
  if (!text) return map;
  let current = null;
  let body = [];
  for (const line of text.split(/\r?\n/)) {
    const heading = /^##\s+(.+?)\s*$/.exec(line);
    if (heading) {
      if (current !== null) map.set(current, body.join("\n"));
      current = heading[1];
      body = [];
      continue;
    }
    if (current !== null) body.push(line);
  }
  if (current !== null) map.set(current, body.join("\n"));
  return map;
};

/**
 * The "de X a Y" rows of one section.
 *
 * The table is the contract, so it is parsed rather than guessed: a row is
 * `| Widget | From | To | What changed |`, and the header and the separator
 * are not rows.
 *
 * @param {string|null} text The whole guide.
 * @param {string} version The section heading, e.g. `"1.2.0"`.
 * @returns {Array<{ widget: string, from: string, to: string, note: string }>}
 */
export const rowsFor = (text, version) => {
  const body = sections(text).get(version);
  if (!body) return [];
  const rows = [];
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    const cells = trimmed
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim().replace(/`/g, ""));
    if (cells.length < 3) continue;
    const [widget, from, to] = cells;
    if (!/^[A-Z][A-Za-z0-9]*$/.test(widget)) continue; // the separator row
    if (from === "From") continue; // the header row
    rows.push({ widget, from, to, note: (cells[3] || "").trim() });
  }
  return rows;
};

/**
 * Is this checkout the framework itself, rather than an app that uses it?
 *
 * Only the framework ships the guide and only the framework releases its own
 * major version, so the guard never fires inside somebody's app.
 *
 * @param {string} [root]
 * @returns {boolean}
 */
export const isFrameworkProject = (root = packageDir) => {
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  } catch {
    return false;
  }
  const bin = pkg.bin && (pkg.bin["flet-box"] || pkg.bin.fletBox);
  if (!bin) return false;
  return fs.existsSync(path.join(root, bin));
};

/**
 * What is missing before a version may be released, or null when nothing is.
 *
 * @param {string} version The version about to be published.
 * @param {string} [root]
 * @returns {{ version: string, reason: string }|null}
 */
export const missingMigration = (version, root = packageDir) => {
  const text = readGuide(root);
  if (!text) {
    return { version, reason: `the migration guide is missing (${GUIDE_RELATIVE})` };
  }
  if (!sections(text).has(version)) {
    return { version, reason: `the guide has no "## ${version}" section` };
  }
  if (!rowsFor(text, version).length) {
    return { version, reason: `the "## ${version}" section of the guide has no rows` };
  }
  return null;
};
