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
| `full` | `boolean` | Stretches the widget to fill its parent on both axes in stack mode. |
| `fullHeight` | `boolean` | Stretches the widget to the full height of its parent in stack mode. |
| `fullWidth` | `boolean` | Stretches the widget to the full width of its parent. |
| `center` | `boolean` | Centres the widget on both axes in stack mode. |
| `centerY` | `boolean` | Centres the widget vertically in stack mode. |
| `centerX` | `boolean` | Centres the widget horizontally in stack mode. |
| `zIndex` | `number` | Stacking order: a widget with a higher value paints above lower ones. |
| `z` | `number` | Alias of `zIndex`. |
| `end` | `Size` | Logical alias of `right`, used by the stack placement shorthands. |
| `start` | `Size` | Logical alias of `left`, used by the stack placement shorthands. |
| `inset` | `Size` | Shorthand for the four edge offsets (`top`/`right`/`bottom`/`left`). |
| `left` | `Size` | Offset from the left edge. A number is pixels; a string uses any CSS unit. |
| `bottom` | `Size` | Offset from the bottom edge. A number is pixels; a string uses any CSS unit. |
| `right` | `Size` | Offset from the right edge. A number is pixels; a string uses any CSS unit. |
| `top` | `Size` | Offset from the top edge. A number is pixels; a string uses any CSS unit. |
| `pos` | `'static' \| 'relative' \| 'absolute' \| 'fixed' \| 'sticky' \| 'stack'` | Alias of `position`. |
| `position` | `'static' \| 'relative' \| 'absolute' \| 'fixed' \| 'sticky' \| 'stack'` | CSS `position` value, or `stack` for centered stacking. |
| `width` | `Size` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `Size` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `size` | `Size` | Overall size preset or pixel value, depending on the widget. |
| `flex` | `number` | Flex grow/shrink/basis shorthand for a flex child. |
| `minWidth` | `Size` | Minimum width the widget may shrink to. |
| `maxWidth` | `Size` | Maximum width the widget may grow to. |
| `minHeight` | `Size` | Minimum height the widget may shrink to. |
| `maxHeight` | `Size` | Maximum height the widget may grow to. |
| `border` | `string` | CSS `border` shorthand for all four edges: width, style and color in one string. |
| `borderTop` | `string` | The top edge of the border alone, for a widget whose rim differs per side. |
| `borderBottom` | `string` | The bottom edge of the border alone, for a widget whose rim differs per side. |
| `borderLeft` | `string` | The left edge of the border alone, for a widget whose rim differs per side. |
| `borderRight` | `string` | The right edge of the border alone, for a widget whose rim differs per side. |
| `cursor` | `string` | CSS `cursor` value: what the pointer becomes over the widget (`pointer`, `grab`, `not-allowed`). |
| `display` | `string` | CSS `display` value for the container. |
| `boxSizing` | `'border-box' \| 'content-box'` | Which box `width` and `height` measure: `border-box` keeps the size you asked for and pushes padding inward. |
| `flexDirection` | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'` | Main axis of a flex container: `row` places children side by side, `column` stacks them. |
| `flexGrow` | `number` | Share of the leftover space this child takes, relative to its siblings. |
| `flexShrink` | `number` | How readily the child gives space back when the row overflows; `0` keeps its size. |
| `gap` | `number \| string` | Space between children along the layout axis. |
| `fontSize` | `number` | Size of the font. |
| `borderColor` | `Color` | Color used for the border. |
| `borderWidth` | `number` | Width of the border. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `paddingTop` | `Size` | Space inside the widget, on the top edge only. |
| `paddingRight` | `Size` | Space inside the widget, on the right edge only. |
| `paddingBottom` | `Size` | Space inside the widget, on the bottom edge only. |
| `paddingLeft` | `Size` | Space inside the widget, on the left edge only. |
| `pt` | `Size` | Alias of `paddingTop`. |
| `pr` | `Size` | Alias of `paddingRight`. |
| `pb` | `Size` | Alias of `paddingBottom`. |
| `pl` | `Size` | Alias of `paddingLeft`. |
| `margin` | `Margin` | Space outside the widget, between it and its neighbors. |
| `marginTop` | `Size` | Space outside the widget, on the top edge only. |
| `marginRight` | `Size` | Space outside the widget, on the right edge only. |
| `marginBottom` | `Size` | Space outside the widget, on the bottom edge only. |
| `marginLeft` | `Size` | Space outside the widget, on the left edge only. |
| `mt` | `Size` | Alias of `marginTop`. |
| `mr` | `Size` | Alias of `marginRight`. |
| `mb` | `Size` | Alias of `marginBottom`. |
| `ml` | `Size` | Alias of `marginLeft`. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `backgroundColor` | `Color` | Background color. Alias of `bgColor`. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |
| `filter` | `string` | Raw CSS `filter` value applied to the widget itself, e.g. `blur(4px)`. |
| `backdropFilter` | `string` | Raw CSS `backdrop-filter` value: what sits behind the widget is blurred through it, which is what makes a translucent card frosted glass. |
| `maskImage` | `string` | Raw CSS `mask-image` value, used to fade a widget out at its edges instead of cutting it. |
| `bgImage` | `string` | Image painted behind the widget's content (CSS `background-image`), placed with `bgSize` and `bgPosition`. |
| `bgSize` | `string` | How the background image fills its box (`cover`, `contain`, or a length). |
| `bgPosition` | `string` | Where the background image is anchored (`center`, `top`, `50% 20%`). |
| `bgRepeat` | `string` | Whether the background image tiles; `no-repeat` for a single cover. |
| `opacity` | `number` | Opacity from 0 (invisible) to 1 (fully opaque). |
| `visible` | `boolean` | Whether the widget is rendered and visible. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `onPress` | `(event?: Event) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |
| `onClick` | `(event?: Event) => void` | Callback fired when the widget is clicked. Alias: `onPress`. |
| `onclick` | `(event?: Event) => void` | Lowercase alias of `onClick`, kept because the shipped templates and the HTML habit write it. |
| `alignSelf` | `AlignSelf` | Overrides the parent's `alignItems` for this child alone (CSS `align-self`). Alias: `selfAlign`. |
| `selfAlign` | `AlignSelf` | Alias of `alignSelf`. |
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
- Grid lines and their labels sit on one round step (1, 2 or 5 times a power of ten), so the numbers agree with the lines they name.
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
