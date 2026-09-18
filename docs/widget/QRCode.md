# QRCode

## Overview
`QRCode` paints a QR-style matrix onto a `<canvas>` using FletBox's own built-in generator — no external QR library and no SVG. It returns an `inline-block` `<div>` containing a single canvas sized `size × size` pixels. The payload comes from `value` (a string); `bgColor` and `fgColor` are canvas fill colors, not CSS. The first paint is deferred with `setTimeout(..., 10)`, and `updateValue()` repaints synchronously.

## When to use
- Show a shareable code for a URL, session id, or small JSON payload.
- Let the user download the code as a PNG with `download()`.
- Reuse one widget for many payloads via `updateValue()` instead of rebuilding it.

## Import

```javascript
import { QRCode } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { QRCode } from "flet-box";

QRCode({ value: "https://flet-box.dev" });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | string | `""` | Payload encoded in the matrix. **The widget returns `null` when `value` is falsy.** There is no `text` alias. |
| `size` | number | `200` | Canvas width and height in pixels (always square). |
| `bgColor` | Color | `'#ffffff'` | Canvas background fill. |
| `fgColor` | Color | `'#000000'` | Module (dark cell) fill. |
| `errorCorrection` | `'L'`, `'M'`, `'Q'`, `'H'` | `'M'` | Accepted but not applied: the built-in generator does no error correction. |
| `margin` | number | `4` | Quiet zone in **modules**, not CSS margin. It is consumed by the widget, so the common `margin` prop has no effect here. |

These are the props specific to `QRCode`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`. Common props land on the wrapper `<div>` — except `margin`, which the widget itself takes.

## Instance methods

The returned wrapper exposes:

- `updateValue(newValue)` — sets a new payload and repaints immediately (synchronously).
- `download(filename = 'qrcode.png')` — triggers a browser download of the canvas as PNG.
- `getDataURL()` — returns the canvas data URL.
- `getCanvas()` — returns the underlying `<canvas>` element.
- `getValue()` — returns the current payload string.

## Examples

### Everyday example

```javascript
import { QRCode } from "flet-box";

QRCode({
  value: "https://flet-box.dev/docs",
  size: 180,
  bgColor: "#ffffff",
  fgColor: "#0f172a",
});
```

### Full example

```javascript
import { Button, Column, QRCode, Row, Text, colors } from "flet-box";

const qr = QRCode({
  value: JSON.stringify({ id: 123, token: "abc" }),
  size: 260,
  bgColor: "#ffffff",
  fgColor: "#1a1a2e",
  margin: 4,
  borderRadius: 12,
  onClick: () => console.log("qr tapped"),
});

Column({
  gap: 12,
  alignItems: "center",
  children: [
    Text({ text: "Scan to continue", size: 16, color: colors.textSecondary }),
    qr,
    Row({
      gap: 8,
      children: [
        Button({
          text: "New link",
          onPress: () => qr.updateValue("https://flet-box.dev/" + Date.now()),
        }),
        Button({ text: "Download PNG", onPress: () => qr.download("ticket.png") }),
        Button({
          text: "Log data URL",
          onPress: () => console.log(qr.getValue(), qr.getDataURL().slice(0, 32)),
        }),
      ],
    }),
  ],
});
```

## Notes

- The payload prop is **`value`**. `QRCode({ text: "..." })` renders nothing (`value` stays `""`, so the widget returns `null`) and `text` ends up on the wrapper as a common prop.
- `QRCode({ value: "" })` returns `null`, not an empty box — guard for that when the payload arrives asynchronously.
- The canvas is painted in a `setTimeout(..., 10)` after construction, so `getDataURL()` called in the same tick returns a blank image. Call `updateValue()` (synchronous) first if you need pixels immediately.
- The generator is deliberately simplified — the source comments call it "for demo only" and recommend a proper library for production. It packs each character's 8 bits into the matrix and draws the finder, timing, and alignment patterns, but performs no Reed–Solomon error correction, so the result looks like a QR code and may not scan reliably.
- The matrix starts at 21×21 modules and grows by 2 while it cannot hold the payload, so longer strings produce denser (smaller-module) codes at the same `size`.
- `margin` is the quiet zone in modules; the module size is `size / (moduleCount + margin * 2)`.
- `size` sets the canvas CSS size and its backing-store size, so the code stays crisp at that exact pixel size but blurs if you scale it with CSS.

## Related widgets
- [Image](Image.md)
- [CodeViewer](CodeViewer.md)
- [Button](Button.md)
- [Text](Text.md)
- [Container](Container.md)

---

## Continue reading

- **Previous:** [CodeViewer](CodeViewer.md)
- **Next:** [Inspector](Inspector.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 6 · Data and rich content** (6 of 7).
