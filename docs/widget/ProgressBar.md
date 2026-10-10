# ProgressBar

A horizontal bar that visualizes completion from zero to max. It can show a label and numeric value, or run as an indeterminate loader.

## When to use it

Use it to report progress such as uploads, multi-step flows, or budget usage.

## Quick start

```javascript
import { ProgressBar } from "flet-box";

const progress = ProgressBar({
  value: 60,
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `number` | Current value controlled by the widget. |
| `max` | `number` | Maximum value used to compute the ratio. |
| `height` | `number` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `width` | `number \| string` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `backgroundColor` | `Color` | Background color. Alias of `bgColor`. |
| `borderRadius` | `number` | Rounds the corners of the widget. |
| `label` | `string` | Label or caption shown near the control. |
| `showValue` | `boolean` | Shows the numeric value next to the indicator. |
| `valuePosition` | `'left' \| 'right' \| 'top' \| 'bottom'` | Where the value label is placed. |
| `indeterminate` | `boolean` | Shows an unknown-progress animation. |
| `striped` | `boolean` | Draws diagonal stripes across the bar. |
| `animatedStripes` | `boolean` | Animates the stripes on the bar. |

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
import { ProgressBar } from "flet-box";

const progress = ProgressBar({
  value: 60,
  max: 100,
  height: 8,
  color: "#2563eb",
  backgroundColor: "#e2e8f0",
});
```

### Full

```javascript
import { ProgressBar } from "flet-box";

const progress = ProgressBar({
  value: 72,
  max: 100,
  width: "100%",
  height: 12,
  color: "#16a34a",
  backgroundColor: "#e5e7eb",
  borderRadius: 6,
  label: "Upload",
  showValue: true,
  valuePosition: "right",
  striped: true,
  animatedStripes: true,
});
```

## Tips

- Set indeterminate: true when the duration is unknown and no numeric value applies.
- Combine showValue with valuePosition to place the percentage beside the bar.

## Accessibility

- Include label so the bar is announced with context, not just as a length.

## Behavior

- value is clamped against max, so 120 with max 100 renders as full.
- striped and animatedStripes add motion cues without changing the value.

## Related widgets

- [CircularBar](CircularBar.md)
- [Skeleton](Skeleton.md)
- [Rating](Rating.md)

---

## Continue reading

- **Previous:** [Tooltip](Tooltip.md)
- **Next:** [CircularBar](CircularBar.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (6 of 10).
