/**
 * @file bin/commands/images.js
 * @description `flet-box images` — shrinks a folder of photos to a byte budget
 * with the platform's own WebP encoder.
 *
 * The problem this solves is a connection, not a disk: a page that pulls 8 MB of
 * photographs never finishes loading, and every visitor pays for all of them at
 * once. So the unit of work is the per-file budget, and the search goes in the
 * order that costs quality least — throw away pixels nobody can see first, then
 * ask the encoder harder.
 *
 * `to-png` is the sibling command for flat art. It stays lossless and needs no
 * binary at all; this one needs a real encoder and says which one it found,
 * because a photograph has no lossless answer. What it also cannot do is verify
 * pixels: with no WebP decoder in the package, the read-back check is the
 * container plus the alpha plane, which is why `--replace` asks the app's own
 * sources before it deletes a master.
 */

import fs from "node:fs";
import path from "node:path";
import { c, section, dot } from "../utils/colors.js";
import { decodeImage, readImageHeader, UnsupportedImage } from "../utils/images/index.js";
import { readAppSources, references, protectedMaster } from "../utils/appSources.js";
import { ensureEncoder, findEncoder, encode, tempIn, describeMachine, hasTransparency, webpCarriesAlpha } from "../utils/imageTools.js";

const USAGE = `Usage: flet-box images [dir] [options]

  dir                 Folder of photos (default: ./assets, or ./public/assets)

Options:
  --budget <KB>       Largest file to accept, per image (default: 40)
  --width <px>        Never exceed this pixel width (default: the source width)
  --quality <n>       Highest quality to try (default: 80, floor 62)
  --referenced        Only convert sources whose .webp the app's own code names
  --root <dir>        Project root the sources are read from (default: .)
  --force             Overwrite an existing WebP with the same name
  --replace           Delete each source after its WebP was written and read back
  --install           Install the encoder this machine is missing
  --dry-run           Report what would happen; write nothing
  --quiet             Only the summary line
  --help              This page`;

const DEFAULT_DIRS = ["assets", "public/assets", "src/assets"];
const SKIPPED_DIRS = new Set(["node_modules", ".git", "dist", "build", ".cache", "www"]);
const SOURCE_FILE = /\.(jpe?g|png)$/i;

/**
 * Pixels before quality, always in that order. A soft 540px photo at q70 is a
 * better picture than a blocky 540px one at q44, and nobody can see the pixels
 * between 2x the width the layout paints and the sensor's native 2000.
 */
const WIDTH_SCALES = [1, 0.9, 0.8, 0.7, 0.62];
const QUALITY_FLOOR = 62;

const size = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : bytes >= 1024
      ? `${Math.round(bytes / 1024)} KB`
      : `${bytes} B`;

/**
 * @param {string} dir
 * @returns {string[]} Absolute paths, sorted.
 */
const collect = (dir) => {
  const found = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRS.has(entry.name)) walk(full);
        continue;
      }
      if (entry.isFile() && SOURCE_FILE.test(entry.name)) found.push(full);
    }
  };
  if (fs.existsSync(dir)) walk(dir);
  return found.sort();
};

/**
 * Confirms the bytes on disk are a WebP container.
 *
 * @param {Buffer} buf
 * @returns {boolean}
 */
const isWebPBytes = (buf) =>
  buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP";

/**
 * Runs the shrink.
 *
 * @param {string[]} args - CLI arguments after the command name.
 * @returns {Promise<{exitCode: number}>} Non-zero when a file failed to encode.
 */
export const images = async (args = []) => {
  const has = (flag) => args.includes(flag);
  const valueOf = (flag) => {
    const i = args.indexOf(flag);
    return i >= 0 ? args[i + 1] : undefined;
  };

  if (has("--help") || has("-h")) {
    console.log(USAGE);
    return { exitCode: 0 };
  }

  const quiet = has("--quiet");
  const dryRun = has("--dry-run");
  const force = has("--force");
  const replace = has("--replace");
  const referenced = has("--referenced");
  const budgetKB = Number(valueOf("--budget") || 40);
  const capWidth = Number(valueOf("--width") || 0);
  const topQuality = Number(valueOf("--quality") || 80);
  const root = path.resolve(valueOf("--root") || ".");

  if (!Number.isFinite(budgetKB) || budgetKB <= 0) {
    console.log(c("red", `--budget wants a number of kilobytes, got: ${valueOf("--budget")}`));
    return { exitCode: 1 };
  }

  const positional = args.filter(
    (a, i) => !a.startsWith("--") && !["--budget", "--width", "--quality", "--root"].includes(args[i - 1]),
  );
  let target = positional[0] ? path.resolve(positional[0]) : null;
  if (!target) {
    target = DEFAULT_DIRS.map((d) => path.resolve(d)).find((d) => fs.existsSync(d)) || null;
  }
  if (!target || !fs.existsSync(target) || !fs.statSync(target).isDirectory()) {
    console.log(c("red", `Nothing to convert: ${target || DEFAULT_DIRS.join(", ")} is not a folder here.`));
    console.log(c("gray", "  Pass one: flet-box images assets/landing --budget 40"));
    return { exitCode: 1 };
  }

  const encoder = await ensureEncoder(findEncoder(), { autoInstall: has("--install"), quiet });
  if (!encoder) {
    console.log("");
    return { exitCode: 1 };
  }

  // The name gate is read from the app's own sources, comments stripped, so a
  // note like `mojito.jpg is the frappé` does not count as a consumer. `--replace`
  // always loads it: deleting a master because its WebP exists is only safe when
  // something in the project already asks for that WebP by name.
  const namesSources = referenced || replace;
  const text = namesSources ? readAppSources(root) : "";
  const keyOf = (file) => {
    const rel = path.relative(root, file).split(path.sep).join("/");
    return rel && !rel.startsWith("..") ? rel : path.basename(file);
  };
  const named = (file) => references(text, keyOf(file));

  const qualities = [];
  for (let q = Math.max(QUALITY_FLOOR, Math.min(topQuality, 100)); q >= QUALITY_FLOOR; q -= 4) qualities.push(q);
  if (qualities[qualities.length - 1] !== QUALITY_FLOOR) qualities.push(QUALITY_FLOOR);

  const files = collect(target);
  const lines = [];
  let written = 0;
  let inside = 0;
  let over = 0;
  let failed = 0;
  let clash = 0;
  let removed = 0;
  let masters = 0;
  let unreferenced = 0;
  let sourceKept = 0;
  let beforeBytes = 0;
  let afterBytes = 0;

  for (const file of files) {
    const relative = path.relative(process.cwd(), file) || path.basename(file);
    const out = path.join(path.dirname(file), path.basename(file, path.extname(file)) + ".webp");

    const master = protectedMaster(keyOf(file));
    if (master) {
      masters++;
      lines.push(`  ${dot("#64748b")} ${relative} — ${c("dim", `left alone: ${master.why}`)}`);
      continue;
    }

    // The WebP, not the source: an app that loads `assets/favicon.png` by name
    // means it — a browser tab icon and a social preview are declared formats, and
    // a `favicon.webp` beside them is a file nothing requests. Point the code at
    // the .webp and this converts it.
    if (referenced && !named(out)) {
      unreferenced++;
      lines.push(`  ${dot("#64748b")} ${relative} — ${c("dim", `not referenced: no source loads ${path.basename(out)}`)}`);
      continue;
    }

    let dims;
    let sourceBytes;
    try {
      sourceBytes = fs.readFileSync(file);
    } catch (error) {
      failed++;
      lines.push(`  ${dot("#ef4444")} ${relative} — ${c("red", "unreadable")} — ${error.message}`);
      continue;
    }
    let fromHeader = false;
    try {
      dims = decodeImage(sourceBytes);
    } catch (error) {
      if (!(error instanceof UnsupportedImage)) {
        failed++;
        lines.push(`  ${dot("#ef4444")} ${relative} — ${c("red", "failed")} — ${error.message}`);
        continue;
      }
      // A progressive JPEG is a ordinary export from Photoshop or macOS and every
      // browser paints it; the pixel decoder declines multi-scan coding because
      // that is the honest thing for a lossless converter to do. A budget search
      // needs no pixels: the frame size and the presence of an alpha plane are
      // both in the header, and the encoder reads the file itself.
      try {
        dims = readImageHeader(sourceBytes);
        fromHeader = true;
      } catch {
        failed++;
        lines.push(`  ${dot("#ef4444")} ${relative} — ${c("red", "declined")} — ${error.message}`);
        continue;
      }
    }

    const needsAlpha = fromHeader ? dims.hasAlpha === true : hasTransparency(dims.rgba);
    const fullWidth = capWidth > 0 ? Math.min(dims.width, capWidth) : dims.width;
    beforeBytes += sourceBytes.length;

    // A file already inside the budget is not re-encoded: another lossy pass on
    // bytes the same encoder already chose buys nothing anyone can see.
    if (!force && fs.existsSync(out) && fs.statSync(out).size <= budgetKB * 1024) {
      inside++;
      afterBytes += fs.statSync(out).size;
      continue;
    }
    if (fs.existsSync(out) && !force) {
      clash++;
      lines.push(`  ${dot("#f59e0b")} ${relative} — ${c("yellow", "kept")} — ${path.basename(out)} already exists (--force to replace it)`);
      continue;
    }

    const tmp = tempIn(path.dirname(file), path.basename(file, path.extname(file)));
    // The widest frame that still fits at an acceptable quality. Every scale is
    // tried even when none of them fits, and the smallest attempt is kept: a file
    // that cannot make the budget should still ship as small as it can, not be
    // skipped and left at 900 KB.
    let chosen = null;
    let smallest = null;
    for (const scale of WIDTH_SCALES) {
      const width = Math.max(1, Math.round(fullWidth * scale));
      for (const quality of qualities) {
        const bytes = encode(encoder, { src: file, width, quality, out: tmp });
        if (bytes === null) continue;
        const candidate = { width, quality, bytes };
        if (!smallest || candidate.bytes < smallest.bytes) smallest = candidate;
        if (bytes <= budgetKB * 1024) {
          chosen = candidate;
          break;
        }
      }
      if (chosen) break;
    }
    fs.rmSync(tmp, { force: true });
    const final = chosen || smallest;

    if (!final) {
      failed++;
      lines.push(`  ${dot("#ef4444")} ${relative} — ${c("red", "failed")} — ${encoder.bin} produced nothing for it`);
      continue;
    }

    const overBudget = final.bytes > budgetKB * 1024;
    afterBytes += final.bytes;
    if (overBudget) over++;
    const height = Math.max(1, Math.round((final.width / dims.width) * dims.height));

    if (dryRun) {
      written++;
      lines.push(
        `  ${dot("#22d3ee")} ${relative} → ${path.basename(out)} ${final.width}×${height} q${final.quality} ${size(sourceBytes.length)} → ${c(overBudget ? "yellow" : "green", size(final.bytes))}${overBudget ? c("yellow", " OVER") : ""}${needsAlpha ? c("dim", " ·alpha") : ""}${c("dim", " [dry run]")}`,
      );
      continue;
    }

    encode(encoder, { src: file, width: final.width, quality: final.quality, out });
    let back = null;
    try {
      back = fs.readFileSync(out);
    } catch {
      back = null;
    }
    if (!back || !isWebPBytes(back)) {
      failed++;
      lines.push(`  ${dot("#ef4444")} ${relative} — ${c("red", "failed")} — the WebP written back is not readable`);
      continue;
    }
    // The one pixel-level promise this container allows: if the source had a
    // transparent pixel, the output must still have an alpha plane. A sticker
    // flattened onto white is a different picture, and it is the kind of loss a
    // byte budget cannot report.
    if (needsAlpha && !webpCarriesAlpha(back)) {
      failed++;
      fs.rmSync(out, { force: true });
      lines.push(`  ${dot("#ef4444")} ${relative} — ${c("red", "failed")} — ${path.basename(out)} has no alpha plane; the source's transparency was dropped`);
      continue;
    }
    written++;
    let gone = "";
    if (replace && named(out)) {
      fs.rmSync(file);
      removed++;
      gone = c("dim", " · source removed");
    } else if (replace) {
      sourceKept++;
      gone = c("dim", ` · source kept: the app names ${path.basename(file)}, not ${path.basename(out)}`);
    }
    lines.push(
      `  ${dot("#34d399")} ${relative} → ${path.basename(out)} ${final.width}×${height} q${final.quality} ${size(sourceBytes.length)} → ${c(overBudget ? "yellow" : "green", size(final.bytes))}${overBudget ? c("yellow", ` OVER ${budgetKB}KB`) : ""}${needsAlpha ? c("dim", " ·alpha") : ""}${gone}`,
    );
  }

  if (!quiet) {
    console.log(section("🖼", `images — ${path.relative(process.cwd(), target) || "."}`));
    for (const line of lines) console.log(line);
  }
  if (!files.length) console.log(c("gray", "  No JPG or PNG files in that folder."));

  const parts = [
    `${written} written`,
    inside ? `${inside} already inside budget` : null,
    `${over} over ${budgetKB}KB`,
    masters ? `${masters} master kept` : null,
    unreferenced ? `${unreferenced} not referenced` : null,
    clash ? `${clash} name clash` : null,
    removed ? `${removed} sources removed` : null,
    sourceKept ? `${sourceKept} sources kept` : null,
    failed ? `${failed} failed` : null,
    size(beforeBytes) + " → " + c(afterBytes < beforeBytes ? "green" : "yellow", size(afterBytes)),
  ].filter(Boolean);
  console.log(`\n  ${describeMachine()} · ${encoder.bin}\n`);
  console.log(`  ${parts.join("  ·  ")}${dryRun ? c("yellow", "  ·  nothing written (--dry-run)") : ""}\n`);

  return { exitCode: failed ? 1 : 0 };
};

export default images;
