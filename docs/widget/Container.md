# Container

General-purpose surface box. It is a flex column by default and groups children while controlling spacing, background, sizing, and overflow.

## When to use it

Reach for Container whenever you need a rectangular surface to group content or apply padding, background, and size.

## Quick start

```javascript
import { Container, Text } from "flet-box";

const panel = Container({
  padding: 16,
  bgColor: "#f8fafc",
  child: Text({ text: "Hello FletBox" }),
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `direction` | `'row' \| 'column'` | Main-axis direction for layout widgets (`row` or `column`). |
| `gap` | `number \| string` | Space between children along the layout axis. |
| `justifyContent` | `'flex-start' \| 'center' \| 'flex-end' \| 'space-between' \| 'space-around' \| 'space-evenly'` | Aligns children along the main axis (CSS `justify-content`). |
| `alignItems` | `'flex-start' \| 'center' \| 'flex-end' \| 'stretch'` | Aligns children across the cross axis (CSS `align-items`). |
| `wrap` | `boolean` | Lets children wrap onto multiple lines. |
| `child` | `Widget` | A single child widget. Alias: `children` for a list. |
| `children` | `Widget[]` | An array of child widgets. Alias: `child` for a single child. |
| `expand` | `boolean` | Lets a flex child grow to fill available space. |
| `flex` | `number` | Flex grow/shrink/basis shorthand for a flex child. |
| `minHeight` | `Size` | Minimum height the widget may shrink to. |
| `maxHeight` | `Size` | Maximum height the widget may grow to. |
| `minWidth` | `Size` | Minimum width the widget may shrink to. |
| `maxWidth` | `Size` | Maximum width the widget may grow to. |
| `overflow` | `'auto' \| 'hidden' \| 'visible' \| 'scroll'` | How overflowing content is handled (`hidden`, `auto`, `scroll`). |

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
import { Container, Text } from "flet-box";

const panel = Container({
  direction: "column",
  gap: 12,
  padding: 16,
  borderRadius: 12,
  child: Text({ text: "Account settings" }),
});
```

### Full

```javascript
import { Container, Text } from "flet-box";

const panel = Container({
  direction: "column",
  gap: 16,
  padding: 24,
  margin: 16,
  borderRadius: 16,
  bgColor: "#ffffff",
  elevation: 2,
  maxWidth: 480,
  overflow: "auto",
  children: [
    Text({ text: "Account settings", type: "h3", weight: "bold" }),
    Text({ text: "Update your profile details." }),
  ],
});
```

## Tips

- Container is a column by default; set `direction: "row"` to lay children out horizontally.
- `bgColor` defaults to the theme surface and `overflow` defaults to `"auto"`, so long content scrolls.
- Use `expand` or `flex` to let a container share free space inside a parent flex layout.

## Accessibility

- Keep one logical section per Container so screen-reader navigation lands on meaningful groups.

## Behavior

- One child uses `child`; several use `children`; `gap` controls the space between them.
- `minWidth`, `maxWidth`, `minHeight`, and `maxHeight` constrain the surface, while `overflow` decides how excess content behaves.

## Related widgets

- [Row](Row.md)
- [Column](Column.md)
- [Stack](Stack.md)
- [Card](Card.md)

---

## Continue reading

- **Previous:** [Text](Text.md)
- **Next:** [Row](Row.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 1 · First steps: the core mental model** (2 of 7).
