/**
 * @file bin/utils/images/gif.js
 * @description GIF reader: LZW, global or local palettes, transparency, interlace.
 *
 * A GIF is a canvas with one or more frames on it, and a PNG is one still
 * image, so the conversion has to pick a frame. This takes the first one and
 * places it at its own offset inside the logical screen, which is where a
 * browser would show it. An animated file is converted with a note saying only
 * the first frame survived — silently dropping the rest of a cartoon would be
 * the worse half of that trade.
 */

/**
 * Decodes a GIF into RGBA.
 *
 * @param {Buffer} buf - File bytes.
 * @returns {{ width: number, height: number, rgba: Buffer, note?: string }}
 * @throws {Error} Naming the corruption or the feature this reader lacks.
 */
export const decodeGif = (buf) => {
  const magic = buf.toString("ascii", 0, 6);
  if (magic !== "GIF87a" && magic !== "GIF89a") throw new Error("not a GIF: bad signature");

  const canvasWidth = buf.readUInt16LE(6);
  const canvasHeight = buf.readUInt16LE(8);
  const packed = buf[10];
  let offset = 13;

  let globalTable = null;
  if (packed & 0x80) {
    globalTable = readColorTable(buf, offset, 2 << (packed & 7));
    offset += 3 * (2 << (packed & 7));
  }

  let transparentIndex = -1;
  let frames = 0;
  let width = canvasWidth;
  let height = canvasHeight;
  let rgba = null;

  while (offset < buf.length) {
    const introducer = buf[offset];
    offset++;

    if (introducer === 0x3b) break; // trailer

    if (introducer === 0x21) {
      const label = buf[offset];
      const blocks = readBlocks(buf, offset + 1);
      if (label === 0xf9 && blocks.data.length >= 4 && blocks.data[0] & 0x01) {
        transparentIndex = blocks.data[3];
      }
      offset = blocks.next;
      continue;
    }

    if (introducer !== 0x2c) throw new Error(`unexpected GIF block 0x${introducer.toString(16)}`);

    const x = buf.readUInt16LE(offset);
    const y = buf.readUInt16LE(offset + 2);
    const frameWidth = buf.readUInt16LE(offset + 4);
    const frameHeight = buf.readUInt16LE(offset + 6);
    const framePacked = buf.readUInt16LE(offset + 8) & 0xff;
    offset += 9;

    let table = globalTable;
    if (framePacked & 0x80) {
      const entries = 2 << (framePacked & 7);
      table = readColorTable(buf, offset, entries);
      offset += 3 * entries;
    }
    if (!table) throw new Error("GIF frame has no colour table");

    frames++;
    if (frames === 1) {
      width = canvasWidth;
      height = canvasHeight;
      rgba = Buffer.alloc(canvasWidth * canvasHeight * 4);
      const interlaced = (framePacked & 0x40) !== 0;
      const pixels = decodeLzw(buf, offset, frameWidth * frameHeight);
      const rows = interlaced ? deinterlace(frameHeight) : Array.from({ length: frameHeight }, (_, i) => i);

      for (let row = 0; row < frameHeight; row++) {
        const targetY = y + rows[row];
        if (targetY < 0 || targetY >= canvasHeight) continue;
        for (let col = 0; col < frameWidth; col++) {
          const targetX = x + col;
          if (targetX < 0 || targetX >= canvasWidth) continue;
          const index = pixels[row * frameWidth + col];
          const colour = table[index] || [0, 0, 0, 255];
          const dst = (targetY * canvasWidth + targetX) * 4;
          rgba[dst] = colour[0];
          rgba[dst + 1] = colour[1];
          rgba[dst + 2] = colour[2];
          rgba[dst + 3] = index === transparentIndex ? 0 : colour[3];
        }
      }
    }
    offset = skipImage(buf, offset);
  }

  if (!rgba) throw new Error("GIF has no image block");

  return {
    width,
    height,
    rgba,
    note: frames > 1 ? `${frames} frames: only the first was kept` : undefined,
  };
};

/**
 * @param {Buffer} buf
 * @param {number} start - Offset of the first table entry.
 * @param {number} entries
 * @returns {number[][]} `[r, g, b, a]` per entry; GIF stores no alpha.
 */
const readColorTable = (buf, start, entries) => {
  const table = [];
  for (let i = 0; i < entries; i++) {
    const base = start + i * 3;
    table.push([buf[base], buf[base + 1], buf[base + 2], 255]);
  }
  return table;
};

/**
 * Walks a GIF sub-block chain.
 *
 * @param {Buffer} buf
 * @param {number} start - Offset of the first size byte.
 * @returns {{ data: Buffer, next: number }}
 */
const readBlocks = (buf, start) => {
  const parts = [];
  let offset = start;
  while (offset < buf.length) {
    const size = buf[offset];
    offset++;
    if (size === 0) break;
    parts.push(buf.subarray(offset, offset + size));
    offset += size;
  }
  return { data: Buffer.concat(parts), next: offset };
};

/**
 * Reads an image's LZW sub-blocks and decodes them into palette indices.
 *
 * @param {Buffer} buf
 * @param {number} offset - Where the LZW minimum code size byte sits.
 * @param {number} count - Pixels in this frame.
 * @returns {Uint8Array}
 */
const decodeLzw = (buf, offset, count) => {
  const { data } = readBlocks(buf, offset + 1);
  const minCodeSize = buf[offset];
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;

  const pixels = new Uint8Array(count);
  let dict = [];
  let codeSize = minCodeSize + 1;
  let next = endCode + 1;
  let bitPos = 0;
  let written = 0;
  let previous = null;

  const resetDict = () => {
    dict = [];
    for (let i = 0; i < clearCode; i++) dict[i] = [i];
    dict[clearCode] = [];
    dict[endCode] = [];
    codeSize = minCodeSize + 1;
    next = endCode + 1;
    previous = null;
  };

  const readCode = () => {
    let code = 0;
    for (let i = 0; i < codeSize; i++) {
      const byteIndex = (bitPos + i) >> 3;
      if (byteIndex >= data.length) return -1;
      code |= ((data[byteIndex] >> ((bitPos + i) & 7)) & 1) << i;
    }
    bitPos += codeSize;
    return code;
  };

  resetDict();
  while (written < count) {
    const code = readCode();
    if (code === -1 || code === endCode) break;
    if (code === clearCode) {
      resetDict();
      continue;
    }

    let entry = dict[code];
    if (!entry) {
      // The classic KwKwK case: the code being asked for is the one this
      // iteration is about to define, so the new entry is `previous` plus its
      // own first index.
      if (!previous) throw new Error("GIF LZW stream references an undefined code");
      entry = [...previous, previous[0]];
      dict[next++] = entry;
    } else if (previous) {
      dict[next++] = [...previous, entry[0]];
    }
    previous = entry;

    for (const value of entry) {
      if (written < count) pixels[written++] = value;
    }
    if (next === (1 << codeSize) && codeSize < 12) codeSize++;
  }

  return pixels;
};

/**
 * Row order of an interlaced GIF: 4/8, then 2/8, then 1/4, then 1/2 passes.
 *
 * @param {number} height
 * @returns {number[]} Destination row for each stored row, in order.
 */
const deinterlace = (height) => {
  const rows = [];
  for (let pass = 0; pass < 4; pass++) {
    const start = [0, 4, 2, 1][pass];
    const step = [8, 8, 4, 2][pass];
    for (let y = start; y < height; y += step) rows.push(y);
  }
  return rows;
};

/**
 * @param {Buffer} buf
 * @param {number} offset - Where the LZW minimum code size byte sits.
 * @returns {number} Offset after this image's sub-blocks.
 */
const skipImage = (buf, offset) => readBlocks(buf, offset + 1).next;

export default decodeGif;
