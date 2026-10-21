// scripts/check-images-cli.mjs
// Contract for the two image commands that talk to the machine rather than to
// Node core: `flet-box images` and `flet-box prune-assets`.
//
// Run standalone (like check-image-convert.mjs, it is not wired into `npm test`
// yet — it depends on a binary that may or may not be installed):
//   node scripts/check-images-cli.mjs
//
// What it pins down, and what each assertion was written to catch:
//   1. the platform table names an install command for this machine, and the
//      encoder probe reports nothing when PATH is emptied — because a CLI that
//      claims an encoder it cannot run installs software nobody asked for.
//   2. a conversion fits the budget, is real WebP, and leaves the source alone —
//      the non-destructive half is the contract `to-png` already keeps.
//   3. prune reports before it deletes, deletes only what no source names, and
//      protects the template's `assets/logo.png` that a text scan cannot see.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { encodePng } from "../bin/utils/images/index.js";
import { findEncoder, platformInstaller, webpCarriesAlpha } from "../bin/utils/imageTools.js";
import { images } from "../bin/commands/images.js";
import { pruneAssets } from "../bin/commands/pruneAssets.js";

const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "fletbox-images-"));
const failures = [];

/** A gradient is 1024 distinct colours: enough that a WebP has something to do. */
const writePhoto = (file, width = 240, height = 160, alpha = false) => {
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      rgba[i] = (x * 255) / width;
      rgba[i + 1] = (y * 255) / height;
      rgba[i + 2] = ((x + y) * 255) / (width + height);
      // Every seventh pixel fully transparent, every third half-covered: an
      // encoder that flattens onto white produces a different picture, and this
      // is what the alpha read-back has to notice.
      rgba[i + 3] = !alpha ? 255 : i / 4 % 7 === 0 ? 0 : i / 4 % 3 === 0 ? 128 : 255;
    }
  }
  fs.writeFileSync(file, encodePng({ width, height, rgba }));
};


const check = async (name, fn) => {
  try {
    await fn();
    console.log(`  ok   ${name}`);
  } catch (error) {
    failures.push(name);
    console.log(`  FAIL ${name} — ${error.message}`);
  }
};

console.log("check-images-cli: flet-box images and prune-assets\n");

await check("the platform table names an install command", () => {
  const installer = platformInstaller();
  assert.ok(installer.name, "every platform reports a name");
  if (["darwin", "win32", "linux"].includes(process.platform)) {
    assert.ok(installer.install.length >= 3, `${installer.name} produced no install command`);
    assert.ok(/webp|libwebp/i.test(installer.install.join(" ")), `install line does not name a WebP package: ${installer.install.join(" ")}`);
  }
});

await check("an emptied PATH finds no encoder", () => {
  const real = process.env.PATH;
  try {
    process.env.PATH = scratch; // a folder with no binaries in it
    assert.equal(findEncoder(), null, "claimed an encoder that is not on this PATH");
  } finally {
    process.env.PATH = real;
  }
});

await check("images writes a budget WebP and keeps the source", async () => {
  const dir = path.join(scratch, "photos");
  fs.mkdirSync(dir, { recursive: true });
  const source = path.join(dir, "photo.png");
  writePhoto(source);
  const before = fs.readFileSync(source);

  const { exitCode } = await images([dir, "--budget", "40", "--width", "240", "--quiet"]);
  assert.equal(exitCode, 0, "images exited non-zero");

  const out = path.join(dir, "photo.webp");
  assert.ok(fs.existsSync(out), "no photo.webp was written");
  const head = fs.readFileSync(out).subarray(0, 12).toString("ascii");
  assert.equal(head.slice(0, 4), "RIFF", "output is not a RIFF container");
  assert.equal(head.slice(8, 12), "WEBP", "output is not WebP");
  assert.ok(fs.statSync(out).size <= 40 * 1024, `output busts the budget: ${fs.statSync(out).size} bytes`);
  assert.ok(fs.readFileSync(source).equals(before), "the source PNG was modified");
});

await check("images is idempotent: an in-budget WebP is not re-encoded", async () => {
  const dir = path.join(scratch, "photos");
  const out = path.join(dir, "photo.webp");
  const first = fs.readFileSync(out);
  const { exitCode } = await images([dir, "--budget", "40", "--width", "240", "--quiet"]);
  assert.equal(exitCode, 0);
  assert.ok(fs.readFileSync(out).equals(first), "a second run rewrote bytes the budget already accepted");
});

await check("transparency survives the encoder, and --replace refuses without a consumer", async () => {
  const dir = path.join(scratch, "alpha");
  fs.mkdirSync(dir, { recursive: true });
  const src = path.join(dir, "sticker.png");
  writePhoto(src, 240, 160, true);

  const { exitCode } = await images([dir, "--budget", "40", "--width", "240", "--replace", "--root", dir, "--quiet"]);
  assert.equal(exitCode, 0, "the alpha read-back rejected a WebP that kept its transparency");

  const out = path.join(dir, "sticker.webp");
  assert.ok(fs.existsSync(out), "the transparent PNG produced no WebP");
  assert.ok(webpCarriesAlpha(fs.readFileSync(out)), "the WebP has no alpha plane: the sticker was flattened");
  // Nothing in `dir` names sticker.webp — the folder has no sources at all — so
  // the master stays. Deleting it would be the command destroying the only
  // lossless copy of a picture nobody has asked for yet.
  assert.ok(fs.existsSync(src), "--replace removed a source no app references");
});

await check("an opaque WebP is reported as opaque", async () => {
  const dir = path.join(scratch, "photos");
  const opaque = path.join(dir, "photo.webp");
  assert.ok(fs.existsSync(opaque), "run 1 wrote no photo.webp");
  // The negative control for the guard above: a detector that answers true for
  // every file would let a flattened sticker through and prove nothing here.
  assert.equal(webpCarriesAlpha(fs.readFileSync(opaque)), false, "claimed alpha where the source had none");
});

await check("--referenced converts what the app names and skips the rest", async () => {
  const app = path.join(scratch, "app2");
  fs.mkdirSync(path.join(app, "src"), { recursive: true });
  fs.mkdirSync(path.join(app, "assets"), { recursive: true });
  fs.writeFileSync(path.join(app, "index.html"), '<link rel="icon" href="./assets/favicon.png">\n');
  fs.writeFileSync(path.join(app, "src", "data.js"), 'export const hero = "assets/hero.webp";\n');
  writePhoto(path.join(app, "assets", "hero.png"));
  writePhoto(path.join(app, "assets", "favicon.png"));

  const { exitCode } = await images([path.join(app, "assets"), "--budget", "40", "--referenced", "--root", app, "--quiet"]);
  assert.equal(exitCode, 0);
  assert.ok(fs.existsSync(path.join(app, "assets", "hero.webp")), "a referenced source was skipped");
  assert.ok(
    !fs.existsSync(path.join(app, "assets", "favicon.webp")),
    "it invented a favicon.webp: the browser asks for a PNG there and nothing loads the WebP",
  );
});

await check("--replace deletes a master once the app loads its WebP", async () => {
  const app = path.join(scratch, "app3");
  fs.mkdirSync(path.join(app, "src"), { recursive: true });
  fs.mkdirSync(path.join(app, "assets", "shots"), { recursive: true });
  fs.writeFileSync(path.join(app, "src", "data.js"), 'export const shot = "sticker2.webp";\n');
  writePhoto(path.join(app, "assets", "shots", "sticker2.png"));

  const { exitCode } = await images([path.join(app, "assets"), "--budget", "40", "--replace", "--root", app, "--quiet"]);
  assert.equal(exitCode, 0);
  assert.ok(fs.existsSync(path.join(app, "assets", "shots", "sticker2.webp")), "no WebP was written");
  assert.ok(!fs.existsSync(path.join(app, "assets", "shots", "sticker2.png")), "the source the app replaced survived");
});

await check("images leaves assets/logo.png alone: it is the app icon", async () => {
  const app = path.join(scratch, "app4");
  fs.mkdirSync(path.join(app, "src"), { recursive: true });
  fs.mkdirSync(path.join(app, "assets"), { recursive: true });
  // The native icon scripts build this path with path.join, so no source ever
  // contains the string — the protection has to be in the command, not in a scan.
  fs.writeFileSync(path.join(app, "src", "data.js"), 'export const x = "assets/other.webp";\n');
  writePhoto(path.join(app, "assets", "logo.png"));
  writePhoto(path.join(app, "assets", "other.png"));

  const { exitCode } = await images([path.join(app, "assets"), "--budget", "40", "--replace", "--root", app, "--quiet"]);
  assert.equal(exitCode, 0);
  assert.ok(fs.existsSync(path.join(app, "assets", "logo.png")), "the icon master was deleted");
  assert.ok(!fs.existsSync(path.join(app, "assets", "logo.webp")), "a WebP icon was written — Capacitor and Xcode read PNG");
});

await check("prune keeps what the app names and deletes what it does not", async () => {
  const app = path.join(scratch, "app");
  fs.mkdirSync(path.join(app, "src"), { recursive: true });
  fs.mkdirSync(path.join(app, "assets"), { recursive: true });
  writePhoto(path.join(app, "src", "unused.png")); // a master inside src/ is not an asset load
  fs.writeFileSync(path.join(app, "index.html"), '<link rel="icon" href="./assets/kept.png">\n');
  // The comment case: a note that mentions a filename is not a consumer.
  fs.writeFileSync(path.join(app, "src", "app.js"), "// gone.png is the old hero\nexport const x = 1;\n");
  writePhoto(path.join(app, "assets", "kept.png"));
  writePhoto(path.join(app, "assets", "gone.png"));
  writePhoto(path.join(app, "assets", "logo.png")); // template master, referenced by nothing

  const dry = await pruneAssets(["assets", "--root", app, "--quiet"]);
  assert.equal(dry.exitCode, 0);
  assert.ok(fs.existsSync(path.join(app, "assets", "gone.png")), "the dry run deleted something");

  const run = await pruneAssets(["assets", "--root", app, "--apply", "--quiet"]);
  assert.equal(run.exitCode, 0);
  assert.ok(fs.existsSync(path.join(app, "assets", "kept.png")), "a referenced asset was deleted");
  assert.ok(!fs.existsSync(path.join(app, "assets", "gone.png")), "an unreferenced asset survived --apply");
  assert.ok(fs.existsSync(path.join(app, "assets", "logo.png")), "assets/logo.png is never pruned: the native icons are built from it");
});

await check("prune refuses a folder outside the project root", async () => {
  const { exitCode } = await pruneAssets([scratch, "--root", path.join(scratch, "app")]);
  assert.equal(exitCode, 1, "it accepted a path outside the project");
});

fs.rmSync(scratch, { recursive: true, force: true });

if (failures.length) {
  console.log(`\ncheck-images-cli: ${failures.length} failed — ${failures.join(", ")}`);
  process.exit(1);
}
console.log("\ncheck-images-cli: all assertions hold");
