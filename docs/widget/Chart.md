# Chart

Chart draws bar, line, area or candlestick data onto a canvas, with optional labels, grid and value annotations. Numeric arrays drive bar/line/area while OHLC objects drive candle charts.

## When to use it

Use it to visualize trends and comparisons inline without pulling in a charting library.

## Quick start

```javascript
import { Chart } from "flet-box";

const totals = Chart({
  type: "bar",
  data: [12, 19, 7, 15],
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `type` | `'bar' \| 'line' \| 'area' \| 'candle'` | Kind or mode of the widget. |
| `data` | `number[] \| Array<{ open: number; high: number; low: number; close: number }>` | Array of values or `{ label, value }` slices. |
| `labels` | `string[]` | Axis or slice labels for the chart. |
| `width` | `number \| string` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `number` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `padding` | `number \| { top: number; right: number; bottom: number; left: number }` | Space inside the widget, between its content and its border. |
| `candleWidth` | `number` | Width of each candlestick. |
| `candleSpacing` | `number` | The `candleSpacing` value for the widget. |
| `barColor` | `Color` | Color used for the bar. |
| `lineColor` | `Color` | Color used for the line. |
| `areaColor` | `Color` | Color used for the area. |
| `smooth` | `boolean` | Draws a smoothed line instead of straight segments. |
| `areaGradient` | `boolean` | Fills the area under the line with a gradient. |
| `areaGradientColors` | `[string, string]` | The `areaGradientColors` value for the widget. |
| `candleUpColor` | `Color` | Color used for the candle up. |
| `candleDownColor` | `Color` | Color used for the candle down. |
| `axisColor` | `Color` | Color used for the axis. |
| `textColor` | `Color` | Color of the button label. |
| `yAxisColor` | `Color` | Color used for the y axis. |
| `showGrid` | `boolean` | Shows the chart grid lines. |
| `showLabels` | `boolean` | Shows chart labels. |
| `showValues` | `boolean` | Controls whether the values is shown. |
| `borderRadius` | `number` | Rounds the corners of the widget. |

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
import { Chart } from "flet-box";

const revenue = Chart({
  type: "line",
  data: [12, 19, 7, 15, 22],
  labels: ["Jan", "Feb", "Mar", "Apr", "May"],
  height: 260,
  showGrid: true,
  showLabels: true,
});
```

### Full

```javascript
import { Chart } from "flet-box";

const trend = Chart({
  type: "area",
  data: [8, 14, 10, 21, 18, 26],
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  width: "100%",
  height: 320,
  smooth: true,
  areaGradient: true,
  areaGradientColors: ["#3b82f6", "#bfdbfe"],
  lineColor: "#2563eb",
  areaColor: "#93c5fd",
  axisColor: "#94a3b8",
  textColor: "#475569",
  showGrid: true,
  showLabels: true,
  showValues: true,
  borderRadius: 12,
  bgColor: "#ffffff",
  padding: 16,
});
```

## Tips

- Match data to type: pass numbers for bar/line/area and open/high/low/close objects for candle.
- Provide labels so the x-axis is meaningful to readers.
- Set an explicit height to reserve space and avoid layout shift while the chart initializes.

## Accessibility

- Add a text summary or table of the values near the chart since canvas content is not readable by screen readers.
- Use sufficient contrast between data, axis and background colors.

## Behavior

- The canvas redraws when data, labels, type or styling props change.
- Candle charts read open, high, low and close in that order from each data object.

## Related widgets

- [CircularChart](CircularChart.md)
- [CircularBar](CircularBar.md)
- [Card](Card.md)

---

## Continue reading

- **Previous:** [DataTable](DataTable.md)
- **Next:** [CircularChart](CircularChart.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 6 · Data, rich content & effects** (2 of 13).
