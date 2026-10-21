/**
 * @file bin/utils/imageTools.js
 * @description Finds the lossy image encoder this machine already has, and names
 * the one command that installs it when it does not.
 *
 * `to-png` is the zero-dependency half of image work: it rewrites flat art as the
 * smallest lossless PNG Node core can encode. A photograph is never small in a
 * lossless format, and the only honest way to shrink one is a real encoder —
 * WebP or AVIF. This module does not implement one; it delegates to the platform
 * binary, exactly as `runCloudflare.js` delegates the tunnel to `cloudflared` and
 * `buildAndroid.js` delegates compiling to the Android SDK.
 *
 * A binary is not an npm dependency, so this stays inside the package contract:
 * `dependencies: {}`, and nothing here may import outside `node:*`
 * (scripts/check-cli-install.mjs is the tripwire).
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

/**
 * One encoder invocation spelled out, so the command that runs it stays generic.
 *
 * @typedef {object} Encoder
 * @property {string} bin       Executable to probe and run.
 * @property {string} format    Output container it writes.
 * @property {string} probe     Args that only print a version.
 * @property {(o: {width: number, quality: number, method: number, src: string, out: string}) => string[]} args
 */

/** WebP via libwebp's own CLI: the smallest, most predictable surface. */
const CWEBP = {
  bin: "cwebp",
  format: "webp",
  probe: ["-version"],
  args: ({ width, quality, method, src, out }) => [
    "-quiet",
    "-resize",
    String(width),
    "0",
    "-q",
    String(quality),
    "-m",
    String(method),
    src,
    "-o",
    out,
  ],
};

/** ImageMagick, v7 (`magick`) and v6 (`convert`) take the same arguments here. */
const imagemagick = (bin) => ({
  bin,
  format: "webp",
  probe: ["-version"],
  args: ({ width, quality, method, src, out }) => [
    src,
    "-resize",
    `${width}x`,
    "-quality",
    String(quality),
    "-define",
    `webp:method=${method}`,
    out,
  ],
});

/**
 * Order matters: `cwebp` is the reference encoder for the container, and the two
 * ImageMagick spellings catch the machines where the distro shipped that instead.
 */
const ENCODERS = [CWEBP, imagemagick("magick"), imagemagick("convert")];

/**
 * The package manager this machine is expected to have.
 *
 * macOS and Windows are read off `process.platform`. Linux needs the actual
 * distribution: `apt`, `dnf` and `pacman` are different sentences for the same
 * package, and guessing from the kernel would tell an Arch user to run apt.
 *
 * @returns {{id: string, name: string, install: string[]}}
 */
export const platformInstaller = () => {
  if (process.platform === "darwin") {
    return { id: "brew", name: "Homebrew", install: ["brew", "install", "webp"] };
  }
  if (process.platform === "win32") {
    return {
      id: "winget",
      name: "winget",
      install: ["winget", "install", "--id", "Google.WebP", "-e", "--accept-package-agreements", "--accept-source-agreements"],
    };
  }
  if (process.platform !== "linux") {
    return { id: "unknown", name: process.platform, install: [] };
  }
  // /etc/os-release is the only ID every mainstream distro keeps current.
  let lines = [];
  try {
    lines = fs.readFileSync("/etc/os-release", "utf8").split("\n");
  } catch {
    lines = [];
  }
  const read = (key) => {
    const hit = lines.find((l) => l.startsWith(`${key}=`));
    return hit ? hit.slice(key.length + 1).replace(/^"|"$/g, "") : "";
  };
  const family = [read("ID"), ...read("ID_LIKE").split(/\s+/)].filter(Boolean);
  if (family.some((f) => /debian|ubuntu|linuxmint/.test(f))) {
    return { id: "apt", name: "apt", install: ["sudo", "apt-get", "install", "-y", "webp"] };
  }
  if (family.some((f) => /fedora|rhel|centos|amzn/.test(f))) {
    return { id: "dnf", name: "dnf", install: ["sudo", "dnf", "install", "-y", "libwebp-tools"] };
  }
  if (family.some((f) => /arch|manjaro|endeavouros/.test(f))) {
    return { id: "pacman", name: "pacman", install: ["sudo", "pacman", "-S", "--noconfirm", "libwebp"] };
  }
  return { id: "apk", name: "apk", install: ["sudo", "apk", "add", "--no-cache", "webp"] };
};

/**
 * True when `bin` is runnable — probed with `--version`, never with `which`,
 * so a shim that exists but is broken is not counted as an encoder.
 *
 * @param {string} bin
 * @returns {boolean}
 */
const isRunnable = (bin) => {
  const probe = spawnSync(bin, ["--version"], { encoding: "utf8" });
  return !probe.error;
};

/**
 * @returns {Encoder|null} The first usable encoder on PATH.
 */
export const findEncoder = () => {
  for (const candidate of ENCODERS) {
    if (isRunnable(candidate.bin)) return candidate;
  }
  return null;
};

/**
 * Runs one encoder to a temp file and returns the bytes it produced.
 *
 * @param {Encoder} encoder
 * @param {{src: string, width: number, quality: number, method?: number, out: string}} opts
 * @returns {number|null} Written size, or null when the encoder failed.
 */
export const encode = (encoder, { src, width, quality, method = 6, out }) => {
  const res = spawnSync(
    encoder.bin,
    encoder.args({ src, width, quality, method, out }),
    { stdio: "ignore", encoding: "utf8" },
  );
  if (res.error || res.status !== 0 || !fs.existsSync(out)) return null;
  return fs.statSync(out).size;
};

/**
 * Asks before touching the system. Installing a package is a machine-wide change
 * with a hundred ways to be wrong (no brew, no sudo rights, a locked-down laptop),
 * and a build command that silently runs `sudo` is not something a developer
 * expects from a UI framework's CLI.
 *
 * @param {Encoder|null} encoder - What was already found, if anything.
 * @param {{autoInstall: boolean, isTTY: boolean, quiet: boolean}} opts
 * @returns {Promise<Encoder|null>} The encoder to use, or null when it is missing.
 */
export const ensureEncoder = async (encoder, { autoInstall = false, isTTY = process.stdout.isTTY, quiet = false } = {}) => {
  if (encoder) return encoder;

  const installer = platformInstaller();
  const said = (line) => !quiet && console.log(line);
  const found = findEncoder();
  if (found) return found;

  console.log("");
  console.log(`  No lossy WebP encoder is on PATH (tried: ${ENCODERS.map((e) => e.bin).join(", ")}).`);
  if (!installer.install.length) {
    said(`  This platform (${process.platform}) has no known package manager here.`);
    console.log("  Install libwebp's `cwebp` by hand, or keep the lossless `flet-box to-png`.");
    return null;
  }
  const command = installer.install.join(" ");
  console.log(`  Install it with ${installer.name}:  ${command}`);

  if (!autoInstall) {
    said("  Re-run with --install and this CLI will do it for you.");
    return null;
  }
  if (!isTTY) {
    console.log("  --install needs a terminal (it may ask for a password). Run the command above and retry.");
    return null;
  }
  const res = spawnSync(command.split(" ")[0], command.split(" ").slice(1), { stdio: "inherit" });
  if (res.error || res.status !== 0) {
    console.log(`  ${command} did not succeed — that machine decides, not this CLI.`);
    return null;
  }
  const after = findEncoder();
  if (after) console.log(`  Installed: ${after.bin}`);
  return after;
};

/**
 * Where a scratch file can safely sit next to the asset being written.
 *
 * @param {string} dir
 * @param {string} name
 * @returns {string}
 */
export const tempIn = (dir, name) => path.join(dir, `.${name}.fletbox-tmp.webp`);

/**
 * True when any pixel of a decoded frame is see-through.
 *
 * @param {Buffer} rgba
 * @returns {boolean}
 */
export const hasTransparency = (rgba) => {
  for (let i = 3; i < rgba.length; i += 4) if (rgba[i] !== 255) return true;
  return false;
};

/**
 * True when the WebP bytes carry an alpha plane.
 *
 * There is no WebP decoder in this package — that is what `to-png` declines at
 * `bin/utils/images/index.js` — so "read every pixel back" is not available here.
 * The container is: a transparent WebP says so in its chunk layout, and a lossy
 * encoder that dropped the plane produces a file that simply lacks it. Three
 * spellings, because the encoder chooses between them:
 *
 *   VP8X  extended header, bit 4 of its first flag byte is the A flag
 *   ALPH  the separate alpha chunk a lossy frame with transparency gets
 *   VP8L  lossless: bit 28 of the packed size/version word says alpha is used
 *
 * A plain lossy `VP8 ` frame has no alpha at all, which is the case this catches:
 * an icon or a sticker flattened onto white would otherwise ship as the picture.
 *
 * @param {Buffer} buf - WebP file bytes.
 * @returns {boolean}
 */
export const webpCarriesAlpha = (buf) => {
  if (buf.length < 12) return false;
  if (buf.toString("ascii", 0, 4) !== "RIFF") return false;
  if (buf.toString("ascii", 8, 12) !== "WEBP") return false;
  let at = 12;
  while (at + 8 <= buf.length) {
    const fourcc = buf.toString("ascii", at, at + 4);
    const size = buf.readUInt32LE(at + 4);
    const body = buf.subarray(at + 8, Math.min(at + 8 + size, buf.length));
    if (fourcc === "ALPH") return true;
    if (fourcc === "VP8X") return body.length > 0 && (body[0] & 0x10) !== 0;
    if (fourcc === "VP8L") {
      // byte 0 is the 0x2f lossless signature, then the packed 32-bit field.
      if (body.length < 5) return false;
      return ((body.readUInt32LE(1) >> 28) & 1) === 1;
    }
    // Chunks are padded to an even byte count.
    at += 8 + size + (size % 2);
  }
  return false;
};

/** Kept for callers that want to report the machine they probed. */
export const describeMachine = () => `${os.platform()}/${os.arch()} · ${platformInstaller().name}`;

