# CircularBar

A circular or radial progress indicator drawn on canvas. It can show a percentage or raw value, an optional label, gradients, glow, and markers.

## When to use it

Use it for scan-style progress, scores, budgets, or any gauge that benefits from a ring layout instead of a horizontal bar.

## Quick start

```javascript
import { CircularBar } from "flet-box";

const progress = CircularBar({
  value: 72,
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `number` | Current value controlled by the widget. |
| `max` | `number` | Maximum value used to compute the ratio. |
| `size` | `number` | Overall size preset or pixel value, depending on the widget. |
| `strokeWidth` | `number` | Thickness of the circular stroke. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `backgroundColor` | `Color` | Background color. Alias of `bgColor`. |
| `showValue` | `boolean` | Shows the numeric value next to the indicator. |
| `valueColor` | `Color` | Color used for the value. |
| `valueSize` | `number` | Size of the value. |
| `label` | `string` | Label or caption shown near the control. |
| `labelColor` | `Color` | Color used for the label. |
| `labelSize` | `number` | Size of the label. |
| `lineCap` | `'butt' \| 'round' \| 'square'` | Shape of the ends of the progress stroke. |
| `animate` | `boolean` | The `animate` value for the widget. |
| `animationDuration` | `number` | Duration for the animation, in milliseconds. |
| `onComplete` | `() => void` | Event handler for the `onComplete` event. |
| `ref` | `(canvas: HTMLCanvasElement) => void` | Callback that receives the underlying DOM node. |
| `valueFormat` | `'percent' \| 'value' \| 'custom'` | Formats the displayed value. |
| `valueSuffix` | `string` | Text appended after the displayed value. |
| `valuePrefix` | `string` | Text prepended before the displayed value. |
| `valueDecimals` | `number` | Number of decimals in the displayed value. |
| `customValueFormatter` | `(value: number, max: number) => string` | Function that returns the formatted value string. |
| `gradient` | `string \| string[]` | CSS gradient used as the fill. |
| `gradientAngle` | `number` | The `gradientAngle` value for the widget. |
| `shadowBlur` | `number` | The `shadowBlur` value for the widget. |
| `shadowColor` | `string` | Color used for the shadow. |
| `glow` | `boolean` | Adds a glow around the widget. |
| `glowColor` | `string` | Color of the glow. |
| `markers` | `Array<{ value: number; color?: Color; size?: number; label?: string }>` | Marker ticks drawn along the progress arc. |
| `innerStrokeWidth` | `number` | Width of the inner stroke. |
| `innerColor` | `Color` | Color used for the inner. |
| `onClick` | `(data: { value: number; max: number; percent: number }) => void` | Callback fired when the widget is clicked. Alias: `onPress`. |
| `onHover` | `(hovering: boolean, data: { value: number; max: number }) => void` | Event handler for the `onHover` event. |
| `subtitle` | `string` | The `subtitle` value for the widget. |
| `subtitleColor` | `Color` | Color used for the subtitle. |
| `subtitleSize` | `number` | Size of the subtitle. |
| `tooltip` | `string` | The `tooltip` value for the widget. |

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
import { CircularBar } from "flet-box";

const progress = CircularBar({
  value: 72,
  max: 100,
  size: 160,
  color: "#2563eb",
  backgroundColor: "#e5e7eb",
  showValue: true,
});
```

### Full

```javascript
import { CircularBar } from "flet-box";

const progress = CircularBar({
  value: 820,
  max: 1000,
  size: 200,
  strokeWidth: 16,
  color: "#10b981",
  backgroundColor: "#e5e7eb",
  valueFormat: "value",
  valuePrefix: "$",
  valueDecimals: 0,
  label: "Revenue",
  subtitle: "this month",
  lineCap: "round",
  animate: true,
  animationDuration: 900,
  gradient: ["#34d399", "#059669"],
  onComplete: () => console.log("done"),
  onClick: (data) => console.log(data.percent),
});
```

## Tips

- Leave size unset to fill the parent width, or set size for a fixed square canvas.
- valueFormat accepts "percent", "value", or "custom"; customValueFormatter overrides how the number is rendered entirely.
- When valueFormat is "value", use valuePrefix and valueSuffix to render units like "$" or "%".

## Accessibility

- Canvas contents are invisible to assistive technology, so add a label or subtitle next to the bar to give the number context.

## Behavior

- With animate: true the sweep animates from zero and onComplete fires once it reaches the target value.
- Clicking the bar passes { value, max, percent } to onClick; hovering toggles the onHover boolean.
- When size is unset the canvas re-measures its container via ResizeObserver and releases the observer on unmount.

## Related widgets

- [CircularChart](CircularChart.md)
- [ProgressBar](ProgressBar.md)
- [Rating](Rating.md)

---

## Continue reading

- **Previous:** [ProgressBar](ProgressBar.md)
- **Next:** [Skeleton](Skeleton.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (7 of 10).
