#!/usr/bin/env node

/**
 * @file scripts/check-image-convert.mjs
 * @description Contract check for `flet-box to-png` and its decoders.
 *
 * `tests/fixtures/images.json` holds real file bytes plus the pixels an
 * independent decoder produced for them, so every assertion here compares this
 * repo's readers against someone else's. Regenerate the fixtures with
 * `python3 scripts/generate-image-fixtures.py` (dev-only: it needs Pillow,
 * which the published package does not).
 *
 * Lossless fixtures must match byte for byte. JPEG is the one format not
 * asserted exactly, and its expected pixels are not the pre-compression image
 * but Pillow's decode of the same bytes: the encoder already threw information
 * away, so the only fair question is whether this reader shows what a viewer
 * shows. On that basis the float IDCT and the chroma resampler agree with
 * libjpeg to within 2 units per channel, and the printed numbers below are the
 * evidence.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { decodeImage, encodePng, sniffFormat, UnsupportedImage } from "../bin/utils/images/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtures = JSON.parse(
  fs.readFileSync(path.join(root, "tests", "fixtures", "images.json"), "utf8"),
).fixtures;

let pass = 0;
const failures = [];

/**
 * @param {string} name
 * @param {boolean} ok
 * @param {string} [detail]
 */
const check = (name, ok, detail = "") => {
  if (ok) pass++;
  else failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
};

/**
 * Mean and worst per-channel difference between two RGBA buffers.
 *
 * @param {Buffer} a
 * @param {Buffer} b
 * @returns {{ mean: number, max: number, badAlpha: number }}
 */
const diff = (a, b) => {
  let sum = 0;
  let max = 0;
  let badAlpha = 0;
  for (let i = 0; i < a.length; i += 4) {
    for (let channel = 0; channel < 4; channel++) {
      const d = Math.abs(a[i + channel] - b[i + channel]);
      sum += d;
      if (d > max) max = d;
      if (channel === 3 && d > 0) badAlpha++;
    }
  }
  // `a.length` is the number of channel values, since every pixel has four.
  return { mean: sum / a.length, max, badAlpha };
};

for (const fixture of fixtures) {
  const source = Buffer.from(fixture.source, "base64");

  if (fixture.kind === "decline") {
    let message = "";
    try {
      decodeImage(source);
    } catch (error) {
      message = error.message;
    }
    check(
      `${fixture.name} is refused`,
      message.includes(fixture.reason),
      message ? `said "${message}"` : "decoded it without complaining",
    );
    continue;
  }

  const expected = Buffer.from(fixture.rgba, "base64");
  let image;
  try {
    image = decodeImage(source);
  } catch (error) {
    check(`${fixture.name} decodes`, false, error.message);
    continue;
  }

  check(`${fixture.name} size`, image.width === fixture.width && image.height === fixture.height,
    `got ${image.width}×${image.height}, expected ${fixture.width}×${fixture.height}`);
  if (image.width !== fixture.width || image.height !== fixture.height) continue;

  const error = diff(image.rgba, expected);

  if (fixture.name.startsWith("jpeg")) {
    // Measured against libjpeg's own pixels: every fixture here sits at mean
    // 0.33 or below with a worst single channel of 2. The limits are that plus
    // headroom, so a regression is visible as a number rather than a mystery —
    // and the printed line below is what a change in the IDCT or the chroma
    // resampler has to pass through.
    check(`${fixture.name} pixels`, error.mean <= 1 && error.max <= 4,
      `mean ${error.mean.toFixed(3)} max ${error.max} (limits 1/4)`);
    console.log(`  ${fixture.name.padEnd(18)} mean ${error.mean.toFixed(3)}  max ${error.max}`);
  } else {
    check(`${fixture.name} pixels`, error.mean === 0 && error.badAlpha === 0,
      `mean ${error.mean} max ${error.max} alpha-mismatches ${error.badAlpha}`);
  }

  // The writer must round-trip through the reader, or a converted asset is only
  // as good as the tool that reads it next.
  const png = encodePng({ width: image.width, height: image.height, rgba: image.rgba });
  const again = decodeImage(png);
  check(`${fixture.name} re-encodes`, again.rgba.equals(image.rgba), "the PNG written from these pixels differs");
}

// ---------------------------------------------------------------- sniffing
const cases = [
  ["png", fixtures.find((f) => f.name === "png-rgba").source],
  ["jpeg", fixtures.find((f) => f.name === "jpeg-444").source],
  ["gif", fixtures.find((f) => f.name === "gif-basic").source],
  ["bmp", fixtures.find((f) => f.name === "bmp-24").source],
  ["webp", fixtures.find((f) => f.name === "webp").source],
];
for (const [format, base64] of cases) {
  check(`sniff ${format}`, sniffFormat(Buffer.from(base64, "base64")) === format);
}
check("a png named .jpg is still read as png",
  sniffFormat(Buffer.from(fixtures.find((f) => f.name === "png-rgba").source, "base64")) === "png");
check("UnsupportedImage carries its reason",
  new UnsupportedImage("WebP", "needs a codec").message.includes("needs a codec"));

// ---------------------------------------------------------------- the command
const work = fs.mkdtempSync(path.join(os.tmpdir(), "fletbox-topng-"));
const assets = path.join(work, "assets");
fs.mkdirSync(assets, { recursive: true });
const write = (name, fixtureName) =>
  fs.writeFileSync(path.join(assets, name), Buffer.from(fixtures.find((f) => f.name === fixtureName).source, "base64"));

write("logo.jpg", "jpeg-444");
write("badge.gif", "gif-basic");
write("plain.bmp", "bmp-24");
write("keep.png", "png-rgba");
write("sprite.webp", "webp");

const cli = path.join(root, "bin", "cli.js");
const run = (args) =>
  execFileSync(process.execPath, [cli, "to-png", ...args], { encoding: "utf8", cwd: work });

const dry = run([assets, "--dry-run", "--quiet"]);
check("dry run writes nothing", !fs.existsSync(path.join(assets, "logo.png")), dry);
check("dry run is reported", dry.includes("nothing written"), dry);

const first = run([assets, "--quiet"]);
check("jpg became png", fs.existsSync(path.join(assets, "logo.png")));
check("gif became png", fs.existsSync(path.join(assets, "badge.png")));
check("bmp became png", fs.existsSync(path.join(assets, "plain.png")));
check("the source stayed", fs.existsSync(path.join(assets, "logo.jpg")));
check("a png is left alone", first.includes("1 already png"), first);
check("webp is declined, not failed", first.includes("1 declined") && !first.includes("failed"), first);

const converted = decodeImage(fs.readFileSync(path.join(assets, "logo.png")));
const original = decodeImage(Buffer.from(fixtures.find((f) => f.name === "jpeg-444").source, "base64"));
check("the png on disk holds the same picture", converted.rgba.equals(original.rgba));

// Something already owns the name — and it is not the picture. A re-run must
// leave that file alone rather than quietly "fixing" someone else's asset.
const junk = "this is not a png";
fs.writeFileSync(path.join(assets, "logo.png"), junk);
const second = run([assets]);
check("a name clash is kept, not overwritten",
  second.includes("logo.png already exists") && fs.readFileSync(path.join(assets, "logo.png"), "utf8") === junk,
  second);
check("a clash is counted as a clash", second.includes("3 name clash"), second);

const elsewhere = path.join(work, "png-out");
run([assets, "--quiet", "--force"]);
check("--force replaces what was in the way",
  decodeImage(fs.readFileSync(path.join(assets, "logo.png"))).rgba.equals(original.rgba));
run([assets, "--quiet", "--out", elsewhere]);
check("--out writes beside the folder instead", fs.existsSync(path.join(elsewhere, "badge.png")));

const replaced = run([assets, "--replace", "--force"]);
check("--replace removed the jpg", !fs.existsSync(path.join(assets, "logo.jpg")), replaced);
check("--replace says so", replaced.includes("source removed"), replaced);
check("--replace kept the png", fs.existsSync(path.join(assets, "logo.png")));
check("--replace never deletes a png's own bytes", fs.existsSync(path.join(assets, "keep.png")), replaced);

// A folder with nothing convertible is a success, not an error.
const empty = path.join(work, "empty");
fs.mkdirSync(empty);
check("an empty folder exits 0", run([empty, "--quiet"]).includes("0 converted"));

let missingFailed = false;
try {
  execFileSync(process.execPath, [cli, "to-png", path.join(work, "nowhere")], { encoding: "utf8", cwd: work, stdio: "pipe" });
} catch (error) {
  missingFailed = error.status === 1;
}
check("a missing folder exits 1", missingFailed);

fs.rmSync(work, { recursive: true, force: true });

console.log(`\nIMAGE CONVERT: ${pass} OK, ${failures.length} failed`);
for (const failure of failures) console.log(`  ✗ ${failure}`);
process.exit(failures.length ? 1 : 0);
