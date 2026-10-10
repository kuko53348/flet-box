# Row

Horizontal flex layout that places its children side by side. It is full width and leaves height at auto by default.

## When to use it

Use Row for toolbars, button groups, and any set of items that should sit in a horizontal line.

## Quick start

```javascript
import { Row, Text } from "flet-box";

const row = Row({
  gap: 8,
  children: [
    Text({ text: "Left" }),
    Text({ text: "Right" }),
  ],
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `gap` | `number \| string` | Space between children along the layout axis. |
| `justifyContent` | `ContainerProps['justifyContent']` | Aligns children along the main axis (CSS `justify-content`). |
| `alignItems` | `ContainerProps['alignItems']` | Aligns children across the cross axis (CSS `align-items`). |
| `wrap` | `boolean` | Lets children wrap onto multiple lines. |
| `children` | `Widget[]` | An array of child widgets. Alias: `child` for a single child. |
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
import { Button, Row, Text } from "flet-box";

const row = Row({
  gap: 12,
  justifyContent: "space-between",
  alignItems: "center",
  children: [
    Text({ text: "Update your profile" }),
    Button({ text: "Save", onPress: () => console.log("saved") }),
  ],
});
```

### Full

```javascript
import { Button, Icon, Row, Text } from "flet-box";

const row = Row({
  gap: 16,
  justifyContent: "center",
  alignItems: "center",
  wrap: true,
  padding: 16,
  bgColor: "#f8fafc",
  borderRadius: 12,
  children: [
    Icon({ name: "person" }),
    Text({ text: "Jane Doe" }),
    Button({ text: "Profile", variant: "outlined" }),
  ],
});
```

## Tips

- `justifyContent` distributes free horizontal space and `alignItems` aligns children vertically.
- Add `wrap: true` when children should flow onto additional lines instead of shrinking.
- `gap` sets an even space between every child.

## Accessibility

- Keep the DOM order the same as the visual order so keyboard and screen-reader focus follow the layout.

## Behavior

- The element is `display: flex` with `flex-direction: row`; passing `onPress` makes the whole row interactive.
- Children stay in the order given and can themselves be `expand` containers that share the row's width.

## Related widgets

- [Column](Column.md)
- [Container](Container.md)
- [Stack](Stack.md)
- [Button](Button.md)

---

## Continue reading

- **Previous:** [Container](Container.md)
- **Next:** [Column](Column.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 1 · First steps: the core mental model** (3 of 7).
