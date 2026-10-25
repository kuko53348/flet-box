# Stack

Overlay container: every child after the first paints in the same box, anchored by a nine-point `alignment` or by its own edges.

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
| `size` | `Size` | Overall size preset or pixel value, depending on the widget. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `margin` | `Margin` | Space outside the widget, between it and its neighbors. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `backgroundColor` | `Color` | Background color. Alias of `bgColor`. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |
| `filter` | `string` | Raw CSS `filter` value applied to the widget itself, e.g. `blur(4px)`. |
| `backdropFilter` | `string` | Raw CSS `backdrop-filter` value: what sits behind the widget is blurred through it, which is what makes a translucent card frosted glass. |
| `maskImage` | `string` | Raw CSS `mask-image` value, used to fade a widget out at its edges instead of cutting it. |
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

- The first child stays in the flow and gives the stack its size; every child after it floats over that box.
- `alignment` anchors the children that name no edges, at one of nine points from top-left to bottom-right. Top-left is the default.
- Later children paint on top, so order them from back to front.
- A child that names its own `top`/`right`/`bottom`/`left` keeps those, and a child that declares `position` is left alone — that is how a child stays in the flow.

## Accessibility

- Make sure overlaid controls keep a logical tab order and that focus is never hidden behind another layer.

## Behavior

- The root is a flex column, so `alignment` places the in-flow child too; an explicit `justifyContent` or `alignItems` wins over it.
- The layers take no space. Give the stack a `width` and `height`, or make the first child the size you want the box to be, or there is nothing for them to sit on.

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
