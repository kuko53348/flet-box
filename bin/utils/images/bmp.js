/**
 * @file bin/utils/images/bmp.js
 * @description Uncompressed Windows BMP reader.
 *
 * BMP is the one raster format whose pixels can be lifted straight out of the
 * file, so this is mostly header arithmetic. Run-length variants (BI_RLE8,
 * BI_RLE4) and OS/2 headers are refused rather than guessed at: they are
 * decades old, rare in an assets folder, and a half-read RLE stream produces
 * garbage that still looks like a picture.
 */

import UnsupportedImage from "./unsupported.js";

/**
 * Decodes a BMP into RGBA.
 *
 * @param {Buffer} buf - File bytes.
 * @returns {{ width: number, height: number, rgba: Buffer }}
 * @throws {Error} Naming the unsupported combination of header fields.
 */
export const decodeBmp = (buf) => {
  if (buf.length < 54 || buf.toString("ascii", 0, 2) !== "BM") {
    throw new Error("not a BMP: missing the BM signature");
  }

  const dataOffset = buf.readUInt32LE(10);
  const headerSize = buf.readUInt32LE(14);
  if (headerSize < 40) throw new UnsupportedImage("BMP", "OS/2 BITMAPCOREHEADER is not implemented");

  const width = buf.readInt32LE(18);
  const rawHeight = buf.readInt32LE(22);
  const bitCount = buf.readUInt16LE(28);
  const compression = buf.readUInt32LE(30);

  if (compression !== 0) {
    throw new UnsupportedImage("BMP", `compression mode ${compression} (only uncompressed BI_RGB is implemented)`);
  }
  if (![1, 4, 8, 24, 32].includes(bitCount)) {
    throw new UnsupportedImage("BMP", `${bitCount}-bit depth is not implemented (1, 4, 8, 24 and 32 are)`);
  }

  const topDown = rawHeight < 0;
  const height = Math.abs(rawHeight);
  const palette = [];
  if (bitCount <= 8) {
    // `biClrUsed` lives at 46 — reading it earlier returns the low bytes of the
    // image size, and a file whose "palette" claims 67 million entries is only
    // one bad offset away from exhausting the heap.
    const paletteStart = 14 + headerSize;
    const declared = buf.readUInt32LE(46);
    const needed = 1 << bitCount;
    const entries = declared > 0 ? Math.min(declared, needed) : needed;
    const room = Math.floor((dataOffset - paletteStart) / 4);
    if (room < entries) {
      throw new Error(`BMP palette claims ${entries} entries but only ${Math.max(0, room)} fit before the pixels`);
    }
    for (let i = 0; i < entries; i++) {
      const base = paletteStart + i * 4;
      palette.push([buf[base + 2], buf[base + 1], buf[base], 255]);
    }
  }

  const rgba = Buffer.alloc(width * height * 4);
  const rowBytes = Math.ceil((width * bitCount) / 8);
  const stride = Math.ceil(rowBytes / 4) * 4;

  for (let y = 0; y < height; y++) {
    const sourceRow = dataOffset + (topDown ? y : height - 1 - y) * stride;
    for (let x = 0; x < width; x++) {
      const dst = (y * width + x) * 4;
      if (bitCount === 32) {
        const base = sourceRow + x * 4;
        rgba[dst] = buf[base + 2];
        rgba[dst + 1] = buf[base + 1];
        rgba[dst + 2] = buf[base];
        rgba[dst + 3] = buf[base + 3];
      } else if (bitCount === 24) {
        const base = sourceRow + x * 3;
        rgba[dst] = buf[base + 2];
        rgba[dst + 1] = buf[base + 1];
        rgba[dst + 2] = buf[base];
        rgba[dst + 3] = 255;
      } else {
        const shift = bitCount === 1 ? 7 - (x % 8) : bitCount === 4 ? (x % 2 ? 0 : 4) : 0;
        const mask = (1 << bitCount) - 1;
        const index = (buf[sourceRow + Math.floor((x * bitCount) / 8)] >> shift) & mask;
        const colour = palette[index] || [0, 0, 0, 255];
        rgba[dst] = colour[0];
        rgba[dst + 1] = colour[1];
        rgba[dst + 2] = colour[2];
        rgba[dst + 3] = colour[3];
      }
    }
  }

  return { width, height, rgba };
};

export default decodeBmp;
