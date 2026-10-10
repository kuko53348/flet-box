# QRCode

QRCode renders a scannable QR image for a string value. It lets you tune size, colors and the error-correction level.

## When to use it

Use it to share URLs, pairing codes or contact data that a phone camera can scan.

## Quick start

```javascript
import { QRCode } from "flet-box";

const qr = QRCode({
  value: "https://fletbox.dev",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `string` | Current value controlled by the widget. |
| `size` | `number` | Overall size preset or pixel value, depending on the widget. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `fgColor` | `Color` | Color used for the fg. |
| `errorCorrection` | `'L' \| 'M' \| 'Q' \| 'H'` | The `errorCorrection` value for the widget. |
| `margin` | `number` | Space outside the widget, between it and its neighbors. |

### Common props

Every widget also accepts these shared props — see [common props](COMMON_PROPS.md) for the full rules and aliases.

| Prop | Type | Description |
| --- | --- | --- |
| `width` | `Size` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `Size` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `size` | `number` | Overall size preset or pixel value, depending on the widget. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `margin` | `Margin` | Space outside the widget, between it and its neighbors. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |
| `opacity` | `number` | Opacity from 0 (invisible) to 1 (fully opaque). |
| `visible` | `boolean` | Whether the widget is rendered and visible. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `onPress` | `(widget: Widget) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |
| `onClick` | `(widget: Widget) => void` | Callback fired when the widget is clicked. Alias: `onPress`. |
| `id` | `string` | DOM `id` for the rendered element. |
| `className` | `string` | CSS class names applied to the rendered element. |
| `ref` | `(widget: Widget) => void` | Callback that receives the underlying DOM node. |
| `disableTransform` | `boolean` | Disables the default press/scale transform animation. |

## Examples

### Everyday

```javascript
import { QRCode } from "flet-box";

const qr = QRCode({
  value: "https://fletbox.dev/download",
  size: 220,
  errorCorrection: "M",
});
```

### Full

```javascript
import { QRCode } from "flet-box";

const qr = QRCode({
  value: "https://fletbox.dev/invite?team=core",
  size: 320,
  bgColor: "#ffffff",
  fgColor: "#0f172a",
  margin: 8,
  errorCorrection: "H",
});
```

## Tips

- Keep size large enough to scan comfortably; very small codes fail on low-resolution cameras.
- Raise errorCorrection to H when the code may be printed small, dirty or partially covered.
- Keep fgColor dark and bgColor light for reliable contrast.

## Accessibility

- Also show the encoded value as text so users who cannot scan it can still read or type it.
- Maintain strong foreground and background contrast for camera and screen legibility.

## Behavior

- The QR image re-encodes whenever value or errorCorrection changes.
- margin adds a quiet-zone border around the code, which scanners expect.

## Related widgets

- [Image](Image.md)
- [CodeViewer](CodeViewer.md)
- [Card](Card.md)

---

## Continue reading

- **Previous:** [CodeViewer](CodeViewer.md)
- **Next:** [Inspector](Inspector.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 6 · Data, rich content & effects** (6 of 13).
