# Slider

A draggable range input that selects a numeric value along a track between min and max.

## When to use it

Use Slider when a value benefits from direct manipulation, such as volume, price or opacity.

## Quick start

```javascript
import { Slider } from "flet-box";

const volume = Slider({
  value: 40,
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `number` | Current value controlled by the widget. |
| `min` | `number` | Minimum allowed value. |
| `max` | `number` | Maximum value used to compute the ratio. |
| `step` | `number` | Increment between allowed slider values. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `width` | `number \| string` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `number` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `thumbSize` | `number` | Size of the slider thumb. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `trackColor` | `Color` | Color of the slider track. |
| `orientation` | `'horizontal' \| 'vertical'` | Orientation of the widget or control. |
| `inverted` | `boolean` | Reverses the direction of the control. |
| `showValue` | `boolean` | Shows the numeric value next to the indicator. |
| `valuePrefix` | `string` | Text prepended before the displayed value. |
| `valueSuffix` | `string` | Text appended after the displayed value. |
| `showMarks` | `boolean` | Controls whether the marks is shown. |
| `marks` | `Array<{ value: number; label?: string; color?: Color; size?: number }>` | The `marks` value for the widget. |
| `striped` | `boolean` | Draws diagonal stripes across the bar. |
| `animatedStripes` | `boolean` | Animates the stripes on the bar. |
| `stripeColor` | `string` | Color used for the stripe. |
| `glow` | `boolean` | Adds a glow around the widget. |
| `onChanged` | `(value: number) => void` | Event handler for the `onChanged` event. |
| `onChangeEnd` | `(value: number) => void` | Event handler for the `onChangeEnd` event. |

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
import { Slider } from "flet-box";

const volume = Slider({
  value: 60,
  min: 0,
  max: 100,
  step: 5,
  onChanged: (value) => console.log("volume:", value),
});
```

### Full

```javascript
import { Slider } from "flet-box";

const price = Slider({
  value: 250,
  min: 0,
  max: 1000,
  step: 50,
  color: "#2563eb",
  trackColor: "#e2e8f0",
  thumbSize: 24,
  showValue: true,
  valuePrefix: "$",
  showMarks: true,
  marks: [
    { value: 0, label: "$0" },
    { value: 500, label: "$500" },
    { value: 1000, label: "$1000" },
  ],
  onChanged: (value) => console.log("price:", value),
  onChangeEnd: (value) => console.log("final:", value),
});
```

## Tips

- onChanged fires continuously while dragging; use onChangeEnd for the value to commit, such as a filter request.
- Set step to snap to meaningful increments instead of every integer.

## Accessibility

- A slider needs a visible label or value text; showValue displays the current value so it is not conveyed by thumb position alone.

## Behavior

- Dragging the track or thumb updates the value and fires onChanged; releasing fires onChangeEnd once.
- The returned element exposes value, min, max, step, setValue() and getValue(), and disconnects its ResizeObserver on unmount.

## Related widgets

- [Rating](Rating.md)
- [ProgressBar](ProgressBar.md)
- [Input](Input.md)

---

## Continue reading

- **Previous:** [Switch](Switch.md)
- **Next:** [Dropdown](Dropdown.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (6 of 8).
