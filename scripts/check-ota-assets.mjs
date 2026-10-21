#!/usr/bin/env node
/**
 * @file check-ota-assets.mjs
 * @description
 * Guard for OTA releases that ship more than the JS bundle.
 *
 * A release manifest used to describe exactly one artifact (`src/app.js`), so an
 * installed app could update its code while every other file stayed frozen at the
 * version its APK/IPA was built from. The visible symptom: a catalog that lists a
 * page the device does not have, and a viewer that answers "is not part of this
 * documentation set".
 *
 * This checks the build half of the fix — the manifest must name each extra file
 * with a hash and a size, and the loader must publish the helper that reads them.
 * The runtime half (cache → network → shipped copy) is exercised in a browser
 * against the docs site, which is the app that consumes it.
 *
 * Usage:
 *   node scripts/check-ota-assets.mjs
 */
import crypto from "crypto";
import { execFileSync } from "child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { absoluteShareTags, buildBundleConfig, collectAssets } from "../bin/utils/bundleConfig.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let failures = 0;
const check = (label, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`${ok ? "✅" : "❌"} ${label}${ok ? "" : `\n     got  ${JSON.stringify(got)}\n     want ${JSON.stringify(want)}`}`);
  if (!ok) failures += 1;
};

const fixture = mkdtempSync(path.join(os.tmpdir(), "fletbox-ota-assets-"));
try {
  const files = {
    "docs/index.md": "# Index\n",
    "docs/widget/Deep.md": "# Deep\n",
    "docs/notes.txt": "not markdown\n",
    "content/data.json": '{"a":1}',
    "src/app.js": "export default 1;\n",
  };
  for (const [rel, body] of Object.entries(files)) {
    const target = path.join(fixture, rel);
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, body);
  }
  writeFileSync(
    path.join(fixture, "package.json"),
    JSON.stringify({ name: "fixture", version: "1.2.3" }),
  );
  writeFileSync(
    path.join(fixture, "fletbox.config.json"),
    JSON.stringify({
      update: { url: "https://example.com/app/", assets: ["docs/**/*.md", "content/*.json"] },
    }),
  );

  const sha256 = (text) => crypto.createHash("sha256").update(text).digest("hex");

  const assets = collectAssets(fixture, ["docs/**/*.md", "content/*.json"]);
  check(
    "collectAssets returns the matching files, sorted, and skips the rest",
    assets.map((a) => a.path),
    ["content/data.json", "docs/index.md", "docs/widget/Deep.md"],
  );
  check(
    "each asset carries the sha256 and byte size of its shipped content",
    assets.every((a) => a.hash === sha256(files[a.path]) && a.size === Buffer.byteLength(files[a.path])),
    true,
  );
  check("paths are bundle-relative with forward slashes", assets.every((a) => !a.path.startsWith("/") && !a.path.includes("\\")), true);
  check("a pattern matching nothing yields no assets instead of throwing", collectAssets(fixture, ["nowhere/**"]), []);

  const manifest = buildBundleConfig({
    projectRoot: fixture,
    bundleContent: "export default 1;\n",
    assets,
  });
  check("config.json lists the release assets", manifest.assets, assets);
  check(
    "the bundle hash still describes only the JS bundle",
    manifest.hash === sha256("export default 1;\n"),
    true,
  );
  check(
    "a project without assets gets an empty list, not a missing field",
    buildBundleConfig({ projectRoot: fixture, bundleContent: "x" }).assets,
    [],
  );
} finally {
  rmSync(fixture, { recursive: true, force: true });
}

const loader = readFileSync(path.join(repoRoot, "bin", "ota", "loader.js"), "utf8");
check("the loader publishes the asset helper the app calls", loader.includes("__FLETBOX_OTA_ASSET__"), true);
check("the loader reads the manifest asset list", /assets/.test(loader), true);
try {
  execFileSync(process.execPath, ["--check", path.join(repoRoot, "bin", "ota", "loader.js")], { stdio: "pipe" });
  console.log("✅ loader.js still parses as a standalone ES module");
} catch (error) {
  console.log(`❌ loader.js does not parse:\n${error.stderr?.toString() || error.message}`);
  failures += 1;
}

// The share card is derived from the same base URL, and it fails silently: a
// relative og:image renders as a headline with no picture in WhatsApp, while the
// site itself looks correct to anyone who opens it.
const card = [
  '<meta property="og:image" content="./assets/landing/og-cover.jpg">',
  '<meta name="twitter:image" content="/assets/og.jpg">',
  '<meta property="og:image" content="https://other.example/x.jpg">',
  '<meta property="og:title" content="Guantanamera">',
  '<meta property="og:description" content="Walk through the blue door.">',
].join("\n");
const stamped = absoluteShareTags(card, "https://user.github.io/repo/");
check(
  "a relative og:image becomes absolute at the derived site",
  stamped.includes('content="https://user.github.io/repo/assets/landing/og-cover.jpg"'),
  true,
);
check("a root-relative share image resolves against the site too", stamped.includes('content="https://user.github.io/repo/assets/og.jpg"'), true);
check("an already-absolute share image is not prefixed again", stamped.includes('content="https://other.example/x.jpg"'), true);
check("the tags a scraper does not resolve for images stay untouched", stamped.includes('content="Walk through the blue door."') && stamped.includes('content="Guantanamera"'), true);
check("no base URL means no rewrite (a local bundle keeps its relative paths)", absoluteShareTags(card, null), card);
check("building twice over the same output cannot double-prefix", absoluteShareTags(stamped, "https://user.github.io/repo/"), stamped);

if (failures) {
  console.error(`\n${failures} OTA asset check(s) failed.`);
  process.exit(1);
}
console.log("\nAll OTA asset checks passed.");
