# Rating

A row of star icons that captures or displays a score up to max. It supports half-star selection and an inline numeric readout.

## When to use it

Use it for product reviews, feedback forms, or any quick qualitative score.

## Quick start

```javascript
import { Rating } from "flet-box";

const rating = Rating({
  value: 4,
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `number` | Current value controlled by the widget. |
| `max` | `number` | Maximum value used to compute the ratio. |
| `size` | `number` | Overall size preset or pixel value, depending on the widget. |
| `allowHalf` | `boolean` | Allows half-star ratings. |
| `activeColor` | `Color` | Color used in the active state. |
| `inactiveColor` | `Color` | Color used in the inactive state. |
| `showValue` | `boolean` | Shows the numeric value next to the indicator. |
| `valueColor` | `Color` | Color used for the value. |
| `valueSize` | `number` | Size of the value. |
| `readOnly` | `boolean` | Makes the control read-only. |
| `gap` | `number` | Space between children along the layout axis. |
| `iconActive` | `string` | The `iconActive` value for the widget. |
| `iconInactive` | `string` | The `iconInactive` value for the widget. |
| `iconHalf` | `string` | The `iconHalf` value for the widget. |
| `onChange` | `(value: number) => void` | Fired when the value changes. |

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
import { Rating } from "flet-box";

const rating = Rating({
  value: 4,
  max: 5,
  size: 24,
  activeColor: "#f59e0b",
  onChange: (value) => console.log(value),
});
```

### Full

```javascript
import { Rating } from "flet-box";

const rating = Rating({
  value: 3.5,
  max: 5,
  size: 28,
  allowHalf: true,
  gap: 4,
  activeColor: "#f59e0b",
  inactiveColor: "#d1d5db",
  showValue: true,
  valueColor: "#374151",
  valueSize: 16,
  onChange: (value) => console.log("rated", value),
});
```

## Tips

- Set readOnly: true to display an aggregate score that users cannot change.
- Use allowHalf: true for finer-grained ratings like 3.5 stars.

## Accessibility

- Provide a nearby Text label or showValue so the chosen score is readable, not just stars.

## Behavior

- onChange receives the numeric value each time the user picks a rating.
- readOnly disables onChange while keeping the current value visible.

## Related widgets

- [ProgressBar](ProgressBar.md)
- [Slider](Slider.md)
- [Chip](Chip.md)

---

## Continue reading

- **Previous:** [Dropdown](Dropdown.md)
- **Next:** [Card](Card.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (8 of 8).
