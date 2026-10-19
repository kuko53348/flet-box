# Icon

Material icon glyph rendered as a span. `name` is required and maps to a Material Icons ligature.

## When to use it

Use Icon for compact actions, status indicators, and decoration next to a label.

## Quick start

```javascript
import { Icon } from "flet-box";

const settings = Icon({
  name: "settings",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `name` | `string` | The `name` value for the widget. |
| `size` | `number` | Overall size preset or pixel value, depending on the widget. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `onPress` | `(widget: Widget) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |

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
import { Icon } from "flet-box";

const settings = Icon({
  name: "settings",
  size: 28,
  color: "#111827",
});
```

### Full

```javascript
import { Icon } from "flet-box";

const action = Icon({
  name: "notifications",
  size: 24,
  color: "#2563eb",
  bgColor: "#eff6ff",
  padding: 8,
  borderRadius: 999,
  className: "icon-button",
  onPress: () => console.log("notifications"),
});
```

## Tips

- `size` defaults to 24 and `color` falls back to the theme's secondary text color.
- Pass a Material Icons name such as `"settings"` or `"chevron_right"`.
- Pair an icon with a visible label when it carries meaning, because the glyph alone is not descriptive.

## Accessibility

- Do not rely on the glyph to convey meaning on its own; add an adjacent text label for important actions.

## Behavior

- The icon renders as an inline-flex span using the Material Icons class, and it is non-selectable by default.
- Supplying `onPress` makes the icon interactive; `size` accepts a number of pixels or a CSS size string.

## Related widgets

- [Button](Button.md)
- [Text](Text.md)
- [Row](Row.md)
- [ListTile](ListTile.md)

---

## Continue reading

- **Previous:** [Stack](Stack.md)
- **Next:** [Image](Image.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 1 · First steps: the core mental model** (6 of 7).
