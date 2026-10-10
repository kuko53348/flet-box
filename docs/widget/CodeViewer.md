# CodeViewer

CodeViewer shows a read-only code block with an optional header, line numbers and scrolling for long files. It renders the code prop verbatim in a styled monospace container.

## When to use it

Use it to display snippets, config or logs in docs and developer tools without building your own pre/code styling.

## Quick start

```javascript
import { CodeViewer } from "flet-box";

const snippet = CodeViewer({
  code: "const total = price * qty;",
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `code` | `string` | Source code to display. |
| `title` | `string` | Title text shown in the header. |
| `maxHeight` | `number` | Maximum height the widget may grow to. |
| `fontSize` | `number` | Size of the font. |
| `backgroundColor` | `Color` | Background color. Alias of `bgColor`. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `borderRadius` | `number` | Rounds the corners of the widget. |
| `showHeader` | `boolean` | Shows the code viewer header. |
| `showLineNumbers` | `boolean` | Shows line numbers in the gutter. |
| `startingLineNumber` | `number` | The `startingLineNumber` value for the widget. |
| `lineNumberWidth` | `number` | Width of the line number. |
| `lineNumberColor` | `Color` | Color used for the line number. |

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
import { CodeViewer } from "flet-box";

const viewer = CodeViewer({
  code: "function add(a, b) {\n  return a + b;\n}",
  title: "math.js",
  showLineNumbers: true,
  maxHeight: 320,
});
```

### Full

```javascript
import { CodeViewer } from "flet-box";

const viewer = CodeViewer({
  code: "export function login(user) {\n  return api.post('/auth', user);\n}",
  title: "auth.js",
  showHeader: true,
  showLineNumbers: true,
  startingLineNumber: 10,
  lineNumberWidth: 40,
  fontSize: 13,
  maxHeight: 400,
  borderRadius: 8,
  backgroundColor: "#0f172a",
  lineNumberColor: "#64748b",
  padding: 16,
});
```

## Tips

- Pass the full source in code; use showLineNumbers and startingLineNumber to match an excerpt's original numbers.
- Cap tall blocks with maxHeight so the viewer scrolls instead of pushing the page layout.
- Set title to label the file or language shown in the header.

## Accessibility

- Keep the code text selectable and readable; do not rely on color alone to convey meaning.
- A descriptive title helps screen-reader users identify the snippet.

## Behavior

- The code is inserted as text content, so HTML in code is displayed rather than executed.
- Line numbers are derived from code and update when the reactive code prop changes.

## Related widgets

- [Markdown](Markdown.md)
- [Text](Text.md)
- [Card](Card.md)

---

## Continue reading

- **Previous:** [Markdown](Markdown.md)
- **Next:** [QRCode](QRCode.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 6 · Data, rich content & effects** (5 of 13).
