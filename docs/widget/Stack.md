# Stack

Overlay container that lets children occupy the same box. It is relative by default so children can be positioned, and it supports a nine-point alignment.

## When to use it

Use Stack to layer badges, overlays, captions, or any elements that should sit on top of one another.

## Quick start

```javascript
import { Stack, Text } from "flet-box";

const stack = Stack({
  children: [
    Text({ text: "Base" }),
    Text({ text: "Overlay" }),
  ],
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `children` | `Widget[]` | An array of child widgets. Alias: `child` for a single child. |
| `position` | `'relative' \| 'absolute'` | CSS `position` value, or `stack` for centered stacking. |
| `alignment` | `'top-left' \| 'top-center' \| 'top-right' \| 'center-left' \| 'center' \| 'center-right' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right'` | How children are aligned inside the stack. |

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
import { Container, Stack, Text } from "flet-box";

const stack = Stack({
  width: 240,
  height: 160,
  alignment: "center",
  children: [
    Container({ bgColor: "#e0e7ff", child: Text({ text: "Background" }) }),
    Text({ text: "Centered", weight: "bold" }),
  ],
});
```

### Full

```javascript
import { Container, Stack, Text } from "flet-box";

const stack = Stack({
  width: "100%",
  height: 220,
  position: "relative",
  alignment: "bottom-right",
  children: [
    Container({ bgColor: "#f1f5f9", child: Text({ text: "Cover" }) }),
    Container({
      bgColor: "#2563eb",
      borderRadius: 8,
      padding: 8,
      child: Text({ text: "New", color: "#ffffff" }),
    }),
  ],
});
```

## Tips

- Stack is `position: "relative"` by default, which makes it a positioning context for absolute children.
- `alignment` anchors children at one of nine points from top-left to bottom-right.
- Later children paint on top, so order them from back to front.

## Accessibility

- Make sure overlaid controls keep a logical tab order and that focus is never hidden behind another layer.

## Behavior

- The root is a plain block by default and children are laid out per `position` and `alignment`.
- Set `width` and `height` (or `expand`) when the stack needs a definite size for layered content.

## Related widgets

- [Container](Container.md)
- [Row](Row.md)
- [Column](Column.md)
- [Badge](Badge.md)

---

## Continue reading

- **Previous:** [Column](Column.md)
- **Next:** [Icon](Icon.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 1 · First steps: the core mental model** (5 of 7).
