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
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { absoluteShareTags, buildBundleConfig, collectAssets, declaredUpdateUrl, isPlaceholderUpdateUrl, resolveUpdateUrl, SHARE_TAGS } from "../bin/utils/bundleConfig.js";
import { indexHtml } from "../bin/utils/templates.js";

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

// ---- The card every created app starts with -------------------------------
// The stamper can only absolutise a tag the project's own index.html carries,
// and a missing one fails silently: the share renders as a headline with no
// picture while the site looks perfect. So `flet-box create` ships every tag
// the stamper knows, each pointing at a file the bundle actually serves.
const metaContent = (html, key) => {
  const tag = html
    .match(/<meta\b[^>]*>/gi)
    ?.find((t) => new RegExp(`\\b(?:property|name)\\s*=\\s*["']${key}["']`, "i").test(t));
  return tag?.match(/\bcontent\s*=\s*(["'])([^"']*)\1/i)?.[2] ?? null;
};
const templateHtml = indexHtml("Guantanamera");
const stampedTemplate = absoluteShareTags(templateHtml, "https://user.github.io/repo/");
for (const tag of SHARE_TAGS) {
  check(`the created app carries ${tag}`, metaContent(templateHtml, tag) !== null, true);
  check(
    `${tag} is absolute in the built bundle`,
    /^https:\/\/user\.github\.io\/repo\//.test(metaContent(stampedTemplate, tag) ?? ""),
    true,
  );
}
check("the card declares its shape before X will show an image", metaContent(templateHtml, "twitter:card"), "summary");
check("the default picture is the icon the template ships", metaContent(templateHtml, "og:image"), "./src/assets/icon-512.png");
const createSource = readFileSync(path.join(repoRoot, "bin", "commands", "create.js"), "utf8");
check(
  "the picture the card names is a file `flet-box create` copies into every app",
  createSource.includes('"icon-512.png"'),
  true,
);

// ---- And the card this repository's own demo serves ------------------------
// The root `index.html` is the other card the stamper reads: `npm run build` and
// `flet-box cloudflare` serve a bundle built from it, so a share of the demo is a
// share of the framework. It carried a title and a description with no picture
// and no URL — a scraper shows exactly the headline it is given, so the card was
// silent about what FletBox looks like. The rule is the template's: the file in
// the repo stays host-agnostic and names relative paths, the built copy is
// stamped, and the picture it names is a file the bundle copies.
const demoHtml = readFileSync(path.join(repoRoot, "index.html"), "utf8");
const stampedDemo = absoluteShareTags(demoHtml, "https://user.github.io/repo/");
for (const tag of SHARE_TAGS) {
  check(`the demo carries ${tag}`, metaContent(demoHtml, tag) !== null, true);
  check(
    `${tag} is absolute in the demo's built copy`,
    /^https:\/\/user\.github\.io\/repo\//.test(metaContent(stampedDemo, tag) ?? ""),
    true,
  );
}
check("the demo's card declares its shape", metaContent(demoHtml, "twitter:card"), "summary");
for (const tag of ["og:image", "twitter:image"]) {
  const picture = metaContent(demoHtml, tag) ?? "";
  check(
    `${tag} names a file in the checkout`,
    existsSync(path.join(repoRoot, picture.replace(/^\.?\//, ""))),
    true,
  );
}

// ---- The update URL, which is the half that decides whether OTA exists at all --
//
// `flet-box create` without `--repo` writes a placeholder into
// `fletbox.config.json`, and an installed app that gets that string in its
// manifest polls a host that does not exist forever — silently, because OTA is
// built never to break the app. So a placeholder must fall through to the
// derivation, while a real explicit URL must still win.
const PLACEHOLDER = "https://TU-USUARIO.github.io/TU-REPO/";

/**
 * Builds a throwaway project. `remote` is installed by writing the two files git
 * reads (`.git/config` and `.git/HEAD`) so the check never shells out to git and
 * cannot be skipped by a machine that has it configured differently.
 */
const project = (root, { declared = null, repository = null, remote = null } = {}) => {
  mkdirSync(root, { recursive: true });
  const pkg = { name: "fixture-app", version: "1.0.0" };
  if (repository) pkg.repository = repository;
  writeFileSync(path.join(root, "package.json"), JSON.stringify(pkg));
  if (declared !== null) {
    writeFileSync(
      path.join(root, "fletbox.config.json"),
      JSON.stringify({ update: { url: declared } }),
    );
  }
  if (remote) {
    mkdirSync(path.join(root, ".git/refs/heads"), { recursive: true });
    mkdirSync(path.join(root, ".git/objects"), { recursive: true });
    writeFileSync(path.join(root, ".git/HEAD"), "ref: refs/heads/main\n");
    writeFileSync(
      path.join(root, ".git/config"),
      `[core]\n\trepositoryformatversion = 0\n[remote "origin"]\n\turl = ${remote}\n\tfetch = +refs/heads/*:refs/remotes/origin/*\n`,
    );
  }
  return root;
};

const urlRoot = mkdtempSync(path.join(os.tmpdir(), "fletbox-ota-url-"));
try {
  const cases = [
    {
      label: "a real explicit update.url still wins over the remote",
      dir: "explicit",
      want: "https://example.com/app/",
      declared: "https://example.com/app",
      repository: "git+https://github.com/kuko53348/derived-app.git",
      remote: "https://github.com/kuko53348/remote-app.git",
    },
    {
      label: "the placeholder is not a choice: package.json repository decides",
      dir: "pkg-repo",
      want: "https://kuko53348.github.io/derived-app/",
      declared: PLACEHOLDER,
      repository: "git+https://github.com/kuko53348/derived-app.git",
    },
    {
      label: "with no repository field, the project's own git remote decides",
      dir: "git-remote",
      want: "https://kuko53348.github.io/remote-app/",
      declared: PLACEHOLDER,
      remote: "https://github.com/kuko53348/remote-app.git",
    },
    {
      label: "a half-filled placeholder (real repo, guessed owner) falls through too",
      dir: "half",
      want: "https://kuko53348.github.io/remote-app/",
      declared: "https://TU-USUARIO.github.io/other-app/",
      remote: "git@github.com:kuko53348/remote-app.git",
    },
    {
      label: "placeholder with nothing to derive from: OTA is disabled, not mis-aimed",
      dir: "bare",
      want: null,
      declared: PLACEHOLDER,
    },
    {
      label: "a project that declares nothing still derives from its remote",
      dir: "undeclared",
      want: "https://kuko53348.github.io/remote-app/",
      remote: "https://github.com/kuko53348/remote-app.git",
    },
  ];

  for (const { label, dir, want, ...setup } of cases) {
    const root = project(path.join(urlRoot, dir), setup);
    check(label, resolveUpdateUrl(root), want);
  }

  // The build reads the file to be able to say "this URL came from derivation".
  check(
    "declaredUpdateUrl reports the file, not the resolved answer",
    declaredUpdateUrl(path.join(urlRoot, "pkg-repo")),
    PLACEHOLDER,
  );
  check(
    "and reports nothing when the project declares no update.url",
    declaredUpdateUrl(path.join(urlRoot, "undeclared")),
    null,
  );

  // The predicate has to stay narrow: a repository genuinely called `tu-repo`,
  // or any non-string, is a real site — not a placeholder.
  check("the placeholder test is case-sensitive on purpose", isPlaceholderUpdateUrl("https://someone.github.io/tu-repo/"), false);
  check("a real host with a similar path is not a placeholder", isPlaceholderUpdateUrl("https://kuko53348.github.io/my-repo/"), false);
  check("null and non-strings are not placeholders (they are simply unset)", [isPlaceholderUpdateUrl(null), isPlaceholderUpdateUrl(42)], [false, false]);

  check(
    "the manifest never carries a placeholder, whatever the project declares",
    buildBundleConfig({
      projectRoot: path.join(urlRoot, "bare"),
      bundleContent: "export default 1;\n",
    }).update.url,
    null,
  );
} finally {
  rmSync(urlRoot, { recursive: true, force: true });
}

if (failures) {
  console.error(`\n${failures} OTA asset check(s) failed.`);
  process.exit(1);
}
console.log("\nAll OTA asset checks passed.");
