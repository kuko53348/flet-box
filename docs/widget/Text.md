# Text

## Overview
`Text` renders a run of text — a label, a paragraph, or a heading. It is the most-used widget in FletBox: give it `text`, then style it with `size`, `weight`, `color`, and `align`. By default it renders a `<span>`; setting `type` renders the matching semantic tag (`h1`–`h6` or `p`).

## When to use
- Display a label, title, paragraph, or any read-only text.
- Render semantic headings with `type: "h1"` … `"h6"` for document structure and accessibility.
- Add inline emphasis with `styles` (bold, italic, underline, strikethrough, mark, small, code).

## Import

```javascript
import { Text } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Text } from "flet-box";

Text({ text: "Hello FletBox" });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | string | `""` | The text to render. Aliases: `value`, `children`. |
| `type` | `'h1'`–`'h6'`, `'p'` | `<span>` | Semantic tag to render. `h1`/`h2` and `p` add a default bottom margin. |
| `size` | number | `16` | Font size in pixels. |
| `weight` | `'normal'`, `'bold'`, or number | `'normal'` | Font weight. |
| `color` | Color | `colors.textSecondary` | Text (foreground) color. |
| `backgroundColor` | Color | `'transparent'` | Background behind the text. Alias: `bgColor`. |
| `align` | `'left'`, `'center'`, `'right'`, `'justify'` | — | Text alignment (CSS `text-align`). |
| `styles` | array of `'bold'`, `'italic'`, `'underline'`, `'strikethrough'`, `'mark'`, `'small'`, `'code'` | `[]` | Inline emphasis. Wraps text in `<strong>`, `<em>`, `<mark>`, `<small>`, `<code>`; underline/strikethrough use `text-decoration`. |

These are the props specific to `Text`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Examples

### Everyday example

```javascript
import { Text, colors } from "flet-box";

Text({
  text: "Welcome back",
  type: "h2",
  size: 28,
  weight: "bold",
  color: colors.text,
});
```

### Full example

```javascript
import { Text } from "flet-box";

Text({
  text: "Advanced typography",
  type: "h1",
  size: 32,
  weight: 600,
  color: "#111827",
  align: "center",
  styles: ["italic", "underline"],
  lineHeight: 1.4,
  letterSpacing: 0.5,
});
```

## Notes

- Renders a `<span>` unless `type` is set to a heading or `p`.
- Here `align` means **text alignment**; in `Row`/`Column` the same prop name means `alignItems`.
- `lineHeight` and `letterSpacing` are available as [common props](COMMON_PROPS.md).
- `styles: ["underline", "strikethrough"]` combine into `text-decoration: underline line-through`.

## Related widgets
- [Container](Container.md)
- [Row](Row.md)
- [Column](Column.md)
- [Icon](Icon.md)
- [Button](Button.md)
- [Markdown](Markdown.md)

---

## Continue reading

- **Previous:** [Start here](START_HERE.md)
- **Next:** [Container](Container.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 1 · First steps: the core mental model** (1 of 7).
