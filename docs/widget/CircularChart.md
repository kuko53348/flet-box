# CircularChart

## Overview
`CircularChart` draws a pie or donut on a `<canvas>` — no SVG and no charting library. Each item in `data` becomes one slice sized by its share of the total, colored from `defaultColors` (or the datum's own `color`), and swept in with a `requestAnimationFrame` animation. The widget returns a `<div>` holding the canvas: with a fixed `size` that div is `inline-block` at exactly that size, and without one it fills its container width and re-measures on resize.

## When to use
- Show parts of a whole: traffic sources, budget split, survey answers.
- Draw a ring gauge with the default `innerRadius` plus `centerContent` in the hole.
- Make slices clickable or hoverable with `onClick` / `onHover`, which hit-test the canvas for you.

## Import

```javascript
import { CircularChart } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { CircularChart } from "flet-box";

CircularChart({
  data: [{ value: 60 }, { value: 40 }],
  size: 160,
});
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | array of `{ value, label?, color? }` | `[]` | One slice per item. `value` sets the slice's share of the total, `color` overrides the palette, `label` is the text drawn when `showLabels` is on. A non-array is coerced to `[]`. |
| `size` | number | `null` | Diameter in pixels. When `null` the chart fills its container width and observes resizes. |
| `strokeWidth` | number | `20` | Ring thickness, used only to derive `innerRadius`. |
| `innerRadius` | number | `null` → `size / 2 - strokeWidth` (or `100 - strokeWidth` when `size` is null) | Hole radius in pixels. `> 0` draws a donut with a `colors.gray200` track; `0` draws a solid pie. |
| `rounded` | boolean | `false` | Pie only (`innerRadius` is `0`): dots the outer mid-angle of each slice. |
| `cornerRadius` | number | `0` | Donut only (`innerRadius > 0`): draws each slice as a round-capped stroke instead of a filled wedge. |
| `startAngle` | number (radians) | `-Math.PI / 2` | Angle of the first slice; the default is 12 o'clock. |
| `endAngle` | number (radians) | `null` → `startAngle + 2π` | End of the sweep. Set both to draw a partial ring. |
| `semiCircle` | `'top'`, `'bottom'`, `'left'`, `'right'` | `null` | Overrides the angles for a half chart and halves the canvas on that axis. |
| `animate` | boolean | `true` | Sweeps slices from 0 to their value with `requestAnimationFrame`. |
| `animationDuration` | number (ms) | `1000` | Sweep duration. |
| `onComplete` | `() => void` | — | Fires once when the sweep finishes. |
| `centerContent` | string | `null` | Text drawn in the middle of the canvas. Only strings are rendered. |
| `showLabels` | boolean | `false` | Draws `label` (or a computed percentage) on each non-zero slice. |
| `labelSize` | number | `12` | Label font size in pixels. |
| `labelColor` | Color | `colors.text` | Label color. |
| `onClick` | `(slice, index) => void` | `null` | Fires when a slice is clicked; `slice` is the original datum. |
| `onHover` | `(slice \| null, index) => void` | `null` | Fires when the hovered slice changes; `(null, -1)` on mouse leave. |
| `defaultColors` | Color[] | `[colors.primary, colors.secondary, colors.success, colors.warning, colors.danger, colors.info]` | Slice palette, cycled by index. |
| `ref` | `(canvas) => void` | — | Receives the **canvas element**, not the container. |
| `borderRadius` | number or string | `0` | Container corner radius; a number becomes px. |
| `borderColor` | Color | `null` | Container border color (needs `borderWidth > 0`). |
| `borderWidth` | number | `0` | Container border thickness in pixels. |
| `sliceBorderWidth` | number | `0` | Stroke drawn around each slice to separate neighbors. |
| `sliceBorderColor` | Color | `'#ffffff'` | Color of that slice separator. |
| `shadowBlur` | number | `0` | Accepted but currently inert: the canvas shadow is reset to `0` on every draw. |
| `shadowColor` | Color | `'rgba(0,0,0,0.2)'` | Accepted but currently inert. |
| `glow` | boolean | `false` | Accepted but currently inert (it only keeps the hover handler alive). |
| `glowColor` | Color | `null` | Accepted but currently inert. |

These are the props specific to `CircularChart`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`. Common props land on the container — except `ref`, which the widget consumes itself and calls with the canvas.

## Instance methods

The returned container exposes:

- `updateData(newData, animateUpdate = true)` — swaps in a new dataset; pass `false` to skip the sweep.
- `redraw()` — re-measures the canvas and redraws.
- `setCornerRadius(newRadius)` — changes `cornerRadius` and repaints.
- `_cleanup()` — cancels the animation frame, disconnects the resize observer, removes the canvas listeners, and detaches the container.

## Examples

### Everyday example

```javascript
import { CircularChart, colors } from "flet-box";

CircularChart({
  data: [
    { value: 45, label: "Organic", color: colors.primary },
    { value: 30, label: "Referral", color: colors.success },
    { value: 25, label: "Paid", color: colors.warning },
  ],
  size: 220,
  strokeWidth: 28,
  showLabels: true,
  labelSize: 12,
  centerContent: "Traffic",
  onClick: (slice, index) => console.log(index, slice.label, slice.value),
});
```

### Full example

```javascript
import { CircularChart, colors } from "flet-box";

let canvasEl = null;

const donut = CircularChart({
  data: [
    { value: 12, label: "Rent" },
    { value: 6, label: "Food" },
    { value: 3, label: "Transport" },
    { value: 2, label: "Fun" },
  ],
  size: 260,
  innerRadius: 90,
  cornerRadius: 6,
  sliceBorderWidth: 2,
  sliceBorderColor: "#ffffff",
  defaultColors: [colors.primary, colors.secondary, colors.info, colors.success],
  animate: true,
  animationDuration: 800,
  onComplete: () => console.log("sweep done"),
  showLabels: true,
  labelSize: 11,
  labelColor: "#ffffff",
  centerContent: "$2.3k",
  borderRadius: 12,
  onHover: (slice, index) => console.log("hover", index, slice ? slice.label : null),
  ref: (canvas) => {
    canvasEl = canvas; // the <canvas>, ready for canvasEl.toDataURL()
  },
});

// Half-ring gauge, painted synchronously:
const gauge = CircularChart({
  data: [{ value: 72 }, { value: 28 }],
  size: 200,
  semiCircle: "bottom",
  defaultColors: [colors.success, colors.gray200],
  animate: false,
});

// donut.updateData([{ value: 1 }], false);  donut.redraw();  donut.setCornerRadius(0);
```

## Notes

- Data items are **objects with a `value`**. Plain numbers (`data: [25, 35, 40]`) read as `undefined`, so every slice ends up at `0` and nothing is drawn.
- The palette prop is `defaultColors`, not `colors`; per-slice colors come from `data[i].color`.
- Values are relative: the slice angle is `value / total * (endAngle - startAngle)`. If the total is `0`, no slices are drawn.
- With `size: null` the canvas is sized from the container's bounding rect (falling back to 200px when it measures 0), so the chart must be mounted to size itself.
- `cornerRadius` only has an effect when `innerRadius > 0`; `rounded` only has an effect when `innerRadius` is `0`.
- `centerContent` is painted on the canvas: it is not selectable text and it does not accept widgets. For rich center content, overlay your own element on the container (which is `position: relative`).
- When `showLabels` is on and a datum has no `label`, the fallback text is a percentage computed from the slice's angle span rather than from the total — set `label` explicitly for reliable text.
- `onClick`/`onHover` do real hit-testing (radius plus angle), so clicks in the donut hole or outside the ring are ignored.
- Animation uses `requestAnimationFrame`; pass `animate: false` for a synchronous first paint (handy in tests and screenshots).

## Related widgets
- [Chart](Chart.md)
- [CircularBar](CircularBar.md)
- [ProgressBar](ProgressBar.md)
- [Rating](Rating.md)
- [Text](Text.md)

---

## Continue reading

- **Previous:** [Chart](Chart.md)
- **Next:** [Markdown](Markdown.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 6 · Data and rich content** (3 of 7).
