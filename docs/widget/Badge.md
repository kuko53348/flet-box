# Badge

Wraps a child widget and overlays a small count or status marker at one of its corners. Commonly used for notification counts.

## When to use it

Use it to signal unseen items or status on an icon, avatar, or button.

## Quick start

```javascript
import { Badge, Icon } from "flet-box";

const badge = Badge({
  value: 5,
  child: Icon({ name: "notifications" }),
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `string \| number` | Current value controlled by the widget. |
| `child` | `Widget` | A single child widget. Alias: `children` for a list. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `size` | `number` | Overall size preset or pixel value, depending on the widget. |
| `position` | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | CSS `position` value, or `stack` for centered stacking. |
| `offset` | `number` | The `offset` value for the widget. |
| `borderWidth` | `number` | Width of the border. |
| `borderColor` | `Color` | Color used for the border. |
| `showZero` | `boolean` | Controls whether the zero is shown. |
| `max` | `number` | Maximum value used to compute the ratio. |

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
import { Badge, Icon } from "flet-box";

const inbox = Badge({
  value: 12,
  max: 99,
  bgColor: "#dc2626",
  color: "#ffffff",
  child: Icon({ name: "mail" }),
});
```

### Full

```javascript
import { Badge, Icon } from "flet-box";

const inbox = Badge({
  value: 120,
  max: 99,
  bgColor: "#dc2626",
  color: "#ffffff",
  size: 18,
  position: "top-right",
  offset: 4,
  borderWidth: 2,
  borderColor: "#ffffff",
  showZero: false,
  child: Icon({ name: "mail", size: 28 }),
});
```

## Tips

- Set max so large counts collapse to "99+" style displays.
- Use position and offset to place the marker precisely on irregular shapes.

## Accessibility

- The badge value is visual only; add a Text or title nearby to convey the count.

## Behavior

- showZero: false hides the marker entirely when value is 0.
- A borderWidth with a matching borderColor creates a clean cutout against the child.

## Related widgets

- [Avatar](Avatar.md)
- [Icon](Icon.md)
- [Chip](Chip.md)

---

## Continue reading

- **Previous:** [Avatar](Avatar.md)
- **Next:** [Chip](Chip.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 3 · Layout, cards and lists** (7 of 8).
