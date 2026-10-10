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
- valueFormat accepts "percent", "value", or "custom"; customValueFormatter
- overrides how the number is rendered entirely.
- When valueFormat is "value", use valuePrefix and valueSuffix to render units like
- "$" or "%".

## Accessibility

- Canvas contents are invisible to assistive technology, so add a label or subtitle
- next to the bar to give the number context.

## Behavior

- With animate: true the sweep animates from zero and onComplete fires once it reaches
- the target value.
- Clicking the bar passes { value, max, percent } to onClick; hovering toggles the
- onHover boolean.
- When size is unset the canvas re-measures its container via ResizeObserver and
- releases the observer on unmount.

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
