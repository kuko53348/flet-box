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

- Each slice is { value, label, color }; omit color to take colors from defaultColors in order.
- Set innerRadius for a donut, or widen strokeWidth relative to size to make a ring.
- semiCircle: "top" renders a half gauge and adjusts the canvas aspect to match.

## Accessibility

- Canvas slices are not read by screen readers; mirror the same data in text or a table legend beside the chart.

## Behavior

- centerContent accepts a string or a widget rendered in the donut hole.
- The hole is the page showing through, not a filled disc, so a donut reads as a ring on any surface.
- onHover receives (slice | null, index) as the pointer moves between slices, and onComplete fires when the entry sweep finishes.

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
