# Chip

A compact, pill-shaped label for tags, filters, and selections. It can carry a leading icon and a delete affordance.

## When to use it

Use it to represent selected filters, categories, or removable tokens.

## Quick start

```javascript
import { Chip } from "flet-box";

const tag = Chip({
  label: "Design",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `label` | `string` | Label or caption shown near the control. |
| `icon` | `string` | Name of the icon to render. |
| `onPress` | `() => void` | Callback fired when the widget is pressed. Alias: `onClick`. |
| `onDelete` | `() => void` | Event handler for the `onDelete` event. |
| `variant` | `'filled' \| 'outlined'` | Visual variation or style preset. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `textColor` | `Color` | Color of the button label. |
| `borderColor` | `Color` | Color used for the border. |
| `size` | `'small' \| 'medium' \| 'large'` | Overall size preset or pixel value, depending on the widget. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `gap` | `number` | Space between children along the layout axis. |

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
import { Chip, filter } from "flet-box";

const tag = Chip({
  label: "Design",
  icon: "palette",
  onPress: () => console.log("filter by design"),
});
```

### Full

```javascript
import { Chip, filter } from "flet-box";

const tag = Chip({
  label: "Design",
  icon: "palette",
  variant: "outlined",
  size: "small",
  color: "#eff6ff",
  textColor: "#1d4ed8",
  borderColor: "#bfdbfe",
  borderRadius: 999,
  gap: 6,
  onPress: () => console.log("filter by design"),
  onDelete: () => console.log("removed"),
});
```

## Tips

- Use variant: "outlined" for unselected filters and a filled color once active.
- Add onDelete only when the chip represents a removable value.

## Accessibility

- The label text is the accessible name, so keep it a single clear word or short phrase.

## Behavior

- onPress fires from the chip body; onDelete fires from the trailing close control.
- A chip with onPress but no onDelete behaves like a small toggle button.

## Related widgets

- [Badge](Badge.md)
- [Avatar](Avatar.md)
- [Button](Button.md)

---

## Continue reading

- **Previous:** [Badge](Badge.md)
- **Next:** [AlertDialog](AlertDialog.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 3 · Layout, cards and lists** (8 of 8).
