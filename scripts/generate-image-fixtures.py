#!/usr/bin/env python3
"""Generate `tests/fixtures/images.json` for scripts/check-image-convert.mjs.

Dev-time only, and the one thing it needs is Pillow: the published package has
no image dependency, which is exactly why the CLI carries its own decoders. The
fixtures are the point — an independent decoder's pixels are the ground truth
those decoders are measured against.

    python3 scripts/generate-image-fixtures.py

Each entry is { name, kind, width, height, source (base64 file bytes), rgba
(base64 expected pixels) }.  `kind` is "decode" (the pixels must match) or
"decline" (the reader must refuse, with `reason` inside the message).
"""

import base64
import io
import json
import os

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


FIXTURES = []


def add(name, source, expected=None, reason=None, size=(SIZE, SIZE)):
    entry = {
        "name": name,
        "kind": "decode" if expected is not None else "decline",
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
restart_src = save(flat, "JPEG", quality=100, subsampling=0, restart_interval=1)
add("jpeg-restart", restart_src, reference(restart_src))
add("jpeg-progressive", save(flat, "JPEG", quality=90, progressive=True), reason="progressive")

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
add("corrupt-jpeg", b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x02\x00\x00\x01\x00\x01\x00\x00\xff\xd9",
    reason="start-of-frame")

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w") as handle:
    json.dump({"generatedBy": "scripts/generate-image-fixtures.py", "fixtures": FIXTURES}, handle)

print(f"{OUT}: {len(FIXTURES)} fixtures")
