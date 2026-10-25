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
| `border` | `string` | The `border` value for the widget. |
| `borderTop` | `string` | The `borderTop` value for the widget. |
| `borderBottom` | `string` | The `borderBottom` value for the widget. |
| `borderLeft` | `string` | The `borderLeft` value for the widget. |
| `borderRight` | `string` | The `borderRight` value for the widget. |
| `cursor` | `string` | The `cursor` value for the widget. |
| `display` | `string` | CSS `display` value for the container. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `margin` | `Margin` | Space outside the widget, between it and its neighbors. |
| `marginTop` | `Size` | The `marginTop` value for the widget. |
| `marginRight` | `Size` | The `marginRight` value for the widget. |
| `marginBottom` | `Size` | The `marginBottom` value for the widget. |
| `marginLeft` | `Size` | The `marginLeft` value for the widget. |
| `mt` | `Size` | The `mt` value for the widget. |
| `mr` | `Size` | The `mr` value for the widget. |
| `mb` | `Size` | The `mb` value for the widget. |
| `ml` | `Size` | The `ml` value for the widget. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `backgroundColor` | `Color` | Background color. Alias of `bgColor`. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |
| `filter` | `string` | Raw CSS `filter` value applied to the widget itself, e.g. `blur(4px)`. |
| `backdropFilter` | `string` | Raw CSS `backdrop-filter` value: what sits behind the widget is blurred through it, which is what makes a translucent card frosted glass. |
| `maskImage` | `string` | Raw CSS `mask-image` value, used to fade a widget out at its edges instead of cutting it. |
| `opacity` | `number` | Opacity from 0 (invisible) to 1 (fully opaque). |
| `visible` | `boolean` | Whether the widget is rendered and visible. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `onPress` | `(widget: Widget) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |
| `onClick` | `(widget: Widget) => void` | Callback fired when the widget is clicked. Alias: `onPress`. |
| `onclick` | `(widget: Widget) => void` | The `onclick` value for the widget. |
| `alignSelf` | `AlignSelf` | Overrides the parent's `alignItems` for this child alone (CSS `align-self`). Alias: `selfAlign`. |
| `selfAlign` | `AlignSelf` | Alias of `alignSelf`. |
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
- An unfilled star uses the palette's control grey and a filled one its readable
- amber, so both states clear 3:1 against the surface they sit on.

## Related widgets

- [ProgressBar](ProgressBar.md)
- [Slider](Slider.md)
- [Chip](Chip.md)

---

## Continue reading

- **Previous:** [Dropdown](Dropdown.md)
- **Next:** [ThemePicker](ThemePicker.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (8 of 9).
