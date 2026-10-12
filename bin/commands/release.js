/**
 * @file bin/commands/release.js
 * @description `flet-box release` — cut a new OTA release of the current project.
 *
 * A release is the moment the code is considered *stable*: the version is
 * bumped (odometer scheme), the production bundle is rebuilt (which regenerates
 * `www/config.json` with the new version + hash), and the bump is committed and
 * tagged `vX.Y.Z`. When the tag is pushed, CI builds and deploys `www/` to
 * GitHub Pages; running apps then fetch the new `config.json`, notice the hash
 * changed, and self-update — no new store submission required (web layer only).
 *
 * The version increments ONLY here, never on a test/preview build, so that
 * "prueba" builds stay cheap and only a deliberate release moves the number.
 *
 * Usage:
 *   flet-box release [--major|--minor|--patch] [dir] [--push]
 *
 *   --patch (default)  bump PATCH  (1.0.0 → 1.0.1)
 *   --minor            bump MINOR  (1.0.0 → 1.1.0)
 *   --major            bump MAJOR  (1.0.0 → 2.0.0)
 *   dir                bundle target folder (default "www")
 *   --push             push the commit AND the tag to origin after tagging
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { c, banner, gradient } from "../utils/colors.js";
import { createBundle } from "./createBundle.js";
import { INITIAL_VERSION, incrementVersion, isValidVersion } from "../utils/version.js";

/**
 * Runs a git command in `cwd`, returning trimmed stdout. Throws on failure.
 *
 * @param {string} cmd - Git subcommand + args (without the leading "git").
 * @param {string} cwd - Working directory.
 * @returns {string} Trimmed stdout.
 */
const git = (cmd, cwd) =>
  execSync(`git ${cmd}`, { cwd, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();

/**
 * Cuts a new release.
 *
 * @async
 * @param {string[]} argv - Args after the `release` keyword,
 *   e.g. `["--minor", "--push"]`.
 * @returns {Promise<void>}
 */
export const release = async (argv = []) => {
  const projectRoot = process.cwd();

  // ---- Parse flags --------------------------------------------------------
  let type = "patch";
  let push = false;
  let target = null;
  for (const arg of argv) {
    if (arg === "--major" || arg === "--minor" || arg === "--patch") {
      type = arg.slice(2);
    } else if (arg === "--push") {
      push = true;
    } else if (!arg.startsWith("-") && !target) {
      // First bare positional is the bundle target directory.
      target = arg;
    }
  }

  console.log(banner("🚀 FletBox Release", `--${type}`));

  // ---- Guard: must be inside a FletBox project ---------------------------
  if (!fs.existsSync(path.join(projectRoot, "src", "app.js"))) {
    console.error(c("red", "❌ Not inside a FletBox project"));
    console.log(c("gray", "Run this in a project folder with src/app.js (flet-box create <name>)."));
    process.exit(1);
  }

  // ---- Guard: must be a git repository -----------------------------------
  // The release flow relies on tags so CI can deploy the exact released commit.
  try {
    git("rev-parse --is-inside-work-tree", projectRoot);
  } catch {
    console.error(c("red", "❌ Not a git repository"));
    console.log(
      c("gray", "Releases are tagged so CI can deploy them. Run: git init && git add -A && git commit -m \"init\""),
    );
    process.exit(1);
  }

  // ---- Guard: working tree must be clean ---------------------------------
  // A dirty tree means the tag would NOT capture what you think you released
  // (CI checks out the tag = committed state). Force the dev to commit first.
  const dirty = git("status --porcelain", projectRoot);
  if (dirty) {
    console.error(c("red", "❌ Working tree has uncommitted changes"));
    console.log(c("gray", "Commit or stash them first so the release tag captures exactly this state:"));
    console.log(c("dim", dirty.split("\n").slice(0, 20).map((l) => "   " + l).join("\n")));
    process.exit(1);
  }

  // ---- Bump version in package.json --------------------------------------
  const pkgPath = path.join(projectRoot, "package.json");
  if (!fs.existsSync(pkgPath)) {
    console.error(c("red", "❌ No package.json found"));
    process.exit(1);
  }
  const pkgRaw = fs.readFileSync(pkgPath, "utf8");
  const pkg = JSON.parse(pkgRaw);
  const current = isValidVersion(pkg.version) ? pkg.version : INITIAL_VERSION;
  const next = incrementVersion(current, type);

  pkg.version = next;
  // Preserve the file's existing 2-space style + trailing newline.
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  console.log(
    c("blue", "\n🔢 Version ") +
      c("gray", current) +
      c("blue", " → ") +
      gradient(next, "#34d399", "#22d3ee"),
  );

  // Safety net: createBundle can hard-exit (e.g. esbuild install failure). If we
  // leave without committing, roll package.json back so the tree isn't left
  // dirty with a version bump for a release that never happened (which would
  // also wedge the clean-tree guard on the next attempt).
  let committed = false;
  process.once("exit", () => {
    if (!committed) {
      try {
        fs.writeFileSync(pkgPath, pkgRaw);
      } catch {
        /* best effort */
      }
    }
  });

  // ---- Rebuild the bundle (regenerates www/config.json) ------------------
  await createBundle(target);

  // ---- Commit + tag ------------------------------------------------------
  const tag = `v${next}`;
  try {
    // Stage exactly what the release produced. The clean-tree guard above
    // guarantees the only changes now are the version bump + the freshly built
    // bundle, so `add -A` captures the release faithfully. git still honours
    // .gitignore: a gitignored target (e.g. a generated project's www/) is
    // skipped, leaving only package.json for CI to rebuild from the tag, while a
    // tracked/untracked target is committed so the tag matches what shipped and
    // the tree ends clean (release stays repeatable).
    git("add -A", projectRoot);
    git(`commit -m "chore(release): ${tag}"`, projectRoot);
    git(`tag -a ${tag} -m "Release ${tag}"`, projectRoot);
    committed = true;
    console.log(c("green", `\n✅ Committed and tagged ${tag}`));
  } catch (error) {
    committed = true; // keep the bump; the message below tells the dev how to finish
    console.error(c("red", "❌ Git commit/tag failed:"), error.message);
    console.log(
      c("yellow", `⚠️ package.json was bumped to ${next} but the release was not committed. `) +
        c("gray", "Fix the git issue, then: git add package.json && git commit && git tag " + tag),
    );
    process.exit(1);
  }

  // ---- Optional push -----------------------------------------------------
  if (push) {
    try {
      git("push", projectRoot);
      git(`push origin ${tag}`, projectRoot);
      console.log(c("green", `✅ Pushed commit + tag ${tag} to origin`));
    } catch (error) {
      console.error(c("red", "❌ Push failed:"), error.message);
      console.log(c("gray", `Push manually with: git push && git push origin ${tag}`));
      process.exit(1);
    }
  }

  // ---- Summary -----------------------------------------------------------
  console.log(
    c("gray", `\n      📦 Bundle: ${gradient((target || "www") + "/", "#8b5cf6", "#d946ef")}`),
  );
  if (!push) {
    console.log(
      c("gray", `      ⬆️  Publish it: ${gradient(`git push && git push origin ${tag}`, "#22d3ee", "#38bdf8")}`),
    );
  }
  console.log(
    c("dim", "      ℹ️  CI deploys www/ to GitHub Pages on the tag; open apps self-update from config.json."),
  );
};
