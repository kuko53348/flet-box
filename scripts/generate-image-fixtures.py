#!/usr/bin/env python3
"""Generate `tests/fixtures/images.json` for scripts/check-image-convert.mjs.

Dev-time only, and the one thing it needs is Pillow: the published package has
no image dependency, which is exactly why the CLI carries its own decoders. The
fixtures are the point — an independent decoder's pixels are the ground truth
those decoders are measured against.

    python3 scripts/generate-image-fixtures.py

Each entry is { name, kind, width, height, source (base64 file bytes), rgba
(base64 expected pixels) }.  `kind` is "decode" (the pixels must match), "decline"
(the reader must refuse with `reason` in the message, as `UnsupportedImage`, which
the command counts as a declined asset) or "refuse" (the same message check, but a
broken file: a plain Error, which the command counts as a failure).
"""

import base64
import io
import json
import math
import os
import struct
import zlib

from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), "..", "tests", "fixtures", "images.json")
SIZE = 32


def tiles(color_fn):
    """32x32 of 4x4 solid squares: chroma upsampling cannot smear a tile."""
    img = Image.new("RGB", (SIZE, SIZE))
    px = img.load()
    for y in range(SIZE):
        for x in range(SIZE):
            px[x, y] = color_fn(x // 4, y // 4)
    return img


def gradient():
    img = Image.new("RGB", (SIZE, SIZE))
    px = img.load()
    for y in range(SIZE):
        for x in range(SIZE):
            px[x, y] = (x * 8 % 256, y * 8 % 256, (x + y) * 4 % 256)
    return img


def rgba_of(img, transparent_index=None):
    """Expected RGBA bytes, resolving a P-mode palette and its transparent index."""
    if img.mode == "P":
        palette = img.getpalette()
        indices = list(img.getdata())
        out = bytearray()
        for index in indices:
            out += bytes([palette[index * 3], palette[index * 3 + 1], palette[index * 3 + 2],
                          0 if index == transparent_index else 255])
        return bytes(out)
    if img.mode == "L":
        return b"".join(bytes([v, v, v, 255]) for v in img.getdata())
    if img.mode == "I;16":
        return b"".join(bytes([(v >> 8) & 0xFF, (v >> 8) & 0xFF, (v >> 8) & 0xFF, 255]) for v in img.getdata())
    return img.convert("RGBA").tobytes()


def reference(source):
    """Pillow's own pixels for these bytes.

    A JPEG has already lost information to the encoder, so the only question a
    decoder can answer is "do you show what a viewer shows?". Comparing against
    the pre-compression image instead would charge this reader for the lossy
    encode it never did. Lossless formats keep `rgba_of`, which is the stricter
    promise.
    """
    return Image.open(io.BytesIO(source)).convert("RGBA").tobytes()


def save(img, fmt, **kwargs):
    buf = io.BytesIO()
    img.save(buf, format=fmt, **kwargs)
    return buf.getvalue()


# ---------------------------------------------------------------- a JPEG writer
#
# Camera files pack every Huffman table into a single DHT segment; an older
# encoder gives each component its own scan; a ZRL symbol only appears once a
# coefficient sits at the far end of the zigzag; and 0xFF fill bytes before a
# restart marker are not something any encoder produces on purpose. Pillow will
# not write any of that, so these bytes are assembled straight from the spec —
# and then Pillow is asked what they look like. Its pixels stay the referee:
# the reference is another implementation's decode of the file, not a restatement
# of the code that wrote it.

ZIGZAG = [0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5,
          12, 19, 26, 33, 40, 48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28,
          35, 42, 49, 56, 57, 50, 43, 36, 29, 22, 15, 23, 30, 37, 44, 51,
          58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54, 47, 55, 62, 63]


def huffman_table(weights):
    """Canonical Huffman code over {symbol: count} -> (counts, values, codes).

    A real tree rather than Annex K's tables, because the fixture only needs a
    prefix code over the symbols it actually emits. One leaf gets a 2-bit code.

    A Huffman tree is full by construction: its codes use the whole space, Kraft
    sum exactly 1. That is legal, and libjpeg-turbo answers it with "Bogus Huffman
    table definition" — every table it has ever written, including the Annex K
    ones, leaves the last codeword unused, so a full table is something it never
    has to read. The longest symbol is therefore moved up one bit, which vacates
    a slot in its old length class and keeps the sibling of its new code free.
    """
    import heapq

    if len(weights) == 1:
        counts = [0] * 16
        counts[1] = 1  # one code of length 2: three of the four slots go unused
        return counts, list(weights), {next(iter(weights)): (0, 2)}

    heap = [(count, index, ("leaf", symbol))
            for index, (symbol, count) in enumerate(sorted(weights.items()))]
    heapq.heapify(heap)
    serial = len(heap)
    while len(heap) > 1:
        left = heapq.heappop(heap)
        right = heapq.heappop(heap)
        heapq.heappush(heap, (left[0] + right[0], serial, ("node", left[2], right[2])))
        serial += 1

    depth = {}

    def walk(node, level):
        if node[0] == "leaf":
            depth[node[1]] = level
            return
        walk(node[1], level + 1)
        walk(node[2], level + 1)

    # The root's children are one bit from the root, so depth starts at 0 here.
    walk(heap[0][2], 0)
    assert max(depth.values()) <= 15, depth  # room for the code to move up into

    longest = max(depth, key=lambda s: (depth[s], s))
    depth[longest] += 1

    counts = [0] * 16
    codes = {}
    code = 0
    previous = 0
    for symbol in sorted(depth, key=lambda s: (depth[s], s)):
        length = depth[symbol]
        code <<= length - previous
        previous = length
        codes[symbol] = (code, length)
        counts[length - 1] += 1
        code += 1
    values = [s for s, _ in sorted(codes.items(), key=lambda kv: (kv[1][1], kv[0]))]
    return counts, values, codes


class BitWriter:
    """Entropy data, with 0xFF stuffing and end-of-scan padding."""

    def __init__(self):
        self.data = bytearray()
        self.bits = 0
        self.count = 0

    def emit(self, code, length):
        for index in range(length - 1, -1, -1):
            self.bits = (self.bits << 1) | ((code >> index) & 1)
            self.count += 1
            if self.count == 8:
                self.data.append(self.bits & 0xFF)
                if self.bits & 0xFF == 0xFF:
                    self.data.append(0x00)
                self.bits, self.count = 0, 0

    def finish(self):
        while self.count:
            self.emit(1, 1)
        out, self.data = bytes(self.data), bytearray()
        return out


def amplitude(value):
    """(size, bits) for a DC difference or AC coefficient, JPEG offset binary."""
    if value == 0:
        return 0, 0
    size = abs(value).bit_length()
    return size, value if value > 0 else value + (1 << size) - 1


def block_plan(block, predictor):
    """What one block emits: DC size and bits, then (AC symbol, bits, size) triples.

    Read once to collect table weights and once again to write the bits, so the
    two passes cannot disagree about what a block contains.
    """
    dc_size, dc_bits = amplitude(block[0] - predictor)
    ac = []
    run = 0
    last = max((i for i in range(1, 64) if block[i]), default=0)
    for index in range(1, last + 1):
        if block[index] == 0:
            run += 1
            continue
        while run >= 16:  # ZRL: sixteen zeros, then the coefficient
            ac.append((0xF0, 0, 0))
            run -= 16
        size, bits = amplitude(block[index])
        ac.append(((run << 4) | size, bits, size))
        run = 0
    if last < 63:
        ac.append((0x00, 0, 0))  # EOB
    return dc_size, dc_bits, ac


def marker(kind, payload):
    return bytes([0xFF, kind]) + (len(payload) + 2).to_bytes(2, "big") + payload


def baseline_jpeg(width, height, components, scans, *, packed_tables=True, restart=0, fills=0):
    """Write a baseline JPEG from coefficients, in the scan layout asked for.

    `components` is [{"id", "h", "v", "q", "blocks"}], blocks in plane raster
    order and each one a 64-long list of quantised coefficients in zigzag order.
    `scans` is one entry per SOS: {"per": [(component id, dc table, ac table)]}.
    Every scan (re)defines the table ids it uses, so a file with two scans on the
    same ids carries two different versions of them, and the decoder has to use
    the version that was in force at each SOS.
    """
    by_id = {c["id"]: c for c in components}
    max_h = max(c["h"] for c in components)
    max_v = max(c["v"] for c in components)
    plane = {c["id"]: (math.ceil(math.ceil(width * c["h"] / max_h) / 8),
                       math.ceil(math.ceil(height * c["v"] / max_v) / 8)) for c in components}
    quant = {0: [1 + (i * 5) % 8 for i in range(64)], 1: [1 + (i * 3) % 6 for i in range(64)]}

    out = bytearray(b"\xff\xd8")
    out += marker(0xE0, b"JFIF\x00\x01\x02\x00\x00\x01\x00\x01\x00\x00")
    out += marker(0xDB, b"".join(bytes([qid]) + bytes(quant[qid][ZIGZAG[i]] for i in range(64))
                                 for qid in sorted({c["q"] for c in components})))
    out += marker(0xC0, bytes([8, height >> 8, height & 0xFF, width >> 8, width & 0xFF, len(components)])
                  + b"".join(bytes([c["id"], (c["h"] << 4) | c["v"], c["q"]]) for c in components))

    for scan in scans:
        chosen = [by_id[cid] for cid, _, _ in scan["per"]]
        ids = {cid: (dc, ac) for cid, dc, ac in scan["per"]}
        interleaved = len(chosen) == len(components)
        if interleaved:
            per_row, per_col = math.ceil(width / (8 * max_h)), math.ceil(height / (8 * max_v))
        else:
            per_row, per_col = plane[chosen[0]["id"]]

        # Plan every block once, in stream order, counting the symbols its tables
        # have to cover; the bits written below come from the same plans.
        plans, weights = [], {}
        for comp in chosen:
            blocks_per_mcu = comp["h"] * comp["v"] if interleaved else 1
            interval = blocks_per_mcu * restart if restart else 0
            planned, predictor = [], 0
            for index, block in enumerate(comp["blocks"]):
                if interval and index % interval == 0:
                    predictor = 0  # a restart interval restarts the DC prediction
                plan = block_plan(block, predictor)
                predictor = block[0]
                planned.append(plan)
                dc_bucket = weights.setdefault(("dc", ids[comp["id"]][0]), {})
                dc_bucket[plan[0]] = dc_bucket.get(plan[0], 0) + 1
                ac_bucket = weights.setdefault(("ac", ids[comp["id"]][1]), {})
                for symbol, _, _ in plan[2]:
                    ac_bucket[symbol] = ac_bucket.get(symbol, 0) + 1
            plans.append(planned)

        built = {key: huffman_table(bucket) for key, bucket in weights.items()}

        payloads = [bytes([(0 if kind == "dc" else 1) << 4 | tid]) + bytes(counts) + bytes(values)
                    for (kind, tid), (counts, values, _) in sorted(built.items())]
        # Packed: one DHT segment holding all of them, which is what a camera
        # writes. Split: one segment each, which is what Pillow writes.
        for payload in ([b"".join(payloads)] if packed_tables else payloads):
            out += marker(0xC4, payload)
        if restart:
            out += marker(0xDD, restart.to_bytes(2, "big"))
        out += marker(0xDA, bytes([len(chosen)])
                      + b"".join(bytes([cid, (dc << 4) | ac]) for cid, dc, ac in scan["per"])
                      + bytes([0, 63, 0]))

        bits = BitWriter()
        stream = [iter(group) for group in plans]
        total = per_row * per_col
        for mcu in range(total):
            for index, comp in enumerate(chosen):
                dc_id, ac_id = ids[comp["id"]]
                for _ in range(comp["h"] * comp["v"] if interleaved else 1):
                    dc_size, dc_bits, ac = next(stream[index])
                    bits.emit(*built[("dc", dc_id)][2][dc_size])
                    if dc_size:
                        bits.emit(dc_bits, dc_size)
                    for symbol, value, size in ac:
                        bits.emit(*built[("ac", ac_id)][2][symbol])
                        if size:
                            bits.emit(value, size)
            if restart and (mcu + 1) % restart == 0 and mcu + 1 < total:
                out += bits.finish()
                out += b"\xff" * fills  # fill bytes may precede a marker
                # The interval counter starts at zero, so the first restart marker
                # is RST0. Written from one, libjpeg calls it corruption, loses the
                # interval boundary and decodes the rest of the scan out of order.
                out += bytes([0xFF, 0xD0 + (((mcu + 1) // restart) - 1) % 8])
        out += bits.finish()

    out += b"\xff\xd9"
    return bytes(out)


FIXTURES = []


def add(name, source, expected=None, reason=None, size=(SIZE, SIZE), kind=None):
    entry = {
        "name": name,
        "kind": kind or ("decode" if expected is not None else "decline"),
        "width": size[0],
        "height": size[1],
        "source": base64.b64encode(source).decode(),
    }
    if expected is not None:
        entry["rgba"] = base64.b64encode(expected).decode()
    if reason is not None:
        entry["reason"] = reason
    FIXTURES.append(entry)


flat = tiles(lambda x, y: ((x * 47 + 13) % 256, (y * 53 + 7) % 256, ((x + y) * 61 + 3) % 256))
grey = tiles(lambda x, y: ((x * 7 + y * 11) % 256,) * 3).convert("L")

# ---- JPEG: one file per sampling factor, quality 100 so the only difference
# left to tolerate is IDCT rounding and chroma upsampling. Each is measured
# against libjpeg's own pixels for the same bytes.
for label, subsampling in (("444", 0), ("420", 2), ("422", 1), ("411", 3)):
    src = save(flat, "JPEG", quality=100, subsampling=subsampling)
    add(f"jpeg-{label}", src, reference(src))
grey_src = save(grey, "JPEG", quality=100)
add("jpeg-grey", grey_src, reference(grey_src))
photo_src = save(gradient(), "JPEG", quality=95, subsampling=2)
add("jpeg-photo", photo_src, reference(photo_src))
# Quality 70 on an image full of hard colour edges: this is where a chroma
# upsampler that disagrees with libjpeg's shows up.
harsh_src = save(gradient(), "JPEG", quality=70, subsampling=2)
add("jpeg-harsh", harsh_src, reference(harsh_src))
add("jpeg-progressive", save(flat, "JPEG", quality=90, progressive=True), reason="progressive")

# The files above come out of an image library. These five are written by hand,
# because nothing on a dev machine writes them on purpose, and each one pins a
# decoding path the library fixtures never reach: a coefficient at the far end of
# the zigzag (which can only be told in ZRL symbols), four Huffman tables sharing
# one DHT segment, one scan per component, and a restart interval — with and
# without 0xFF fill bytes in front of the marker. Pillow cannot supply the last
# two: this build ignores `restart_interval` and writes no DRI at all, so its
# version of a restart fixture was byte-for-byte the plain 4:4:4 file. Pillow
# still supplies the expected pixels, so a wrong read here shows up as a
# disagreement with a second implementation rather than with this repo's own.


def tail_blocks(count, dc, step=6, extra=None):
    """Coefficient lists (zigzag order) whose last AC sits at index 63 or near it."""
    out = []
    for n in range(count):
        block = [0] * 64
        block[0] = dc + (n % 4) * step
        block[63 - (n % 3)] = 3 if n % 2 else -3
        block[1] = (n % 3) - 1
        if extra:
            block[extra[0]] = extra[1]
        out.append(block)
    return out


yCbCr444 = [
    {"id": 1, "h": 1, "v": 1, "q": 0, "blocks": tail_blocks(16, 96)},
    {"id": 2, "h": 1, "v": 1, "q": 1, "blocks": tail_blocks(16, 128)},
    {"id": 3, "h": 1, "v": 1, "q": 1, "blocks": tail_blocks(16, 120)},
]
scan444 = [{"per": [(1, 0, 0), (2, 1, 1), (3, 1, 1)]}]

zrl_src = baseline_jpeg(SIZE, SIZE, yCbCr444, scan444, packed_tables=False)
add("jpeg-zrl", zrl_src, reference(zrl_src))

packed_src = baseline_jpeg(SIZE, SIZE, yCbCr444, scan444, packed_tables=True)
add("jpeg-packed-dht", packed_src, reference(packed_src))

# 4:2:0 with a scan per component. The two chroma scans share table ids but not
# table contents, so the file only decodes if each SOS uses the tables that were
# in force when it appeared.
luma2 = {"id": 1, "h": 2, "v": 2, "q": 0, "blocks": tail_blocks(16, 96)}
cb2 = {"id": 2, "h": 1, "v": 1, "q": 1, "blocks": tail_blocks(4, 132, extra=(2, -2))}
cr2 = {"id": 3, "h": 1, "v": 1, "q": 1, "blocks": tail_blocks(4, 108, step=9, extra=(10, 4))}
multi_src = baseline_jpeg(SIZE, SIZE, [luma2, cb2, cr2],
                          [{"per": [(1, 0, 0)]}, {"per": [(2, 1, 1)]}, {"per": [(3, 1, 1)]}])
add("jpeg-multiscan", multi_src, reference(multi_src))

ycbcr420 = [luma2, cb2, cr2]
scan420 = [{"per": [(1, 0, 0), (2, 1, 1), (3, 1, 1)]}]
restart_src = baseline_jpeg(SIZE, SIZE, ycbcr420, scan420, restart=3)
add("jpeg-restart", restart_src, reference(restart_src))

fill_src = baseline_jpeg(SIZE, SIZE, ycbcr420, scan420, restart=3, fills=2)
add("jpeg-restart-fill", fill_src, reference(fill_src))

# A frame that lists its components Y-Cr-Cb is the one case this writer cannot
# referee. T.81 pairs a scan component with the frame by identifier, but libjpeg
# pairs by position and then checks the identifier, so a file whose SOS order
# differs from its SOF order stops with "Invalid component ID 2 in SOS" instead of
# showing what it decoded. The reader in bin/utils/images/jpeg.js follows the spec
# and resolves by identifier anyway; there is simply no second implementation to
# hold it to that, so no fixture here claims it.

# ---- PNG: colour types, bit depths, row filters and transparency.
alpha = flat.convert("RGBA")
px = alpha.load()
for y in range(SIZE):
    for x in range(SIZE):
        px[x, y] = (*px[x, y][:3], 0 if (x // 4 + y // 4) % 3 == 0 else 255)

add("png-rgb", save(flat, "PNG"), rgba_of(flat))
add("png-grey", save(grey, "PNG"), rgba_of(grey))
add("png-rgba", save(alpha, "PNG"), rgba_of(alpha))
for filter_type in range(5):
    add(f"png-filter-{filter_type}", save(alpha, "PNG", filter_type=filter_type), rgba_of(alpha))

# Paletted from an RGB source on purpose: converting an RGBA image makes Pillow
# write a tRNS chunk, and then this fixture would silently test the transparent
# path while `png-palette-trns` claims to.
palette = flat.convert("P", palette=Image.ADAPTIVE, colors=16)
add("png-palette", save(palette, "PNG"), rgba_of(palette))
add("png-palette-trns", save(palette, "PNG", transparency=0), rgba_of(palette, transparent_index=0))

# 1-bit grey: the only ramp whose stored value is not already an 8-bit number,
# so it is the fixture that proves sub-byte samples are scaled rather than read.
mono = flat.convert("1")
add("png-grey-1bit", save(mono, "PNG"), rgba_of(mono))

sixteen = Image.new("I;16", (SIZE, SIZE))
sixteen.putdata([(x * 2048 + y * 128) % 65536 for y in range(SIZE) for x in range(SIZE)])
add("png-16bit", save(sixteen, "PNG"), rgba_of(sixteen))

# ---- BMP: 24-bit, 32-bit with alpha, and an 8-bit palette.
add("bmp-24", save(flat, "BMP"), rgba_of(flat))
add("bmp-32", save(alpha, "BMP"), rgba_of(alpha))
add("bmp-8", save(palette, "BMP"), rgba_of(palette))

# ---- GIF: palette, transparency, interlace, and a two-frame file.
gif_source = tiles(lambda x, y: ((x % 4) * 60, (y % 4) * 60, ((x + y) % 4) * 50))
gif_flat = gif_source.convert("P", palette=Image.ADAPTIVE, colors=16)
add("gif-basic", save(gif_flat, "GIF"), rgba_of(gif_flat))
add("gif-interlaced", save(gif_flat, "GIF", interlace=True), rgba_of(gif_flat))
add("gif-transparent", save(gif_flat, "GIF", transparency=1), rgba_of(gif_flat, transparent_index=1))

frame_a = tiles(lambda x, y: (x * 8 % 256, 0, 0)).convert("P", palette=Image.ADAPTIVE, colors=16)
frame_b = tiles(lambda x, y: (0, y * 8 % 256, 0)).convert("P", palette=Image.ADAPTIVE, colors=16)
animated = io.BytesIO()
frame_a.save(animated, format="GIF", save_all=True, append_images=[frame_b], duration=100, loop=0)
add("gif-animated", animated.getvalue(), rgba_of(frame_a))

# ---- Formats the command must decline, naming the reason.
add("webp", save(flat, "WEBP"), reason="WebP")
add("tiff", save(flat, "TIFF"), reason="TIFF")
add("ico", save(flat, "ICO"), reason="ICO")
add("svg", b'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"></svg>', reason="SVG")
# A JPEG with a JFIF tag and no frame is not an unsupported mode: it is a file
# that stopped halfway, so it belongs with the failures. Counting it as a decline
# would let a build ship a truncated asset and still exit 0.
add("corrupt-jpeg", b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x02\x00\x00\x01\x00\x01\x00\x00\xff\xd9",
    reason="start-of-frame", kind="refuse")

# The declines above are files a library wrote. These are headers, because nothing
# on this machine will export an Adam7 PNG, an RLE BMP or a 12-bit JPEG for us, and
# a refusal that no fixture reaches is a comment rather than a contract: the day a
# decoder starts guessing at one of these modes instead of saying no, this is what
# notices.
def png_chunk(kind, payload):
    body = kind + payload
    return len(payload).to_bytes(4, "big") + body + zlib.crc32(body).to_bytes(4, "big")


def png_header(depth, colour_type, interlace=0):
    return (b"\x89PNG\r\n\x1a\n"
            + png_chunk(b"IHDR", struct.pack(">IIBBBBB", SIZE, SIZE, depth, colour_type, 0, 0, interlace))
            + png_chunk(b"IEND", b""))


def bmp_header(header_size, compression, bit_count):
    dib = (struct.pack("<IiiHHIIiiII", header_size, SIZE, SIZE, 1, bit_count, compression, 0, 0, 0, 0, 0)
           if header_size >= 40 else struct.pack("<IiiHH", header_size, SIZE, SIZE, 1, bit_count))
    # An OS/2 core header makes a 26-byte file, and the reader calls anything
    # shorter than a BITMAPINFOHEADER "not a BMP" before it ever looks at the
    # header size — which is the right answer for a truncated download.
    head = b"BM" + bytes(8) + (54).to_bytes(4, "little") + dib
    return head + bytes(max(0, 54 - len(head)))


def jpeg_header(sof, precision=8, components=3):
    return (b"\xff\xd8" + marker(sof, bytes([precision, 0, SIZE, 0, SIZE, components])
                                 + b"".join(bytes([i + 1, 0x11, 0]) for i in range(components))))


add("png-adam7", png_header(8, 2, interlace=1), reason="Adam7")
add("png-3bit", png_header(3, 2), reason="3-bit samples")
add("bmp-rle8", bmp_header(40, 1, 8), reason="compression mode 1")
add("bmp-16bit", bmp_header(40, 0, 16), reason="16-bit depth")
add("bmp-os2", bmp_header(12, 0, 8), reason="BITMAPCOREHEADER")
add("jpeg-lossless", jpeg_header(0xC3), reason="lossless")
add("jpeg-arithmetic", jpeg_header(0xC9), reason="arithmetic")
add("jpeg-12bit", jpeg_header(0xC0, precision=12), reason="12-bit samples")
add("jpeg-cmyk", jpeg_header(0xC0, components=4), reason="CMYK")

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w") as handle:
    json.dump({"generatedBy": "scripts/generate-image-fixtures.py", "fixtures": FIXTURES}, handle)

print(f"{OUT}: {len(FIXTURES)} fixtures")
