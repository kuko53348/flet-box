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
| `zIndex` | `number` | Index used for the z. |
| `animationDuration` | `number` | Duration for the animation, in milliseconds. |
| `arrowSize` | `number` | Size of the arrow. |
| `borderColor` | `Color` | Color used for the border. |
| `borderWidth` | `number` | Width of the border. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |

### Common props

Every widget also accepts these shared props — see [common props](COMMON_PROPS.md) for the full rules and aliases.

| Prop | Type | Description |
| --- | --- | --- |
| `width` | `Size` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `Size` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `size` | `Size` | Overall size preset or pixel value, depending on the widget. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `margin` | `Margin` | Space outside the widget, between it and its neighbors. |
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
