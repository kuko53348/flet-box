/**
 * @file bin/utils/images/jpeg.js
 * @description Baseline and extended sequential JPEG decoder, in plain JS.
 *
 * Covers what a camera or an export tool writes for a normal `.jpg`: 8-bit DCT
 * with Huffman coding, one or three components, any sampling factor (4:4:4,
 * 4:2:2, 4:2:0, 4:4:0 and the odd 4:1:1), restart intervals, and the non-interleaved
 * form where each component gets its own scan.
 *
 * What it refuses — naming the feature it found — is progressive JPEG,
 * arithmetic coding, lossless JPEG, 12-bit precision and CMYK. Those are
 * different entropy coders and colour spaces, not edge cases of this one, and a
 * converter that quietly produced a plausible-but-wrong picture would be worse
 * than one that declines. Refusals are `UnsupportedImage`, so the caller reports
 * them as declined assets rather than broken files: a folder of WhatsApp photos
 * is not a failing build.
 *
 * The IDCT is the textbook separable float transform rather than an AAN-style
 * fast one: it is a few lines, obviously correct, and asset-sized images are not
 * the bottleneck of a build step. Subsampled chroma is interpolated, not
 * nearest-picked, which is the difference between agreeing with a viewer to
 * within 2 units and standing eight times further off on a hard colour edge.
 */

import UnsupportedImage from "./unsupported.js";

/** Coefficient k of the scan order, expressed as its position in the block. */
const ZIGZAG = [
  0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5,
  12, 19, 26, 33, 40, 48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28,
  35, 42, 49, 56, 57, 50, 43, 36, 29, 22, 15, 23, 30, 37, 44, 51,
  58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54, 47, 55, 62, 63,
];

/** COS[i][k] = ½·C(k)·cos((2i+1)kπ/16): the separable IDCT kernel. */
const COS = (() => {
  const table = [];
  for (let i = 0; i < 8; i++) {
    const row = [];
    for (let k = 0; k < 8; k++) {
      const scale = k === 0 ? Math.SQRT1_2 : 1;
      row.push(0.5 * scale * Math.cos(((2 * i + 1) * k * Math.PI) / 16));
    }
    table.push(row);
  }
  return table;
})();

/**
 * Builds a Huffman table from its code counts and symbol values.
 *
 * Keys pack the code length into the high bits so the bit reader can look a code
 * up without building a string per bit — on a 6 MB scan that difference is the
 * whole decode time.
 *
 * @param {Buffer} counts - 16 bytes: how many codes of each length, 1 through 16.
 * @param {Buffer} values - The symbol values, in code order.
 * @returns {Map<number, number>}
 */
const buildHuffman = (counts, values) => {
  const map = new Map();
  let code = 0;
  let index = 0;
  for (let length = 1; length <= 16; length++) {
    for (let n = 0; n < counts[length - 1]; n++) {
      map.set((length << 16) | code, values[index]);
      code++;
      index++;
    }
    code <<= 1;
  }
  return map;
};

/** Reads a JPEG entropy-coded segment one bit at a time. */
class BitStream {
  /** @param {Buffer} buf - Already un-stuffed bytes of one restart interval. */
  constructor(buf) {
    this.buf = buf;
    this.byte = 0;
    this.bit = 0;
  }

  /** @returns {number} Next bit, 0 or 1. */
  readBit() {
    if (this.byte >= this.buf.length) throw new Error("JPEG scan data ended early");
    const bit = (this.buf[this.byte] >> (7 - this.bit)) & 1;
    if (++this.bit === 8) {
      this.bit = 0;
      this.byte++;
    }
    return bit;
  }

  /** @param {number} count - Up to 16 bits, most significant first. */
  readBits(count) {
    let value = 0;
    for (let i = 0; i < count; i++) value = (value << 1) | this.readBit();
    return value;
  }

  /**
   * Walks the Huffman tree bit by bit.
   *
   * @param {Map<number, number>} table
   * @returns {number} Symbol; for AC tables this packs the zero-run in the high
   *   nibble and the magnitude size in the low one.
   */
  decode(table) {
    let code = 0;
    for (let length = 1; length <= 16; length++) {
      code = (code << 1) | this.readBit();
      const symbol = table.get((length << 16) | code);
      if (symbol !== undefined) return symbol;
    }
    throw new Error("JPEG Huffman code is not canonical");
  }
}

/**
 * Reads the amplitude that follows a size symbol.
 *
 * JPEG writes these as offset binary: size 3 covers -7..-4 and 4..7, so a value
 * below the halfway point has had its leading bit cleared, not its sign set.
 *
 * @param {BitStream} stream
 * @param {number} size
 * @returns {number}
 */
const extend = (stream, size) => {
  if (size === 0) return 0;
  const value = stream.readBits(size);
  return value >= 1 << (size - 1) ? value : value - ((1 << size) - 1);
};

/**
 * Dequantises nothing, inverse-transforms everything: one 8×8 block, in place.
 *
 * @param {Float64Array} io - 64 coefficients in block order, replaced by pixels.
 * @param {Float64Array} scratch - 64 reusable slots for the row pass.
 * @returns {void}
 */
const inverseDct = (io, scratch) => {
  for (let row = 0; row < 8; row++) {
    for (let x = 0; x < 8; x++) {
      let sum = 0;
      for (let k = 0; k < 8; k++) sum += io[row * 8 + k] * COS[x][k];
      scratch[row * 8 + x] = sum;
    }
  }
  for (let col = 0; col < 8; col++) {
    for (let y = 0; y < 8; y++) {
      let sum = 0;
      for (let k = 0; k < 8; k++) sum += scratch[k * 8 + col] * COS[y][k];
      io[y * 8 + col] = sum + 128;
    }
  }
};

/**
 * Cuts a scan into restart intervals, removing byte stuffing on the way.
 *
 * The bit reader never has to look ahead for 0xFF00, and each interval becomes
 * an independent segment whose DC predictors start over — which is what makes a
 * truncated file stop at its interval instead of garbling the rest.
 *
 * @param {Buffer} buf - Bytes from the first entropy byte to the marker that ends the scan.
 * @returns {Buffer[]} One entry per interval, including the trailing one.
 */
const splitScan = (buf) => {
  const segments = [];
  let current = [];
  let i = 0;
  while (i < buf.length) {
    const byte = buf[i];
    if (byte !== 0xff) {
      current.push(byte);
      i++;
      continue;
    }
    const next = buf[i + 1];
    if (next === 0x00) {
      current.push(0xff);
      i += 2;
      continue;
    }
    if (next === 0xff) {
      // Fill byte: the encoder may pad before any marker, and `0xFFFF…` is how
      // some tools stretch a segment boundary. Dropping one byte keeps the pair
      // readable on the next pass instead of ending the scan early.
      i++;
      continue;
    }
    if (next >= 0xd0 && next <= 0xd7) {
      segments.push(Buffer.from(current));
      current = [];
      i += 2;
      continue;
    }
    break; // a real marker ends the scan
  }
  segments.push(Buffer.from(current));
  return segments;
};

/**
 * Decodes a JPEG file into RGBA pixels.
 *
 * @param {Buffer} buf - File bytes.
 * @returns {{ width: number, height: number, rgba: Buffer }}
 * @throws {UnsupportedImage} For a JPEG mode this decoder will never read.
 * @throws {Error} For a file whose bytes do not add up.
 */
export const decodeJpeg = (buf) => {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) {
    throw new Error("not a JPEG: missing SOI marker");
  }

  const quant = [];
  const dc = [];
  const ac = [];
  let frame = null;
  let restartInterval = 0;
  const scans = [];

  let offset = 2;
  while (offset + 1 < buf.length) {
    if (buf[offset] !== 0xff) {
      offset++;
      continue;
    }
    let marker = buf[offset + 1];
    while (marker === 0xff) {
      offset++;
      marker = buf[offset + 1];
    }
    offset += 2;

    // Standalone markers carry no length: stuffed bytes, fill, TEM, and RSTn.
    if (marker === 0x00 || marker === 0x01 || marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    if (marker === 0xd9) break;

    const length = buf.readUInt16BE(offset);
    const payload = buf.subarray(offset + 2, offset + 2 + length - 2);
    offset += length;

    if (marker === 0xdb) readDqt(payload, quant);
    else if (marker === 0xc4) readDht(payload, dc, ac);
    else if (marker === 0xdd) restartInterval = payload.readUInt16BE(0);
    else if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8) {
      frame = readFrame(marker, payload);
    } else if (marker === 0xda) {
      // Jump the entropy data: a multi-scan file continues here, and reading
      // forward through stuffed bytes as if they were markers is how a second
      // scan starts decoding the first one's leftovers.
      const start = offset;
      const end = findScanEnd(buf, start);
      // Snapshot what is in force at this SOS. A later marker may redefine the
      // same table or interval slot, and if the scans are decoded once the whole
      // header has been walked, that later definition silently rewrites the
      // earlier scan's pixels.
      scans.push({ payload, start, end, restartInterval, tables: { quant: quant.slice(), dc: dc.slice(), ac: ac.slice() } });
      offset = end;
    }
  }

  if (!frame) throw new Error("JPEG has no start-of-frame marker");
  if (!scans.length) throw new Error("JPEG has no scan");

  const { width, height, components } = frame;
  const maxH = Math.max(...components.map((c) => c.h));
  const maxV = Math.max(...components.map((c) => c.v));
  const mcusPerRow = Math.ceil(width / (8 * maxH));
  const mcusPerColumn = Math.ceil(height / (8 * maxV));

  for (const component of components) {
    component.planeWidth = mcusPerRow * component.h * 8;
    component.planeHeight = mcusPerColumn * component.v * 8;
    component.plane = new Float64Array(component.planeWidth * component.planeHeight);
  }

  const block = new Float64Array(64);
  const scratch = new Float64Array(64);
  for (const scan of scans) {
    decodeScan(scan, { buf, components, width, height, maxH, maxV, block, scratch });
  }

  const rgba = Buffer.alloc(width * height * 4);
  // The frame declares components in its own order; the identifiers say which is
  // which, and a file whose list is Y-Cr-Cb would otherwise come out inverted.
  const byId = (id) => components.find((c) => c.id === id);
  const luma = components.length === 1 ? components[0] : byId(1) ?? components[0];
  const chromaB = byId(2) ?? components[1];
  const chromaR = byId(3) ?? components[2];

  if (components.length === 1) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const grey = clamp255(sample(luma, x, y, maxH, maxV));
        const dst = (y * width + x) * 4;
        rgba[dst] = grey;
        rgba[dst + 1] = grey;
        rgba[dst + 2] = grey;
        rgba[dst + 3] = 255;
      }
    }
  } else {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const yy = sample(luma, x, y, maxH, maxV);
        const cb = sample(chromaB, x, y, maxH, maxV) - 128;
        const cr = sample(chromaR, x, y, maxH, maxV) - 128;
        const dst = (y * width + x) * 4;
        rgba[dst] = clamp255(yy + 1.402 * cr);
        rgba[dst + 1] = clamp255(yy - 0.344136 * cb - 0.714136 * cr);
        rgba[dst + 2] = clamp255(yy + 1.772 * cb);
        rgba[dst + 3] = 255;
      }
    }
  }

  return { width, height, rgba };
};

/**
 * Decodes every MCU of one scan into its components' planes.
 *
 * Blocks are read in *scan* order, which is the order of the SOS component
 * specifiers — not the order the frame listed them in. They are usually the same
 * list, and when they are not, reading them by frame order hands each block the
 * wrong Huffman tables and the rest of the scan decodes as noise.
 *
 * @param {{ payload: Buffer, start: number, end: number, restartInterval: number,
 *   tables: { quant: Object[], dc: Map[], ac: Map[] } }} scan
 * @param {Object} ctx - Frame geometry, tables and reusable buffers.
 * @returns {void}
 */
const decodeScan = (scan, ctx) => {
  const { buf, components, width, height, maxH, maxV, block, scratch } = ctx;
  const { restartInterval, tables: { quant, dc, ac } } = scan;
  const specs = readScanHeader(scan.payload, components.length);
  if (specs.length !== components.length && specs.length !== 1) {
    throw new Error(`JPEG scan covers ${specs.length} of ${components.length} components, which is neither interleaved nor single-component`);
  }
  const interleaved = specs.length === components.length;

  const list = specs.map((spec) => {
    const component = components.find((c) => c.id === spec.id);
    if (!component) throw new Error(`JPEG scan names component ${spec.id}, which the frame never declared`);
    component.dcTable = dc[spec.tables >> 4];
    component.acTable = ac[spec.tables & 15];
    if (!component.dcTable || !component.acTable) {
      throw new Error("JPEG scan names a Huffman table that was never defined");
    }
    return component;
  });

  // In a single-component scan the MCU is one block and the scan walks that
  // component's own block grid in raster order; the h×v block group only exists
  // in the interleaved form. Reading a non-interleaved luma scan as 2×2 groups
  // instead keeps the right number of blocks and still puts half of each MCU row
  // one block-row early, which scrambles the picture without tripping any check.
  const rowMcus = interleaved
    ? Math.ceil(width / (8 * maxH))
    : Math.ceil(Math.ceil((width * list[0].h) / maxH) / 8);
  const colMcus = interleaved
    ? Math.ceil(height / (8 * maxV))
    : Math.ceil(Math.ceil((height * list[0].v) / maxV) / 8);
  const totalMcus = rowMcus * colMcus;

  const segments = splitScan(buf.subarray(scan.start, scan.end));
  const intervals = restartInterval > 0 ? Math.ceil(totalMcus / restartInterval) : 1;
  if (segments.length < intervals) {
    throw new Error("JPEG scan data ended before the frame was complete");
  }

  const predictors = new Int32Array(list.length);
  let stream = new BitStream(segments[0]);
  let segment = 0;
  let mcusLeft = restartInterval > 0 ? Math.min(restartInterval, totalMcus) : totalMcus;

  for (let mcu = 0; mcu < totalMcus; mcu++) {
    if (mcusLeft === 0) {
      segment++;
      stream = new BitStream(segments[segment]);
      mcusLeft = Math.min(restartInterval, totalMcus - mcu);
      predictors.fill(0);
    }
    mcusLeft--;

    const mcuX = mcu % rowMcus;
    const mcuY = Math.floor(mcu / rowMcus);

    for (let ci = 0; ci < list.length; ci++) {
      const component = list[ci];
      const table = quant[component.quantId];
      if (!table) throw new Error(`JPEG names quantisation table ${component.quantId}, which was never defined`);

      // Interleaved: this MCU carries the component's whole h×v block group.
      // Non-interleaved: one block, and the max factors only decide how the
      // plane maps back onto luma pixels, in `sample()`.
      const wide = interleaved ? component.h : 1;
      const tall = interleaved ? component.v : 1;
      for (let by = 0; by < tall; by++) {
        for (let bx = 0; bx < wide; bx++) {
          decodeBlock(component, ci, stream, predictors, block);
          for (let k = 0; k < 64; k++) block[k] *= table[k];
          inverseDct(block, scratch);
          const originX = (mcuX * wide + bx) * 8;
          const originY = (mcuY * tall + by) * 8;
          for (let y = 0; y < 8; y++) {
            const rowStart = (originY + y) * component.planeWidth + originX;
            for (let x = 0; x < 8; x++) component.plane[rowStart + x] = block[y * 8 + x];
          }
        }
      }
    }
  }
};

/**
 * One MCU block: DC prediction then the AC run-length symbols.
 *
 * @param {Object} component - Supplies this scan's Huffman tables.
 * @param {number} ci - Slot in the scan's predictor array.
 * @param {BitStream} stream
 * @param {Int32Array} predictors
 * @param {Float64Array} block - Cleared, then filled with dequant-ready coefficients.
 * @returns {void}
 */
const decodeBlock = (component, ci, stream, predictors, block) => {
  block.fill(0);
  predictors[ci] += extend(stream, stream.decode(component.dcTable));
  block[0] = predictors[ci];

  let k = 1;
  while (k < 64) {
    const rs = stream.decode(component.acTable);
    const run = rs >> 4;
    const size = rs & 15;
    if (size === 0) {
      if (run === 0) break; // EOB — the rest of the block is zero
      // 0xF0 is ZRL: sixteen zeros, so the next coefficient is sixteen along.
      // Advancing by the run nibble alone (fifteen) leaves every following block
      // one symbol short, and a block coded to its last coefficient then reads
      // its neighbour's first symbol — which desynchronises the whole rest of
      // the scan. That is how an ordinary photo turned into "AC coefficient ran
      // past the block" while small test images decoded fine.
      if (run !== 15) throw new Error(`JPEG AC symbol 0x${rs.toString(16)} is reserved`);
      k += 16;
      continue;
    }
    k += run;
    if (k >= 64) throw new Error("JPEG AC coefficient ran past the block");
    block[ZIGZAG[k]] = extend(stream, size);
    k++;
  }
};

/**
 * Reads an SOFn header.
 *
 * @param {number} marker - The SOF marker byte.
 * @param {Buffer} payload
 * @returns {{ width: number, height: number, components: Object[] }}
 * @throws {UnsupportedImage} For the frame modes this decoder does not implement.
 */
const readFrame = (marker, payload) => {
  const kind = {
    0xc0: "baseline",
    0xc1: "extended sequential",
    0xc2: "progressive",
    0xc3: "lossless",
  }[marker];
  if (marker === 0xc2) throw new UnsupportedImage("JPEG", "progressive (multi-scan) entropy coding is not implemented");
  if (marker === 0xc3) throw new UnsupportedImage("JPEG", "lossless (predictive) JPEG is not implemented");
  if (marker >= 0xc6 && marker <= 0xcf) throw new UnsupportedImage("JPEG", "arithmetic coding is not implemented");
  if (!kind) throw new UnsupportedImage("JPEG", `frame marker 0x${marker.toString(16)} is not implemented`);
  if (payload[0] !== 8) throw new UnsupportedImage("JPEG", `${payload[0]}-bit samples are not implemented (only 8-bit)`);

  const height = payload.readUInt16BE(1);
  const width = payload.readUInt16BE(3);
  const count = payload[5];
  if (count === 4) throw new UnsupportedImage("JPEG", "CMYK (four components) is not implemented");
  if (count !== 1 && count !== 3) {
    throw new UnsupportedImage("JPEG", `${count} components is not implemented (only greyscale and YCbCr)`);
  }

  const components = [];
  for (let i = 0; i < count; i++) {
    const base = 6 + i * 3;
    components.push({
      id: payload[base],
      h: payload[base + 1] >> 4,
      v: payload[base + 1] & 15,
      quantId: payload[base + 2],
      dcTable: null,
      acTable: null,
    });
  }
  return { width, height, components };
};

/**
 * Reads a DQT segment, which may hold several tables.
 *
 * @param {Buffer} payload
 * @param {Float64Array[]} quant - Filled by table id.
 * @returns {void}
 */
const readDqt = (payload, quant) => {
  let p = 0;
  while (p + 65 <= payload.length) {
    const precision = payload[p] >> 4;
    const id = payload[p] & 15;
    p++;
    if (precision !== 0) throw new UnsupportedImage("JPEG", "16-bit quantisation tables belong to 12-bit JPEG, which is not implemented");
    // The table arrives in scan order; coefficients are stored in block
    // order, so it is de-zigzagged once here rather than per block.
    const table = new Float64Array(64);
    for (let k = 0; k < 64; k++) table[ZIGZAG[k]] = payload[p + k];
    p += 64;
    quant[id] = table;
  }
};

/**
 * Reads a DHT segment.
 *
 * The spec puts one table per marker, but plenty of camera software writes all
 * four in a single segment, and libjpeg walks the payload rather than trusting
 * that. Reading only the first table leaves a scan pointing at Huffman tables
 * that were never defined — for a file that opens fine in every viewer.
 *
 * @param {Buffer} payload
 * @param {Map<number, number>[]} dc
 * @param {Map<number, number>[]} ac
 * @returns {void}
 */
const readDht = (payload, dc, ac) => {
  let p = 0;
  while (p + 17 <= payload.length) {
    const classId = payload[p];
    const counts = payload.subarray(p + 1, p + 17);
    const total = counts.reduce((a, b) => a + b, 0);
    if (p + 17 + total > payload.length) {
      throw new Error("JPEG Huffman table claims more codes than its segment holds");
    }
    const table = buildHuffman(counts, payload.subarray(p + 17, p + 17 + total));
    if (classId >> 4 === 0) dc[classId & 15] = table;
    else ac[classId & 15] = table;
    p += 17 + total;
  }
};

/**
 * Reads an SOS header and rejects anything that is not a full-band, first-pass
 * scan.
 *
 * @param {Buffer} payload
 * @param {number} componentCount
 * @returns {{ id: number, tables: number }[]} Component specifiers, in scan order.
 * @throws {UnsupportedImage} For a progressive or refined scan.
 */
const readScanHeader = (payload, componentCount) => {
  const count = payload[0];
  if (payload.length < 4 + count * 2) throw new Error("JPEG scan header is truncated");
  const specs = [];
  for (let i = 0; i < count; i++) {
    specs.push({ id: payload[1 + i * 2], tables: payload[2 + i * 2] });
  }
  const spectralStart = payload[1 + count * 2];
  const spectralEnd = payload[2 + count * 2];
  const approximation = payload[3 + count * 2];
  if (spectralStart !== 0 || spectralEnd !== 63 || approximation !== 0) {
    throw new UnsupportedImage("JPEG", "progressive (multi-scan) entropy coding is not implemented");
  }
  return specs;
};

/**
 * Sample of a possibly subsampled component plane at a luma pixel.
 *
 * The chroma sample belonging to a luma pixel sits at the centre of the block it
 * covers, hence the half-pixel offset before scaling. Where the scale is above
 * 1:1 the two neighbouring samples are blended instead of one being chosen: a
 * hard colour edge otherwise comes out with stair-stepped fringes, which is what
 * every viewer's upsampler exists to avoid. At 1:1 the weights are exactly 0 and
 * the luma plane passes through untouched.
 *
 * @param {Object} component
 * @param {number} x
 * @param {number} y
 * @param {number} maxH
 * @param {number} maxV
 * @returns {number}
 */
const sample = (component, x, y, maxH, maxV) => {
  const plane = component.plane;
  const pw = component.planeWidth;
  const u = Math.min(Math.max((x + 0.5) * component.h / maxH - 0.5, 0), pw - 1);
  const v = Math.min(Math.max((y + 0.5) * component.v / maxV - 0.5, 0), component.planeHeight - 1);
  const x0 = Math.floor(u), y0 = Math.floor(v);
  const x1 = Math.min(x0 + 1, pw - 1), y1 = Math.min(y0 + 1, component.planeHeight - 1);
  const fx = u - x0, fy = v - y0;
  const top = plane[y0 * pw + x0] * (1 - fx) + plane[y0 * pw + x1] * fx;
  const bottom = plane[y1 * pw + x0] * (1 - fx) + plane[y1 * pw + x1] * fx;
  return top * (1 - fy) + bottom * fy;
};

/** @param {number} value @returns {number} Rounded into 0-255. */
const clamp255 = (value) => {
  const rounded = Math.round(value);
  return rounded < 0 ? 0 : rounded > 255 ? 255 : rounded;
};

/**
 * @param {Buffer} buf
 * @param {number} start - First entropy byte of the scan.
 * @returns {number} Offset of the first marker that ends the scan.
 */
const findScanEnd = (buf, start) => {
  let i = start;
  while (i + 1 < buf.length) {
    if (buf[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = buf[i + 1];
    if (marker === 0x00 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    if (marker === 0xff) {
      i++;
      continue;
    }
    return i;
  }
  return buf.length;
};

export default decodeJpeg;
