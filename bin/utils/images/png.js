/**
 * @file bin/utils/images/png.js
 * @description PNG reader and writer built on `node:zlib` only.
 *
 * PNG is the target format of `flet-box to-png`, so the writer is the important
 * half; the reader exists because a PNG already in `assets/` still has to be
 * decoded to be re-encoded as RGBA (and because every other decoder is checked
 * against a PNG in the test script).
 *
 * The writer always emits a non-interlaced 8-bit truecolour (colour type 6)
 * image: one row filter byte per scanline, then the whole stream through
 * `deflate`. That is the simplest output a conforming decoder must accept, and
 * it keeps the encoder free of filter-selection heuristics whose only merit is
 * file size.
 */

import zlib from "node:zlib";

const SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

/** CRC-32 (IEEE 802.3) table, as required by the PNG chunk format. */
const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

/**
 * @param {Buffer} buf
 * @returns {number} Unsigned CRC-32 of `buf`.
 */
const crc32 = (buf) => {
  let c = -1;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};

/**
 * Assembles one PNG chunk (length, type, data, CRC over type+data).
 *
 * @param {string} type - Four-character chunk type.
 * @param {Buffer} data
 * @returns {Buffer}
 */
const chunk = (type, data) => {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
};

/**
 * Encodes raw RGBA pixels as a PNG.
 *
 * @param {{ width: number, height: number, rgba: Buffer }} image
 * @returns {Buffer} PNG file bytes.
 */
export const encodePng = ({ width, height, rgba }) => {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0; // filter "None"
    rgba.copy(raw, rowStart + 1, y * stride, y * stride + stride);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type: truecolour with alpha
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering
  ihdr[12] = 0; // no interlace

  return Buffer.concat([
    SIGNATURE,
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
};

/**
 * Reads the pixels of a PNG back into RGBA.
 *
 * Colour types 0/2/3/4/6 are expanded to RGBA; 16-bit sources are narrowed with
 * the high byte, which is what an 8-bit container can carry without a rounding
 * pass. Adam7 interlacing is refused rather than silently mis-assembled: the
 * seven sub-image passes need a different row walk, and an interlaced asset is
 * rare enough that a clear error beats a wrong picture.
 *
 * @param {Buffer} buf - PNG file bytes.
 * @returns {{ width: number, height: number, rgba: Buffer }}
 * @throws {Error} When the file is not a PNG it can read.
 */
export const decodePng = (buf) => {
  if (buf.length < 8 || buf.compare(SIGNATURE, 0, 8, 0, 8) !== 0) {
    throw new Error("not a PNG: the signature is missing");
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idat = [];
  let palette = null;
  let transparency = null;

  while (offset + 8 <= buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    const data = buf.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      if (data[10] !== 0) throw new Error("PNG uses a compression method other than deflate");
      interlace = data[12];
    } else if (type === "PLTE") {
      palette = data;
    } else if (type === "tRNS") {
      transparency = data;
    } else if (type === "IDAT") {
      idat.push(Buffer.from(data));
    } else if (type === "IEND") {
      break;
    }
  }

  if (!width || !height) throw new Error("PNG has no IHDR");
  if (interlace !== 0) throw new Error("interlaced (Adam7) PNG is not supported");
  if (![1, 2, 4, 8, 16].includes(bitDepth)) throw new Error(`unsupported PNG bit depth ${bitDepth}`);

  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error(`unknown PNG colour type ${colorType}`);
  if (colorType === 3 && !palette) throw new Error("palette PNG has no PLTE chunk");

  const bitsPerPixel = channels * bitDepth;
  const stride = Math.ceil((width * bitsPerPixel) / 8);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  if (raw.length !== stride * height + height) {
    throw new Error("PNG pixel data has an unexpected length");
  }

  const bytesPerPixel = Math.max(1, Math.ceil(bitsPerPixel / 8));
  const out = Buffer.alloc(width * height * 4);
  const line = Buffer.alloc(stride);
  const previous = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const rowStart = y * (stride + 1);
    const filter = raw[rowStart];
    raw.copy(line, 0, rowStart + 1, rowStart + 1 + stride);
    unfilter(filter, line, previous, bytesPerPixel);

    for (let x = 0; x < width; x++) {
      const rgba = sampleOf(line, x, channels, bitDepth, palette, transparency, colorType);
      const dst = (y * width + x) * 4;
      out[dst] = rgba[0];
      out[dst + 1] = rgba[1];
      out[dst + 2] = rgba[2];
      out[dst + 3] = rgba[3];
    }
    line.copy(previous);
  }

  return { width, height, rgba: out };
};

/**
 * Reverses the per-row filter of one scanline, in place.
 *
 * @param {number} filter - 0 None, 1 Sub, 2 Up, 3 Average, 4 Paeth.
 * @param {Buffer} line - Raw scanline, modified in place.
 * @param {Buffer} previous - Reconstructed previous scanline (zeros on row 0).
 * @param {number} bpp - Bytes per pixel used by the left-neighbour reference.
 * @returns {void}
 */
const unfilter = (filter, line, previous, bpp) => {
  if (filter === 0) return;
  for (let i = 0; i < line.length; i++) {
    const a = i >= bpp ? line[i - bpp] : 0;
    const b = previous[i];
    const c = i >= bpp ? previous[i - bpp] : 0;
    let predict;
    if (filter === 1) predict = a;
    else if (filter === 2) predict = b;
    else if (filter === 3) predict = (a + b) >> 1;
    else if (filter === 4) predict = paeth(a, b, c);
    else throw new Error(`unknown PNG row filter ${filter}`);
    line[i] = (line[i] + predict) & 0xff;
  }
};

/**
 * PNG's Paeth predictor: the neighbour whose distance to `a + b - c` is least.
 *
 * @param {number} a - Left pixel byte.
 * @param {number} b - Pixel above.
 * @param {number} c - Pixel above-left.
 * @returns {number}
 */
const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
};

/**
 * Expands one pixel of any supported colour type to RGBA.
 *
 * @param {Buffer} line - Reconstructed scanline.
 * @param {number} x - Pixel index.
 * @param {number} channels
 * @param {number} bitDepth
 * @param {Buffer|null} palette
 * @param {Buffer|null} transparency
 * @param {number} colorType
 * @returns {number[]} `[r, g, b, a]`, each 0-255.
 */
const sampleOf = (line, x, channels, bitDepth, palette, transparency, colorType) => {
  // The x-th sample of the row, unpacked from whatever sub-byte packing it uses.
  const unpack = (channel) => {
    const position = x * channels + channel;
    if (bitDepth === 16) return line.readUInt16BE(position * 2) >> 8;
    if (bitDepth === 8) return line[position];
    const perByte = Math.floor(8 / bitDepth);
    const byte = line[Math.floor(position / perByte)];
    const shift = 8 - bitDepth * ((position % perByte) + 1);
    return (byte >> shift) & ((1 << bitDepth) - 1);
  };
  // A grey or truecolour ramp stored below 8 bits is a truncated range, so it is
  // scaled up to fill 0-255. A palette index is an address, never a ramp: 3 out
  // of 4 bits means entry 3, not entry 255.
  const at = (channel) =>
    bitDepth >= 8 ? unpack(channel) : Math.round((unpack(channel) * 255) / ((1 << bitDepth) - 1));

  if (colorType === 3) {
    const index = unpack(0);
    return [
      palette[index * 3] ?? 0,
      palette[index * 3 + 1] ?? 0,
      palette[index * 3 + 2] ?? 0,
      // For a palette the tRNS chunk is one alpha byte per entry, in order.
      transparency?.[index] ?? 255,
    ];
  }
  // For colour types 0 and 2 the tRNS chunk always stores each sample as two
  // big-endian bytes, whatever the bit depth.
  if (colorType === 0) {
    const grey = at(0);
    return [grey, grey, grey, transparency ? (transparency.readUInt16BE(0) >> 8) === grey ? 0 : 255 : 255];
  }
  if (colorType === 4) return [at(0), at(0), at(0), at(1)];
  if (colorType === 2) {
    let alpha = 255;
    if (transparency) {
      const r = at(0), g = at(1), b = at(2);
      if (r === (transparency.readUInt16BE(0) >> 8) &&
          g === (transparency.readUInt16BE(2) >> 8) &&
          b === (transparency.readUInt16BE(4) >> 8)) {
        alpha = 0;
      }
    }
    return [at(0), at(1), at(2), alpha];
  }
  return [at(0), at(1), at(2), at(3)];
};

export default encodePng;
