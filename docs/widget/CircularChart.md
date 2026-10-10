# CircularChart

A pie or donut chart drawn on canvas with per-slice value, label, and color. It supports rounded slices, semi-circles, center content, and entry animation.

## When to use it

Use it to show part-to-whole breakdowns such as traffic sources, spending, or task status distribution.

## Quick start

```javascript
import { CircularChart } from "flet-box";

const chart = CircularChart({
  data: [
    { value: 60, label: "Direct", color: "#2563eb" },
    { value: 40, label: "Referral", color: "#10b981" },
  ],
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `CircularChartSlice[]` | Array of values or `{ label, value }` slices. |
| `size` | `number` | Overall size preset or pixel value, depending on the widget. |
| `strokeWidth` | `number` | Thickness of the circular stroke. |
| `innerRadius` | `number` | Radius of the empty center of a donut. |
| `rounded` | `boolean` | The `rounded` value for the widget. |
| `cornerRadius` | `number` | Corner radius for the corner. |
| `startAngle` | `number` | Starting angle of the arc, in degrees. |
| `endAngle` | `number` | Ending angle of the arc, in degrees. |
| `animate` | `boolean` | The `animate` value for the widget. |
| `animationDuration` | `number` | Duration for the animation, in milliseconds. |
| `onComplete` | `() => void` | Event handler for the `onComplete` event. |
| `centerContent` | `string \| Widget \| null` | Widget rendered in the center of the circle. |
| `showLabels` | `boolean` | Shows chart labels. |
| `labelSize` | `number` | Size of the label. |
| `labelColor` | `Color` | Color used for the label. |
| `onClick` | `(slice: CircularChartSlice, index: number) => void` | Callback fired when the widget is clicked. Alias: `onPress`. |
| `onHover` | `(slice: CircularChartSlice \| null, index: number) => void` | Event handler for the `onHover` event. |
| `defaultColors` | `Color[]` | The `defaultColors` value for the widget. |
| `ref` | `(canvas: HTMLCanvasElement) => void` | Callback that receives the underlying DOM node. |
| `shadowBlur` | `number` | The `shadowBlur` value for the widget. |
| `shadowColor` | `string` | Color used for the shadow. |
| `glow` | `boolean` | Adds a glow around the widget. |
| `glowColor` | `string` | Color of the glow. |
| `semiCircle` | `'top' \| 'bottom' \| 'left' \| 'right' \| null` | The `semiCircle` value for the widget. |
| `borderRadius` | `number` | Rounds the corners of the widget. |
| `borderColor` | `Color` | Color used for the border. |
| `borderWidth` | `number` | Width of the border. |
| `sliceBorderWidth` | `number` | Border width for the slice. |
| `sliceBorderColor` | `Color` | Border color for the slice. |

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
import { CircularChart } from "flet-box";

const chart = CircularChart({
  data: [
    { value: 60, label: "Direct", color: "#2563eb" },
    { value: 25, label: "Search", color: "#f59e0b" },
    { value: 15, label: "Social", color: "#ef4444" },
  ],
  size: 200,
  strokeWidth: 24,
  showLabels: true,
});
```

### Full

```javascript
import { CircularChart } from "flet-box";

const chart = CircularChart({
  data: [
    { value: 42, label: "Desktop", color: "#2563eb" },
    { value: 33, label: "Mobile", color: "#10b981" },
    { value: 25, label: "Tablet", color: "#f59e0b" },
  ],
  size: 240,
  strokeWidth: 28,
  innerRadius: 70,
  cornerRadius: 6,
  startAngle: -Math.PI / 2,
  animate: true,
  animationDuration: 800,
  showLabels: true,
  labelSize: 13,
  centerContent: "Traffic",
  sliceBorderWidth: 2,
  sliceBorderColor: "#ffffff",
  onHover: (slice, index) => console.log(slice?.label, index),
  onClick: (slice, index) => console.log(slice.label, index),
  onComplete: () => console.log("drawn"),
});
```

## Tips

- Each slice is { value, label, color }; omit color to take colors from defaultColors
- in order.
- Set innerRadius for a donut, or widen strokeWidth relative to size to make a ring.
- semiCircle: "top" renders a half gauge and adjusts the canvas aspect to match.

## Accessibility

- Canvas slices are not read by screen readers; mirror the same data in text or a
- table legend beside the chart.

## Behavior

- centerContent accepts a string or a widget rendered in the donut hole.
- onHover receives (slice | null, index) as the pointer moves between slices, and
- onComplete fires when the entry sweep finishes.

## Related widgets

- [CircularBar](CircularBar.md)
- [Chart](Chart.md)
- [Card](Card.md)

---

## Continue reading

- **Previous:** [Chart](Chart.md)
- **Next:** [Markdown](Markdown.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 6 · Data, rich content & effects** (3 of 13).
