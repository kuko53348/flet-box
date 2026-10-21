/**
 * @file bin/utils/images/index.js
 * @description Format sniffing and decoding for `flet-box to-png`.
 *
 * A file is identified by its leading bytes, never by its extension: an asset
 * called `logo.jpg` that is really a PNG is a real thing in a real project, and
 * converting it by extension would write a PNG with the wrong pixels.
 *
 * Everything here is Node core plus the decoders in this folder. The formats
 * that cannot be decoded without a third-party library — WebP's lossy VP8
 * codec, AVIF/HEIF which are whole video containers, SVG which is vector and
 * needs a rasteriser, TIFF, ICO — are reported as declined, with the reason, by
 * the command that uses this module.
 */

import { decodePng, encodePng } from "./png.js";
import { decodeJpeg } from "./jpeg.js";
import { decodeBmp } from "./bmp.js";
import { decodeGif } from "./gif.js";
import UnsupportedImage from "./unsupported.js";

export { UnsupportedImage };

/**
 * Names the format behind a file's first bytes.
 *
 * @param {Buffer} buf
 * @returns {"png"|"jpeg"|"bmp"|"gif"|"webp"|"avif"|"tiff"|"ico"|"svg"|"unknown"}
 */
export const sniffFormat = (buf) => {
  if (buf.length < 12) return "unknown";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf[0] === 0x42 && buf[1] === 0x4d) return "bmp";
  if (buf.toString("ascii", 0, 3) === "GIF") return "gif";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (buf.toString("ascii", 4, 8) === "ftyp") {
    const brand = buf.toString("ascii", 8, 12);
    if (/^(avif|avis|heic|heix|hevc|mif1|msf1)$/.test(brand)) return "avif";
  }
  if (buf[0] === 0x49 && buf[1] === 0x49 && buf[2] === 0x2a) return "tiff";
  if (buf[0] === 0x4d && buf[1] === 0x4d && buf[2] === 0x00) return "tiff";
  if (buf.readUInt16LE(0) === 0 && buf.readUInt16LE(2) === 1) return "ico";
  const head = buf.toString("utf8", 0, Math.min(buf.length, 256)).trimStart();
  if (head.startsWith("<svg") || head.startsWith("<?xml")) return "svg";
  return "unknown";
};

/**
 * Reads the size and the transparency of a PNG or JPEG from its header, without
 * decoding a single pixel.
 *
 * This exists for the commands that only need to *know* a picture: a budget
 * search wants the frame width to resize from and whether an alpha plane has to
 * survive, and both are in the first bytes. It also covers the files the full
 * decoder declines by rule — a progressive JPEG is a browser-standard export from
 * Photoshop or macOS, and `decodeJpeg` stops at multi-scan coding because that is
 * the honest thing to do in a lossless converter.
 *
 * @param {Buffer} buf - File bytes.
 * @returns {{format: string, width: number, height: number, hasAlpha: boolean|null, note?: string}}
 * @throws {UnsupportedImage} When the format has no readable header here.
 */
export const readImageHeader = (buf) => {
  const format = sniffFormat(buf);

  if (format === "png") {
    if (buf.length < 26) throw new UnsupportedImage("PNG", "the header is truncated");
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    const colorType = buf[25];
    // Chunks run to the end of the file; only `tRNS` matters, and a palette or a
    // grey/RGB file with one is as transparent as colour type 6.
    let tRNS = false;
    let at = 8;
    while (at + 8 <= buf.length) {
      const fourcc = buf.toString("ascii", at, at + 4);
      const size = buf.readUInt32LE(at + 4);
      if (fourcc === "tRNS") tRNS = true;
      if (fourcc === "IHDR" && buf[at + 8 + 1] !== 0) {
        throw new UnsupportedImage("PNG", "Adam7 interlacing is not implemented");
      }
      if (fourcc === "IDAT") break;
      at += 8 + size + 12;
    }
    return {
      format,
      width,
      height,
      hasAlpha: colorType === 4 || colorType === 6 || tRNS,
      note: tRNS && colorType !== 4 && colorType !== 6 ? "tRNS" : undefined,
    };
  }

  if (format === "jpeg") {
    let at = 2;
    while (at + 9 < buf.length) {
      if (buf[at] !== 0xff) {
        at++;
        continue;
      }
      const marker = buf[at + 1];
      if (marker === 0x00 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
        at += 2;
        continue;
      }
      // Start-of-frame markers carry the dimensions at the same offsets whether
      // the scan is baseline (0xC0), progressive (0xC2) or lossless (0xC3).
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8) {
        return {
          format,
          height: buf.readUInt16BE(at + 5),
          width: buf.readUInt16BE(at + 7),
          hasAlpha: false, // JPEG has no alpha channel in any of its codings
          note: marker === 0xc2 ? "progressive" : marker === 0xc3 ? "lossless" : undefined,
        };
      }
      at += 2 + buf.readUInt16BE(at + 2);
    }
    throw new UnsupportedImage("JPEG", "no start-of-frame marker was found");
  }

  throw new UnsupportedImage(format.toUpperCase(), "this tool reads no header for that format");
};

/**
 * Decodes an image of any supported format into RGBA.
 *
 * @param {Buffer} buf - File bytes.
 * @returns {{ format: string, width: number, height: number, rgba: Buffer, note?: string }}
 * @throws {UnsupportedImage} For a format this tool declines.
 * @throws {Error} For a file that claims to be supported but is broken.
 */
export const decodeImage = (buf) => {
  const format = sniffFormat(buf);
  switch (format) {
    case "png":
      return { format, ...decodePng(buf) };
    case "jpeg":
      return { format, ...decodeJpeg(buf) };
    case "bmp":
      return { format, ...decodeBmp(buf) };
    case "gif":
      return { format, ...decodeGif(buf) };
    case "webp":
      throw new UnsupportedImage(
        "WebP",
        "lossy VP8 needs a video codec; shrink it with `flet-box images` instead",
      );
    case "avif":
      throw new UnsupportedImage("AVIF/HEIF", "these are video containers, not still images");
    case "tiff":
      throw new UnsupportedImage("TIFF", "its tag layout is not implemented here");
    case "ico":
      throw new UnsupportedImage("ICO", "an icon sheet holds several images; extract the frame you want first");
    case "svg":
      throw new UnsupportedImage("SVG", "it is vector art and needs a rasteriser, not a decoder");
    default:
      throw new UnsupportedImage("unknown format", "the leading bytes match no image this tool can read");
  }
};

export { decodePng, encodePng, decodeJpeg, decodeBmp, decodeGif };
