# Avatar

A compact identity chip that shows a profile image, the person's initials, or a fallback icon. It falls back gracefully when no image is available.

## When to use it

Reach for it in headers, comments, list rows, and any place a user needs a face.

## Quick start

```javascript
import { Avatar } from "flet-box";

const user = Avatar({
  name: "Ada Lovelace",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `src` | `string` | Resource URL for the image, audio, or video. |
| `name` | `string` | The `name` value for the widget. |
| `icon` | `string` | Name of the icon to render. |
| `size` | `number` | Overall size preset or pixel value, depending on the widget. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `textColor` | `Color` | Color of the button label. |
| `shape` | `'circle' \| 'rounded' \| 'square'` | The `shape` value for the widget. |
| `onPress` | `(widget: Widget) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |

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
import { Avatar } from "flet-box";

const user = Avatar({
  src: "/avatars/ada.png",
  name: "Ada Lovelace",
  size: 48,
  shape: "circle",
});
```

### Full

```javascript
import { Avatar } from "flet-box";

const user = Avatar({
  src: "/avatars/ada.png",
  name: "Ada Lovelace",
  size: 64,
  shape: "rounded",
  bgColor: "#2563eb",
  textColor: "#ffffff",
  onPress: () => console.log("open profile"),
});
```

## Tips

- Provide both src and name so initials render if the image fails.
- Use shape: "circle" for people and shape: "rounded" for organizations or bots.

## Accessibility

- The name prop is announced as the label, so always give a meaningful name.

## Behavior

- When src is missing or errors, the widget automatically shows initials from name.
- onPress makes the whole avatar interactive, which is useful for opening profiles.

## Related widgets

- [Image](Image.md)
- [ListTile](ListTile.md)
- [Card](Card.md)

---

## Continue reading

- **Previous:** [GridView](GridView.md)
- **Next:** [Badge](Badge.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 3 · Layout, cards and lists** (6 of 8).
