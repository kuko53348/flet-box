# Card

A rounded, optionally elevated surface that groups related content into a single tappable unit.

## When to use it

Use it to present a self-contained block such as a summary, product, or stat.

## Quick start

```javascript
import { Card, Text } from "flet-box";

const card = Card({
  child: Text({ text: "Hello" }),
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `child` | `Widget` | A single child widget. Alias: `children` for a list. |
| `children` | `Widget[]` | An array of child widgets. Alias: `child` for a single child. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `showBorder` | `boolean` | Controls whether the border is shown. |
| `borderWidth` | `number` | Width of the border. |
| `borderStyle` | `'solid' \| 'dashed' \| 'dotted'` | The `borderStyle` value for the widget. |
| `borderColor` | `Color` | Color used for the border. |
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
import { Card, Text } from "flet-box";

const card = Card({
  elevation: 2,
  padding: 16,
  borderRadius: 12,
  child: Text({ text: "Today's summary" }),
});
```

### Full

```javascript
import { Card, Text } from "flet-box";

const card = Card({
  elevation: 3,
  padding: 20,
  borderRadius: 16,
  showBorder: true,
  borderColor: "#e2e8f0",
  borderWidth: 1,
  onPress: () => console.log("open report"),
  children: [
    Text({ text: "Weekly report", weight: "bold" }),
    Text({ text: "Revenue is up 12% this week." }),
  ],
});
```

## Tips

- Keep elevation subtle (1-3) so stacked cards do not look noisy.
- Set showBorder: true for a flat look, or use elevation for a raised surface.

## Accessibility

- When onPress is set the whole card becomes a button; make its heading describe the action.

## Behavior

- Accepts either child for one widget or children for a stacked column of content.
- onPress fires for clicks anywhere inside the card surface.

## Related widgets

- [Container](Container.md)
- [ListTile](ListTile.md)
- [Button](Button.md)

---

## Continue reading

- **Previous:** [Rating](Rating.md)
- **Next:** [Divider](Divider.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 3 · Layout, cards and lists** (1 of 8).
