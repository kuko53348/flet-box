/**
 * @file bin/commands/toPng.js
 * @description `flet-box to-png` — converts the images of a folder to PNG.
 *
 * JPEG, BMP, GIF and palette PNG files are decoded with the readers in
 * `bin/utils/images` and re-written as PNG by `encodePng`, which chooses the
 * layout (palette, grey, no alpha when none is used) and the row filters that
 * make the smallest file for those exact pixels, using nothing outside Node core.
 * That is what makes the command safe to ship inside a package that has no
 * runtime dependencies, and it is also its honest limit: WebP, AVIF, TIFF, ICO
 * and SVG are reported as declined, because reading them needs a codec or a
 * rasteriser this repo does not have.
 *
 * Nothing is overwritten by default. A `logo.jpg` becomes `logo.png` beside it;
 * if a `logo.png` already exists the file is skipped and said so, because that
 * collision usually means someone already converted it by hand and the two
 * files are not the same picture. `--replace` deletes the source, and only
 * after the PNG it replaces has been read back and checked pixel for pixel.
 * `--optimize` rewrites a PNG that is already there, and only when the new bytes
 * are smaller and hold the same picture.
 */

import fs from "fs";
import path from "path";
import { c, section, dot } from "../utils/colors.js";
import { decodeImage, encodePng, sniffFormat, UnsupportedImage } from "../utils/images/index.js";

const USAGE = `Usage: flet-box to-png [dir] [options]

  dir                 Folder to convert (default: ./assets, or ./public/assets)

Options:
  --out <dir>         Write the PNGs there instead of beside the source
  --optimize          Rewrite files that already are PNG, and only when that makes them smaller
  --replace           Delete each source file after its PNG was written and read back
  --force             Overwrite an existing PNG with the same name
  --recursive         Descend into sub-folders (default: yes)
  --flat              Only the top level of the folder
  --dry-run           Report what would happen; write nothing
  --quiet             Only the summary line`;

/** Folders tried when no path is given, in order. */
const DEFAULT_DIRS = ["assets", "public/assets", "src/assets"];

/** Never wandered into, however deep it sits. */
const SKIPPED_DIRS = new Set(["node_modules", ".git", "dist", "build", ".cache"]);

/**
 * Image-ish files to look at — including the formats this tool will decline.
 *
 * A `.webp` in an assets folder is exactly the asset the developer is asking
 * about, so it is opened, sniffed and reported rather than passed over because
 * its extension is not on a short list. The extension only picks what to read;
 * the bytes still decide what it is.
 */
const IMAGE_FILE = /\.(jpe?g|jfif|png|apng|gif|bmp|webp|avif|heic|heif|tif|tiff|ico|cur|svg)$/i;

/**
 * Collects candidate files under `dir`.
 *
 * @param {string} dir
 * @param {boolean} recursive
 * @returns {string[]} Absolute paths, sorted.
 */
const collect = (dir, recursive) => {
  const found = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (recursive && !SKIPPED_DIRS.has(entry.name)) walk(full);
        continue;
      }
      if (entry.isFile() && IMAGE_FILE.test(entry.name)) found.push(full);
    }
  };
  if (fs.existsSync(dir)) walk(dir);
  return found.sort();
};

/**
 * Byte counts as the report prints them.
 *
 * @param {number} bytes
 * @returns {string}
 */
const size = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * Decodes PNG bytes in memory and asks whether they are still this picture.
 *
 * The writer now chooses palettes and drops alpha channels, so "same size" is no
 * longer evidence of anything: the test is that every pixel reads back equal.
 * Doing it before the write is what lets `--optimize` refuse a rewrite instead of
 * replacing a good asset with a plausible one.
 *
 * @param {Buffer} png - File bytes about to be written.
 * @param {{ width: number, height: number, rgba: Buffer }} image
 * @returns {boolean}
 */
const pngHoldsThePicture = (png, image) => {
  try {
    const decoded = decodeImage(png);
    return (
      decoded.width === image.width &&
      decoded.height === image.height &&
      decoded.rgba.length === image.rgba.length &&
      decoded.rgba.equals(image.rgba)
    );
  } catch {
    return false;
  }
};

/**
 * Reads a file back and confirms it is the PNG that was just written.
 *
 * A truncated write is the failure mode worth guarding: `--replace` would
 * otherwise delete the only copy of the picture.
 *
 * @param {string} file
 * @param {{ width: number, height: number, rgba: Buffer }} expected
 * @returns {boolean}
 */
const writtenPngMatches = (file, expected) => {
  try {
    const buf = fs.readFileSync(file);
    if (sniffFormat(buf) !== "png") return false;
    return pngHoldsThePicture(buf, expected);
  } catch {
    return false;
  }
};

/**
 * Runs the conversion.
 *
 * @param {string[]} args - CLI arguments after the command name.
 * @returns {Promise<{ exitCode: number }>} Non-zero only when a file failed to decode.
 */
export const toPng = async (args = []) => {
  const has = (flag) => args.includes(flag);
  const valueOf = (flag) => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
  };

  if (has("--help") || has("-h")) {
    console.log(USAGE);
    return { exitCode: 0 };
  }

  const quiet = has("--quiet");
  const dryRun = has("--dry-run");
  const replace = has("--replace");
  const force = has("--force");
  const optimize = has("--optimize");
  const recursive = !has("--flat");
  const outDir = valueOf("--out");

  const positional = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--out");
  let target = positional[0] ? path.resolve(positional[0]) : null;
  if (!target) {
    const candidate = DEFAULT_DIRS.map((dir) => path.resolve(dir)).find((dir) => fs.existsSync(dir));
    if (!candidate) {
      console.log(c("red", `Nothing to convert: none of ${DEFAULT_DIRS.join(", ")} exists here.`));
      console.log(c("gray", "  Pass a folder: flet-box to-png <dir>"));
      return { exitCode: 1 };
    }
    target = candidate;
  }
  if (!fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
    console.log(c("red", `Not a folder: ${target}`));
    return { exitCode: 1 };
  }
  if (outDir) fs.mkdirSync(path.resolve(outDir), { recursive: true });

  const files = collect(target, recursive);
  const lines = [];
  let converted = 0;
  let declined = 0;
  let skipped = 0;
  let clash = 0;
  let failed = 0;
  let optimized = 0;
  let optimal = 0;
  let saved = 0;
  let grew = 0;

  for (const file of files) {
    const relative = path.relative(process.cwd(), file) || path.basename(file);
    let image;
    let bytes;
    try {
      bytes = fs.readFileSync(file);
      image = decodeImage(bytes);
    } catch (error) {
      if (error instanceof UnsupportedImage) {
        declined++;
        lines.push(`  ${dot("#f59e0b")} ${relative} — ${c("yellow", "declined")} — ${error.message}`);
      } else {
        failed++;
        lines.push(`  ${dot("#ef4444")} ${relative} — ${c("red", "unreadable")} — ${error.message}`);
      }
      continue;
    }

    // Already PNG bytes: the only question is whether this writer can make them
    // smaller, and `--optimize` is what asks it. A 16-bit source is left alone
    // either way: the reader narrows it to the high byte, so rewriting would
    // trade someone else's bit depth for a smaller file, and "smaller without
    // losing quality" does not cover that.
    if (image.format === "png" && !force) {
      if (bytes.length > 25 && bytes[24] === 16) {
        skipped++;
        lines.push(`  ${dot("#64748b")} ${relative} — 16-bit PNG, left as it is (${image.width}×${image.height})`);
        continue;
      }
      if (!optimize) {
        skipped++;
        lines.push(`  ${dot("#64748b")} ${relative} — already a PNG (${image.width}×${image.height})`);
        continue;
      }

      const before = bytes.length;
      const png = encodePng(image);
      if (png.length >= before) {
        optimal++;
        lines.push(`  ${dot("#64748b")} ${relative} — already the smallest this writer makes it (${size(before)})`);
        continue;
      }
      if (!pngHoldsThePicture(png, image)) {
        failed++;
        lines.push(`  ${dot("#ef4444")} ${relative} — ${c("red", "failed")} — the rewrite does not read back as the same picture`);
        continue;
      }
      saved += before - png.length;
      if (dryRun) {
        optimized++;
        lines.push(`  ${dot("#22d3ee")} ${relative} — ${size(before)} → ${size(png.length)}${c("dim", " [dry run]")}`);
        continue;
      }
      // With no --out the rewrite replaces the file, and it does so by writing
      // beside it and renaming: an in-place rewrite that stops halfways would
      // leave the asset smaller *and* unreadable, with the original already gone.
      const destination = outDir ? path.resolve(outDir, path.basename(file)) : file;
      if (destination !== file) {
        fs.writeFileSync(destination, png);
      } else {
        const temp = `${file}.fletbox-replace.tmp`;
        try {
          fs.writeFileSync(temp, png);
          fs.renameSync(temp, file);
        } catch (error) {
          fs.rmSync(temp, { force: true });
          failed++;
          lines.push(`  ${dot("#ef4444")} ${relative} — ${c("red", "failed")} — ${error.message}`);
          continue;
        }
      }
      optimized++;
      lines.push(`  ${dot("#34d399")} ${relative} — ${c("dim", `optimized ${size(before)} → ${size(png.length)} (−${size(before - png.length)})`)}`);
      continue;
    }

    const destination = path.resolve(
      outDir ? path.resolve(outDir) : path.dirname(file),
      path.basename(file, path.extname(file)) + ".png",
    );

    // A file that is merely *named* .png but holds JPEG bytes would otherwise be
    // overwritten in place, which is the one thing this command never does unless
    // it is told to.
    if (destination === file && !force) {
      skipped++;
      lines.push(`  ${dot("#64748b")} ${relative} — already named .png (${image.width}×${image.height})`);
      continue;
    }
    // Checked before the dry-run branch, so a rehearsal reports the files it
    // would refuse instead of counting them as conversions waiting to happen.
    if (destination !== file && fs.existsSync(destination) && !force) {
      clash++;
      lines.push(`  ${dot("#f59e0b")} ${relative} — ${c("yellow", "kept")} — ${path.basename(destination)} already exists${dryRun ? c("dim", " [dry run]") : " (--force to replace it)"}`);
      continue;
    }

    const png = encodePng({ width: image.width, height: image.height, rgba: image.rgba });
    const note = image.note ? c("dim", ` (${image.note})`) : "";

    // PNG keeps every pixel, so the file this writes for a photograph is several
    // times the JPEG it came from. That is the format, not a bug, and the report
    // says it in numbers instead of letting someone discover it in a deploy.
    const sourceSize = bytes.length;
    if (png.length > sourceSize) grew++;
    const sizeNote = c("dim", png.length > sourceSize
      ? `${size(png.length)} · ${(png.length / sourceSize).toFixed(1)}× the ${image.format} it came from`
      : size(png.length));

    if (dryRun) {
      converted++;
      lines.push(`  ${dot("#22d3ee")} ${relative} → ${path.relative(process.cwd(), destination) || destination} ${image.width}×${image.height} ${sizeNote}${note} ${c("dim", "[dry run]")}`);
      continue;
    }

    fs.writeFileSync(destination, png);
    if (!writtenPngMatches(destination, image)) {
      failed++;
      lines.push(`  ${dot("#ef4444")} ${relative} — ${c("red", "failed")} — the PNG written back does not match`);
      continue;
    }

    let removed = "";
    if (replace && destination !== file) {
      fs.rmSync(file);
      removed = c("dim", " · source removed");
    }
    converted++;
    lines.push(`  ${dot("#34d399")} ${relative} → ${path.relative(process.cwd(), destination) || destination} ${image.width}×${image.height} ${sizeNote}${note}${removed}`);
  }

  if (!quiet) {
    console.log(section("🖼", `to-png — ${path.relative(process.cwd(), target) || "."}`));
    for (const line of lines) console.log(line);
  }
  if (!files.length) console.log(c("gray", "  No image files in that folder."));

  const parts = [`${converted} converted`, `${declined} declined`, `${skipped} already png`];
  if (optimized) parts.push(`${optimized} optimized`);
  if (optimal) parts.push(`${optimal} already optimal`);
  if (saved) parts.push(c("green", `−${size(saved)}`));
  if (clash) parts.push(`${clash} name clash`);
  if (failed) parts.push(`${failed} failed`);
  console.log(`\n  ${parts.join("  ·  ")}${dryRun ? c("yellow", "  ·  nothing written (--dry-run)") : ""}\n`);

  // The advice belongs with the count, not with ninety individual lines.
  if (grew) {
    console.log(c("yellow", `  ${grew} of the written PNG${grew === 1 ? " is" : "s are"} bigger than the file it came from.`));
    console.log(c("gray", "  A PNG stores every pixel, so a photograph is never small in it: keep the JPEG (or a WebP from a tool with a codec) for that picture and let this convert the flat art, logos and icons."));
    console.log("");
  }

  return { exitCode: failed ? 1 : 0 };
};

export default toPng;
