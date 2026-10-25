# Button

Interactive button with filled, outlined, and text variants, size presets, optional icons, and press feedback.

## When to use it

Use Button for actions such as submit, save, confirm, or any primary and secondary command.

## Quick start

```javascript
import { Button } from "flet-box";

const save = Button({
  text: "Save",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `text` | `string` | Visible text content. |
| `onPress` | `() => void` | Callback fired when the widget is pressed. Alias: `onClick`. |
| `variant` | `'filled' \| 'outlined' \| 'text'` | Visual variation or style preset. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `gradient` | `string` | CSS gradient used as the fill. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `textColor` | `Color` | Color of the button label. |
| `size` | `'small' \| 'medium' \| 'large'` | Overall size preset or pixel value, depending on the widget. |
| `fullWidth` | `boolean` | Stretches the widget to the full width of its parent. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `icon` | `string` | Name of the icon to render. |
| `iconLeft` | `string` | Icon shown to the left of the label. |
| `iconRight` | `string` | Icon shown to the right of the label. |
| `iconTop` | `string` | Icon shown above the label. |
| `iconBottom` | `string` | Icon shown below the label. |
| `iconPosition` | `'left' \| 'right' \| 'top' \| 'bottom'` | Where the icon sits relative to the label. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `margin` | `Margin` | Space outside the widget, between it and its neighbors. |

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
import { Button } from "flet-box";

const save = Button({
  text: "Save",
  bgColor: "#2563eb",
  color: "#ffffff",
  borderRadius: 8,
  onPress: () => console.log("saved"),
});
```

### Full

```javascript
import { Button } from "flet-box";

const checkout = Button({
  text: "Checkout",
  variant: "filled",
  size: "large",
  gradient: "linear-gradient(90deg, #2563eb, #7c3aed)",
  color: "#ffffff",
  icon: "shopping_cart",
  iconPosition: "right",
  borderRadius: 28,
  elevation: 3,
  fullWidth: true,
  onPress: () => console.log("checkout"),
});
```

## Tips

- `variant` defaults to `"filled"`; switch to `"outlined"` or `"text"` for secondary actions.
- Place icons with `icon` and `iconPosition`, or use the explicit `iconLeft`, `iconRight`, `iconTop`, `iconBottom` props.
- Setting `disabled` also drops the click handler, not just the styling.

## Accessibility

- Always pass `text` so the button has an accessible name, and use `disabled` rather than only dimming colors.

## Behavior

- Size presets control padding, font size, and icon size; `fullWidth` stretches the button to 100%.
- `onPress` receives no arguments and is wired to the native click; `elevation` picks a shadow level.

## Related widgets

- [Icon](Icon.md)
- [Row](Row.md)
- [Column](Column.md)
- [FloatingActionButton](FloatingActionButton.md)

---

## Continue reading

- **Previous:** [Image](Image.md)
- **Next:** [Input](Input.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (1 of 9).
