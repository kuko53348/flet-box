# Tooltip

Wraps a child widget and shows a labeled overlay bubble on hover or focus. The bubble is rendered as a portal on document.body so it is never clipped.

## When to use it

Use it to explain icons, buttons, or dense fields that cannot fit a visible label.

## Quick start

```javascript
import { Button, Tooltip, clipboard } from "flet-box";

const tip = Tooltip({
  text: "Copy to clipboard",
  child: Button({ text: "Copy" }),
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `text` | `string` | Visible text content. |
| `child` | `Widget` | A single child widget. Alias: `children` for a list. |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | Side of the child the bubble appears on. |
| `delay` | `number` | Milliseconds the pointer has to stay on the widget before the tooltip appears. |
| `tooltipDelay` | `number` | Deprecated alias of `delay`. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `textColor` | `Color` | Color of the button label. |
| `fontSize` | `number` | Size of the font. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `borderRadius` | `number` | Rounds the corners of the widget. |
| `offset` | `number` | The `offset` value for the widget. |
| `showArrow` | `boolean` | Controls whether the arrow is shown. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `maxWidth` | `number` | Maximum width the widget may grow to. |
| `textAlign` | `'left' \| 'center' \| 'right'` | The `textAlign` value for the widget. |
| `zIndex` | `number` | Stacking order: a widget with a higher value paints above lower ones. |
| `animationDuration` | `number` | Duration for the animation, in milliseconds. |
| `arrowSize` | `number` | Size of the arrow. |
| `borderColor` | `Color` | Color used for the border. |
| `borderWidth` | `number` | Width of the border. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |

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
| `position` | `'static' \| 'relative' \| 'absolute' \| 'fixed' \| 'sticky' \| 'stack'` | Side of the child the bubble appears on. |
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
import { Icon, Tooltip } from "flet-box";

const tip = Tooltip({
  text: "Adds the item to your cart",
  position: "bottom",
  delay: 150,
  child: Icon({ name: "shopping_cart" }),
});
```

### Full

```javascript
import { Button, Tooltip, rgba } from "flet-box";

const tip = Tooltip({
  text: "Only visible to workspace admins",
  child: Button({ text: "Share", variant: "outlined" }),
  position: "right",
  delay: 300,
  offset: 12,
  maxWidth: 240,
  bgColor: "#111827",
  textColor: "#f9fafb",
  showArrow: true,
  textAlign: "left",
  borderRadius: 8,
  shadow: "0 4px 12px rgba(0,0,0,0.25)",
  animationDuration: 180,
});
```

## Tips

- Attach it to any widget via child; the tooltip is a separate portal, so overflow hidden ancestors do not cut it off.
- delay controls how long the pointer must rest before the tooltip appears; lower it for dense toolbars, raise it for error-prone hints.
- The bubble keeps to the device's safe area, so a placement is a request: an edge with no room for it gets the opposite edge instead.

## Accessibility

- The wrapped child keeps its focus handlers, so keyboard users tabbing onto it get the same tooltip as mouse hover.
- On a device that cannot hover the bubble stays hidden. iOS answers the first tap with a synthetic mouseenter and never sends the matching mouseleave, so a tap-shown tooltip is a bubble nothing can dismiss. Anything a tooltip explains has to be explained by the control's own label too.

## Behavior

- The tooltip hides itself on window scroll or resize and removes its body portal plus listeners on unmount.
- The wrapped child gains showTooltip, hideTooltip, updateContent, and updatePosition helpers for imperative control.
- A pointer that leaves before the wait is over never shows the bubble: leaving clears the timer.
- tooltipDelay is the old name of delay and is deprecated: write delay. When both are given, delay wins.
- The requested position is a preference, not a promise: when the bubble would not fit between the trigger and the safe-area edge it is placed on the opposite side, and the arrow follows it.

## Related widgets

- [Button](Button.md)
- [Icon](Icon.md)
- [Text](Text.md)

---

## Continue reading

- **Previous:** [SnackBar](SnackBar.md)
- **Next:** [ProgressBar](ProgressBar.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (5 of 10).
