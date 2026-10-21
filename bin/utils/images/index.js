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
        "lossy VP8 needs a video codec; re-export as PNG or JPEG",
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
