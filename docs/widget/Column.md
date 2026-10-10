# Column

Vertical flex layout that stacks its children one below another. It is full width and leaves height at auto by default.

## When to use it

Use Column for forms, lists of blocks, and any content that reads from top to bottom.

## Quick start

```javascript
import { Column, Text } from "flet-box";

const column = Column({
  gap: 8,
  children: [
    Text({ text: "First" }),
    Text({ text: "Second" }),
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
import { Column, Text, flex } from "flet-box";

const column = Column({
  gap: 12,
  padding: 16,
  alignItems: "flex-start",
  children: [
    Text({ text: "Account settings", type: "h3", weight: "bold" }),
    Text({ text: "Update your profile details." }),
  ],
});
```

### Full

```javascript
import { Button, Column, Text, flex } from "flet-box";

const column = Column({
  gap: 16,
  justifyContent: "flex-start",
  alignItems: "stretch",
  padding: 24,
  bgColor: "#ffffff",
  borderRadius: 16,
  children: [
    Text({ text: "Sign in", type: "h2", weight: "bold" }),
    Button({ text: "Continue", fullWidth: true, onPress: () => console.log("go") }),
    Button({ text: "Cancel", variant: "text" }),
  ],
});
```

## Tips

- `gap` controls the space between stacked children.
- Set `alignItems: "center"` to center children horizontally in the column.
- Give children `expand` to split the available height between them.

## Accessibility

- Maintain reading order from top to bottom and avoid purely visual reordering of the children.

## Behavior

- The element is `display: flex` with `flex-direction: column`; passing `onPress` makes the whole column interactive.
- Children stack in the order given, and `justifyContent` controls how leftover vertical space is used.

## Related widgets

- [Row](Row.md)
- [Container](Container.md)
- [Stack](Stack.md)
- [ListView](ListView.md)

---

## Continue reading

- **Previous:** [Row](Row.md)
- **Next:** [Stack](Stack.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 1 · First steps: the core mental model** (4 of 7).
