# CircularBar

## Overview
`CircularBar` renders a circular progress ring (donut) drawn on a real `<canvas>` inside a `<div>` container — not SVG, not CSS conic gradients. The arc starts at 12 o'clock, sweeps clockwise for `value / max` of the turn, and animates from 0 with `requestAnimationFrame` by default. The center text (value, `label`, `subtitle`) is painted onto the same canvas. Without `size` it is fully responsive: a `ResizeObserver` redraws the ring whenever the container width changes.

## When to use
- Show a score, quota, or completion percentage as a compact ring (dashboards, cards).
- Animate progress toward a target with `animate` and `onComplete`.
- Mark thresholds on the ring with `markers`, or add a second inner ring with `innerStrokeWidth`/`innerColor`.

## Import

```javascript
import { CircularBar } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { CircularBar } from "flet-box";

CircularBar({ value: 75, size: 120 });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | number | `0` | Current progress. |
| `max` | number | `100` | Value that counts as a full circle. |
| `size` | number | `null` | Fixed diameter in pixels (`inline-block` container). `null` = responsive: fills the container width (`block`, `width: 100%`), 200px fallback. |
| `strokeWidth` | number | `12` | Ring thickness in pixels. |
| `color` | Color | `colors.primary` | Progress arc color (used when `gradient` is not set). |
| `backgroundColor` | Color | `colors.gray200` | Background ring color. |
| `showValue` | boolean | `true` | Paints the formatted value in the center. |
| `valueColor` | Color | `colors.text` | Center value color. |
| `valueSize` | number | `24` | Center value font size in pixels. |
| `label` | string | — | Caption painted under the value. |
| `labelColor` | Color | `colors.textSecondary` | Caption color. |
| `labelSize` | number | `12` | Caption font size in pixels. |
| `lineCap` | `'round'`, `'butt'`, `'square'` | `'round'` | Canvas line cap for both rings. |
| `animate` | boolean | `true` | Animates the arc from 0 to `value`. `false` draws it statically. |
| `animationDuration` | number (ms) | `1000` | Sweep duration. |
| `onComplete` | function | — | Fires when the sweep animation finishes (animated mode only). |
| `ref` | function | — | Receives the `<canvas>` element. |
| `valueFormat` | `'percent'`, `'value'`, `'custom'` | `'percent'` | Center text mode: rounded percentage, raw value, or `current/max`. |
| `valuePrefix` / `valueSuffix` | string | `''` | Text around the formatted value (e.g. `valueSuffix: "%"`). |
| `valueDecimals` | number | `0` | Decimals kept in the formatted value. |
| `customValueFormatter` | `(value, max) => string` | `null` | Overrides all formatting when set. |
| `gradient` | array of Colors or string | `null` | Array → diagonal canvas linear gradient across those stops; string → used as the stroke style directly. |
| `gradientAngle` | number | `135` | Accepted but currently unused — the canvas gradient is always diagonal. |
| `shadowBlur` | number | `0` | Canvas shadow blur behind the arc. |
| `shadowColor` | string | `'rgba(0,0,0,0.3)'` | Canvas shadow color. |
| `glow` | boolean | `false` | Strong glow on the arc (blur 12) using `glowColor` or `color`. |
| `glowColor` | Color | `null` | Glow color override. |
| `markers` | array of `{ value, color?, size?, label? }` | `[]` | Dots on the ring perimeter at given values (default radius 4), with optional 10px labels. |
| `innerStrokeWidth` | number | `0` | Width of a second ring drawn inside the main one (needs `innerColor`). |
| `innerColor` | Color | `null` | Inner ring color. |
| `onClick` | `({ value, max, percent }) => void` | `null` | Click handler on the canvas. |
| `onHover` | `(hovering, { value, max }) => void` | `null` | Fires on canvas mouseenter (`true`) and mouseleave (`false`). |
| `subtitle` | string | `null` | Extra line painted under the value/label. |
| `subtitleColor` | Color | `colors.textSecondary` | Subtitle color. |
| `subtitleSize` | number | `10` | Subtitle font size in pixels. |
| `tooltip` | string | `null` | Sets the native `title` attribute on the canvas. |

These are the props specific to `CircularBar`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style` — applied to the outer container (note: `ref` above is consumed by `CircularBar` itself and receives the canvas).

## Instance methods

The returned container element exposes:

- `updateValue(newValue, newMax = null)` — sets a new value (clamped to `max`, optionally a new `max`) and replays the animation.
- `_cleanup()` — (framework hook) cancels the running animation and disconnects the resize observer.

## Examples

### Everyday example

```javascript
import { CircularBar, colors } from "flet-box";

const disk = CircularBar({
  value: 82,
  max: 100,
  size: 140,
  strokeWidth: 10,
  color: colors.warning,
  label: "Disk used",
  valueSuffix: "%",
});

// disk.updateValue(64);
```

### Full example

```javascript
import { CircularBar, colors } from "flet-box";

const ring = CircularBar({
  value: 68,
  max: 100,
  strokeWidth: 14,
  gradient: ["#6366f1", "#8b5cf6", "#ec4899"],
  backgroundColor: colors.border,
  lineCap: "round",
  showValue: true,
  valueSize: 28,
  valueDecimals: 1,
  valueSuffix: "%",
  label: "Completion",
  subtitle: "of Q3 target",
  glow: true,
  glowColor: colors.primary,
  markers: [
    { value: 25, color: colors.textSecondary, size: 4, label: "Q1" },
    { value: 75, color: colors.success, size: 5 },
  ],
  innerStrokeWidth: 3,
  innerColor: colors.gray100,
  animate: true,
  animationDuration: 1500,
  onComplete: () => console.log("animation done"),
  onClick: ({ percent }) => console.log(`clicked at ${percent}%`),
  tooltip: "68% completed",
});
```

## Notes

- Everything visible — arc, value, label, subtitle, markers — is painted on one `<canvas>`; there is no text in the DOM to select or style with CSS.
- Responsive mode (`size` omitted) measures the container with `getBoundingClientRect()`; before layout it falls back to 200px, then the `ResizeObserver` (or a `window` resize listener where observers are unavailable) redraws at the real width.
- `animate: true` sweeps from 0 on every `updateValue()` call and on resize; `onComplete` only fires at the end of an animated sweep, never in static mode.
- `valueFormat: 'percent'` rounds the percentage; during animation the center text counts up with the arc.
- `updateValue` clamps `value` to `max` but does not clamp below 0.

## Related widgets
- [ProgressBar](ProgressBar.md)
- [Skeleton](Skeleton.md)
- [Chart](Chart.md)
- [Card](Card.md)
- [Text](Text.md)

---

## Continue reading

- **Previous:** [ProgressBar](ProgressBar.md)
- **Next:** [Skeleton](Skeleton.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (7 of 10).
