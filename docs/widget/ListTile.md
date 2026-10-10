# ListTile

A single row with leading, title, subtitle, and trailing slots. It is the standard building block for settings, contacts, and menus.

## When to use it

Use it for any list row that needs an icon or avatar plus primary and secondary text.

## Quick start

```javascript
import { ListTile } from "flet-box";

const tile = ListTile({
  title: "Settings",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `leftItem` | `Widget` | The `leftItem` value for the widget. |
| `title` | `string \| Widget` | Title text shown in the header. |
| `subtitle` | `string \| Widget` | The `subtitle` value for the widget. |
| `description` | `string \| Widget` | The `description` value for the widget. |
| `rightItem` | `Widget` | The `rightItem` value for the widget. |
| `onPress` | `(widget: Widget) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |
| `selected` | `boolean` | Current selected state. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `divider` | `boolean` | The `divider` value for the widget. |
| `paddingHorizontal` | `number` | The `paddingHorizontal` value for the widget. |
| `paddingVertical` | `number` | The `paddingVertical` value for the widget. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `selectedBgColor` | `Color` | Background color for the selected. |
| `hoverColor` | `Color` | Color used for the hover. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `borderRadius` | `number` | Rounds the corners of the widget. |

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
import { ListTile } from "flet-box";

const tile = ListTile({
  title: "Notifications",
  subtitle: "Email and push alerts",
  onPress: () => console.log("open notifications"),
});
```

### Full

```javascript
import { Avatar, Icon, ListTile } from "flet-box";

const tile = ListTile({
  leftItem: Avatar({ name: "Ada Lovelace", size: 40 }),
  title: "Ada Lovelace",
  subtitle: "Product designer",
  rightItem: Icon({ name: "chevron_right" }),
  selected: true,
  selectedBgColor: "#eff6ff",
  divider: true,
  paddingHorizontal: 16,
  paddingVertical: 12,
  onPress: () => console.log("open profile"),
});
```

## Tips

- leftItem and rightItem accept any widget, so you can drop in an Avatar or Switch.
- Set selected: true with selectedBgColor to highlight the active row.

## Accessibility

- Keep the title short and descriptive; it becomes the row's accessible label.

## Behavior

- divider draws a separator under the row; disabled blocks interaction and dims the tile.
- onPress fires when the row is tapped, unless disabled is true.

## Related widgets

- [ListView](ListView.md)
- [Avatar](Avatar.md)
- [Card](Card.md)

---

## Continue reading

- **Previous:** [Divider](Divider.md)
- **Next:** [ListView](ListView.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 3 · Layout, cards and lists** (3 of 8).
