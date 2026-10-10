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

You are reading **Chapter 2 · Interaction basics** (1 of 8).
