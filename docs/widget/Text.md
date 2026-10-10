# Text

Renders a string as inline text or as a heading, with control over size, weight, color, alignment, and inline styles.

## When to use it

Use Text for every piece of copy, from body paragraphs and labels to page headings.

## Quick start

```javascript
import { Text } from "flet-box";

const title = Text({
  text: "Welcome back",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `text` | `string` | Visible text content. |
| `value` | `string` | Current value controlled by the widget. |
| `children` | `string` | An array of child widgets. Alias: `child` for a single child. |
| `size` | `number` | Overall size preset or pixel value, depending on the widget. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `weight` | `'normal' \| 'bold' \| number` | Font weight, such as `normal`, `bold`, or a number. |
| `align` | `'left' \| 'center' \| 'right' \| 'justify'` | Horizontal text alignment. |
| `italic` | `boolean` | Renders the text in italics. |
| `decoration` | `'underline' \| 'line-through' \| 'overline'` | Text decoration such as `underline` or `line-through`. |
| `lineHeight` | `number \| string` | Line height as a number multiplier or CSS value. |
| `letterSpacing` | `number \| string` | Extra space between letters. |
| `type` | `'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6' \| 'p'` | Kind or mode of the widget. |
| `styles` | `Array<'bold' \| 'italic' \| 'underline' \| 'strikethrough' \| 'mark' \| 'small' \| 'code'>` | Extra inline styles applied to the text. |
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
import { Text } from "flet-box";

const title = Text({
  text: "Welcome back",
  type: "h2",
  size: 28,
  weight: "bold",
  color: "#111827",
});
```

### Full

```javascript
import { Text } from "flet-box";

const body = Text({
  text: "Your subscription renews on Friday.",
  type: "p",
  size: 16,
  weight: "normal",
  color: "#374151",
  align: "left",
  lineHeight: 1.5,
  letterSpacing: 0.2,
  italic: false,
  decoration: "underline",
  styles: ["code"],
  onPress: () => console.log("pressed"),
});
```

## Tips

- Pass content with `text`, `value`, or `children`; `type` maps to the `h1`-`h6` and `p` tags.
- `styles` applies inline emphasis such as `bold`, `italic`, `underline`, `strikethrough`, `mark`, or `code`.
- `weight` accepts `"normal"`, `"bold"`, or a numeric value.

## Accessibility

- Use heading `type` values in order so the document outline stays meaningful for screen readers.

## Behavior

- Heading types `h1`, `h2`, and `p` add a bottom margin; size and color fall back to theme defaults.
- Inline `styles` wrap the element in semantic tags such as `strong`, `em`, and `code`.

## Related widgets

- [Icon](Icon.md)
- [Button](Button.md)
- [Container](Container.md)
- [ListTile](ListTile.md)

---

## Continue reading

- **Previous:** [Start here](START_HERE.md)
- **Next:** [Container](Container.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 1 · First steps: the core mental model** (1 of 7).
