# Divider

A thin horizontal or vertical line that separates sections of content. Its thickness, color, and spacing are all adjustable.

## When to use it

Use it to break up lists, forms, or toolbars where whitespace alone is not enough.

## Quick start

```javascript
import { Divider } from "flet-box";

const divider = Divider({});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `thickness` | `number` | The `thickness` value for the widget. |
| `margin` | `number \| { top?: number; right?: number; bottom?: number; left?: number }` | Space outside the widget, between it and its neighbors. |
| `orientation` | `'horizontal' \| 'vertical'` | Orientation of the widget or control. |

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
import { Divider } from "flet-box";

const divider = Divider({
  thickness: 1,
  color: "#e5e7eb",
  margin: 16,
});
```

### Full

```javascript
import { Divider } from "flet-box";

const divider = Divider({
  orientation: "vertical",
  thickness: 2,
  color: "#cbd5e1",
  margin: { top: 8, bottom: 8, left: 12, right: 12 },
});
```

## Tips

- Use orientation: "vertical" inside Row layouts and horizontal elsewhere.
- margin accepts a number or an object with per-side values for fine spacing control.

## Accessibility

- Dividers are purely decorative and are hidden from assistive technology.

## Behavior

- Horizontal dividers stretch to the available width; vertical ones need a parent height.
- thickness sets the line weight and defaults to a hairline.

## Related widgets

- [ListTile](ListTile.md)
- [Card](Card.md)
- [Container](Container.md)

---

## Continue reading

- **Previous:** [Card](Card.md)
- **Next:** [ListTile](ListTile.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 3 · Layout, cards and lists** (2 of 8).
