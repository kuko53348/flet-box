# Chart

## Overview
`Chart` draws bar, line, area, and candlestick series on a single `<canvas>` — no charting library and no SVG. The widget returns a `<div>` (flex column, `overflow: hidden`, rounded by `borderRadius`) that contains a scroll `<div>` and the canvas inside it. `data` is a flat array of numbers for `bar`/`line`/`area`, and an array of OHLC records for `candle`. The chart measures its container, so it paints only once it is in the document.

## When to use
- Plot a numeric series over time or categories (`line`, `area`, `bar`).
- Render financial OHLC data as candles (`candle`, the default `type`).
- Refresh a live series in place with `updateData` instead of rebuilding the widget.

## Import

```javascript
import { Chart } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Chart } from "flet-box";

Chart({ type: "line", data: [10, 20, 15, 30] });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `'bar'`, `'line'`, `'area'`, `'candle'` | `'candle'` | Series kind. `line` and `area` share the same point renderer; `area` also fills to the baseline. |
| `data` | number[] (bar/line/area) or `{ open, high, low, close }[]` / `[open, high, low, close][]` (candle) | `[]` | Series values. **The widget returns `null` when `data` is empty.** Candle rows may be objects or 4-element arrays. |
| `labels` | string[] | `[]` | X-axis labels, matched to `data` by index and drawn rotated below the axis when `showLabels`. |
| `width` | number or string | `'100%'` | Container width; a number becomes px. |
| `height` | number or string | `400` | Container height in pixels. The canvas fills it. |
| `bgColor` | Color | `colors.surface` | Container background. |
| `padding` | number or `{ top, right, bottom, left }` | `{ top: 20, right: 50, bottom: 50, left: 50 }` | Inner plot margins in pixels. A single number is used for all four sides; missing keys fall back to these defaults. |
| `candleWidth` | number | `8` | Candle body width in pixels (used when candles do not fit and the plot scrolls). |
| `candleSpacing` | number | `2` | Gap between candles in pixels. |
| `barColor` | Color | `colors.primary` | Bar fill. |
| `lineColor` | Color | `colors.primary` | Line stroke (2px) and point fill. |
| `areaColor` | Color | `` `${colors.primary}40` `` | Area fill when `areaGradient` is off. |
| `smooth` | boolean | `false` | Draws `line`/`area` with quadratic curves instead of straight segments. |
| `areaGradient` | boolean | `false` | Fills the area with a vertical gradient (area only). |
| `areaGradientColors` | `[Color, Color]` | `null` | Gradient stops from the baseline up. Without it the gradient goes `lineColor` → transparent. |
| `candleUpColor` | Color | `colors.success` | Candle color when `close >= open`. |
| `candleDownColor` | Color | `colors.danger` | Candle color when `close < open`. |
| `axisColor` | Color | `colors.border` | Axis and grid line color. |
| `textColor` | Color | `colors.textSecondary` | Value and label text color. |
| `yAxisColor` | Color | `colors.primary` | Y-axis tick label color. |
| `showGrid` | boolean | `true` | Draws 6 horizontal grid lines with rounded Y tick values. |
| `showLabels` | boolean | `true` | Draws the `labels` under the X axis. |
| `showValues` | boolean | `false` | Draws each data value next to its bar or point. |
| `borderRadius` | number or string | `8` | Container corner radius; a number becomes px. |

These are the props specific to `Chart`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`. Common props land on the outer container.

## Instance methods

The returned container exposes:

- `updateData(newData, newLabels?)` — replaces the series (and optionally the labels) and redraws immediately.
- `redraw()` — re-measures the container and repaints.
- `_cleanup()` — cancels the pending timers, disconnects the `ResizeObserver`, and removes the `resize`/`scroll` listeners.

## Examples

### Everyday example

```javascript
import { Chart, colors } from "flet-box";

Chart({
  type: "bar",
  data: [12, 19, 8, 15, 22],
  labels: ["Jan", "Feb", "Mar", "Apr", "May"],
  barColor: colors.primary,
  height: 260,
  showGrid: true,
  showLabels: true,
});
```

### Full example

```javascript
import { Chart, colors } from "flet-box";

const revenue = Chart({
  type: "area",
  data: [5, 15, 25, 20, 30, 45],
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  width: "100%",
  height: 320,
  bgColor: colors.surface,
  padding: { top: 20, right: 40, bottom: 40, left: 50 },
  lineColor: colors.primary,
  areaColor: `${colors.primary}40`,
  smooth: true,
  areaGradient: true,
  areaGradientColors: [`${colors.primary}66`, "transparent"],
  axisColor: colors.border,
  textColor: colors.textSecondary,
  yAxisColor: colors.primary,
  showGrid: true,
  showLabels: true,
  showValues: false,
  borderRadius: 12,
});

const candles = Chart({
  type: "candle",
  data: [
    { open: 100, high: 112, low: 98, close: 110 },
    { open: 110, high: 115, low: 104, close: 106 },
    [106, 109, 101, 108], // arrays are accepted too: [open, high, low, close]
  ],
  labels: ["D1", "D2", "D3"],
  height: 320,
  candleUpColor: colors.success,
  candleDownColor: colors.danger,
});

// Live updates:
// revenue.updateData([8, 12, 18, 26, 33, 41], ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
// revenue.redraw();
```

## Notes

- **The default `type` is `'candle'`**, which expects OHLC data. Passing plain numbers without setting `type` leaves the scale as `NaN` and nothing visible is drawn.
- `Chart({ data: [] })` (or any empty `data`) returns `null`, not an empty container — guard for that if you render conditionally.
- Painting is asynchronous: the first draw runs in a `setTimeout(..., 100)`, then on every `ResizeObserver` tick and window resize (debounced 50ms). The size is read from the container's bounding rect, so an unmounted or zero-height chart draws nothing.
- `line` and `area` need at least 2 points; with a single point only the grid and axes appear.
- The Y scale adds 10% headroom above the max and below the min, and the lower bound is clamped at `0`.
- Candle charts either stretch to the container width or keep `candleWidth`/`candleSpacing` and scroll horizontally when the series is too wide.
- `updateData` mutates the `data`/`labels` arrays you passed in.
- Value and label text is drawn at 8–9px on the canvas, so it does not scale with your theme's font settings.

## Related widgets
- [CircularChart](CircularChart.md)
- [CircularBar](CircularBar.md)
- [ProgressBar](ProgressBar.md)
- [DataTable](DataTable.md)
- [Container](Container.md)

---

## Continue reading

- **Previous:** [DataTable](DataTable.md)
- **Next:** [CircularChart](CircularChart.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 6 · Data and rich content** (2 of 7).
