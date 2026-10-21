/**
 * @file bin/commands/pruneAssets.js
 * @description `flet-box prune-assets` — deletes the images a generated app never
 * names.
 *
 * This exists because of what `flet-box create` ships: a demo asset library
 * (dishes, drinks, gallery photos) that no screen of a fresh app imports, which
 * weighs the repository down and — worse — gets copied into any release whose
 * asset glob is broad enough to catch it. The failure is silent: the site works,
 * the bundle is 1.5 GB, and the visitor on a bad connection never sees the
 * difference because those files were never requested.
 *
 * A file is kept when its path or its exact filename appears in the app's own
 * sources. `www/` is deliberately not a source: it is generated output, so a name
 * that only appears there is a stale bundle, not a consumer.
 *
 * Deletion is the one thing this command will not do unasked: it reports, and
 * `--apply` deletes. Everything it removes is a tracked file in a generated
 * project, so `git checkout -- assets/` puts it back.
 */

import fs from "node:fs";
import path from "node:path";
import { c, section, dot } from "../utils/colors.js";
import { readAppSources, references, protectedMaster } from "../utils/appSources.js";

const USAGE = `Usage: flet-box prune-assets [dir] [options]

  dir                 Asset folder to clean (default: ./assets)

Options:
  --apply             Actually delete. Without it this is a report only.
  --root <dir>        Project root the sources are read from (default: .)
  --keep <name>       Extra filename to protect, repeatable
  --quiet             Only the summary line
  --help              This page`;

const IMAGE_FILE = /\.(png|jpe?g|webp|gif|svg|ico|avif)$/i;
const SKIPPED_DIRS = new Set(["node_modules", ".git", "dist", "build", ".cache", "www", "vendor", "ios", "android"]);

const size = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : bytes >= 1024
      ? `${Math.round(bytes / 1024)} KB`
      : `${bytes} B`;

/**
 * @param {string} dir
 * @returns {string[]} Image files under it, absolute, sorted.
 */
const collectImages = (dir) => {
  const found = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRS.has(entry.name)) walk(full);
        continue;
      }
      if (entry.isFile() && IMAGE_FILE.test(entry.name)) found.push(full);
    }
  };
  if (fs.existsSync(dir)) walk(dir);
  return found.sort();
};

/**
 * Runs the report, and the deletion if asked.
 *
 * @param {string[]} args - CLI arguments after the command name.
 * @returns {Promise<{exitCode: number}>}
 */
export const pruneAssets = async (args = []) => {
  const has = (flag) => args.includes(flag);
  const valueOf = (flag) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };

  if (has("--help") || has("-h")) {
    console.log(USAGE);
    return { exitCode: 0 };
  }

  const apply = has("--apply");
  const quiet = has("--quiet");
  const root = path.resolve(valueOf("--root") || ".");
  const handKeep = new Set(args.filter((_, i) => args[i - 1] === "--keep"));

  // Resolved against --root, not against the shell's cwd: a caller that names a
  // project root means that project's assets, and the two arguments disagreeing
  // is how a cleanup run ends up pointing at someone else's folder.
  const positional = args.filter((a, i) => !a.startsWith("--") && !["--root", "--keep"].includes(args[i - 1]));
  const dir = path.resolve(root, positional[0] || "assets");
  if (!dir.startsWith(root)) {
    console.log(c("red", `Refusing: ${dir} is outside the project root ${root}.`));
    return { exitCode: 1 };
  }
  if (!fs.existsSync(dir)) {
    console.log(c("red", `No such folder: ${path.relative(root, dir) || dir}`));
    return { exitCode: 1 };
  }

  const text = readAppSources(root);
  const images = collectImages(dir);
  const dead = [];
  const alive = [];
  const protectedByHand = [];
  for (const file of images) {
    const rel = path.relative(root, file).split(path.sep).join("/");
    const master = protectedMaster(rel);
    if (master) {
      alive.push(file);
      protectedByHand.push({ rel, why: master.why });
      continue;
    }
    if (handKeep.has(rel) || handKeep.has(path.basename(file))) {
      alive.push(file);
      protectedByHand.push({ rel, why: "kept by hand" });
      continue;
    }
    (references(text, rel) ? alive : dead).push(file);
  }

  // Measured before anything is deleted: the report that runs after `--apply`
  // would otherwise stat files that no longer exist and crash on its own summary.
  const sizes = new Map(images.map((f) => [f, fs.statSync(f).size]));
  const bytesOf = (list) => list.reduce((s, f) => s + sizes.get(f), 0);

  if (!quiet) {
    console.log(section("🧹", `prune-assets — ${path.relative(root, dir) || "."}`));
    if (!dead.length) console.log(`  ${dot("#34d399")} every one of the ${images.length} images here is referenced.`);
    for (const file of dead.slice(0, 40)) {
      console.log(`  ${dot("#ef4444")} ${path.relative(root, file)} — ${c("dim", size(sizes.get(file)))}`);
    }
    if (dead.length > 40) console.log(c("gray", `  … ${dead.length - 40} more`));
    for (const { rel, why } of protectedByHand) {
      console.log(`  ${dot("#34d399")} ${rel} — kept: ${why}`);
    }
  }

  const summary = `${images.length} images · ${alive.length} referenced (${size(bytesOf(alive))}) · ${dead.length} unreferenced (${size(bytesOf(dead))})`;
  if (!dead.length) {
    console.log(`\n  ${summary}\n`);
    return { exitCode: 0 };
  }
  if (!apply) {
    console.log(`\n  ${summary}`);
    console.log(c("yellow", "  dry run — nothing deleted. Add --apply to remove them.\n"));
    return { exitCode: 0 };
  }

  const emptied = new Set();
  for (const file of dead) {
    fs.rmSync(file, { force: true });
    emptied.add(path.dirname(file));
  }
  // A directory the purge emptied is dead weight in the repo and in every future
  // glob, so it goes with its files.
  for (const d of [...emptied].sort().reverse()) {
    if (d !== dir && fs.existsSync(d) && fs.readdirSync(d).length === 0) fs.rmSync(d, { recursive: true, force: true });
  }
  console.log(`\n  ${summary}`);
  console.log(c("green", `  deleted ${dead.length} files (${size(bytesOf(dead))}).`));
  console.log(c("gray", "  Undo while the delete is uncommitted:  git checkout -- assets/\n"));
  return { exitCode: 0 };
};

export default pruneAssets;
