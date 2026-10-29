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
| `thumbColor` | `Color` | Color used for the thumb. |
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
| `onPress` | `(value: number) => void` | Called with the new value while the thumb moves. |
| `onChanged` | `(value: number) => void` | Deprecated alias of `onPress`. |
| `onChangeEnd` | `(value: number) => void` | Event handler for the `onChangeEnd` event. |

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
| `onPress` | `(event?: Event) => void` | Called with the new value while the thumb moves. |
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
import { Slider } from "flet-box";

const volume = Slider({
  value: 60,
  min: 0,
  max: 100,
  step: 5,
  onPress: (value) => console.log("volume:", value),
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
  onPress: (value) => console.log("price:", value),
  onChangeEnd: (value) => console.log("final:", value),
});
```

## Tips

- onPress fires continuously while dragging; use onChangeEnd for the value to commit, such as a filter request.
- Set step to snap to meaningful increments instead of every integer.
- On a vertical slider, width is the rail's length and height its thickness.

## Accessibility

- A slider needs a visible label or value text; showValue displays the current value so it is not conveyed by thumb position alone.

## Behavior

- Dragging the track or thumb updates the value and fires onPress; releasing fires onChangeEnd once.
- The returned element exposes value, min, max, step, setValue() and getValue(), and disconnects its ResizeObserver on unmount.
- During a drag the fill follows the pointer with no easing; the 0.1s ease belongs to a value that changes by itself, from a key press or setValue().

## Related widgets

- [Rating](Rating.md)
- [ProgressBar](ProgressBar.md)
- [Input](Input.md)

---

## Continue reading

- **Previous:** [Switch](Switch.md)
- **Next:** [Dropdown](Dropdown.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (6 of 9).
