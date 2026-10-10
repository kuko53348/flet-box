# Markdown

Renders markdown source as styled HTML with scoped CSS, syntax-highlighted code blocks, copy buttons, tables, and blockquotes inside a scrollable surface.

## When to use it

Use it for documentation, changelogs, readmes, or any user-facing text authored in Markdown.

## Quick start

```javascript
import { Markdown } from "flet-box";

const notes = Markdown({
  content: `# Hello

**FletBox** renders markdown.`,
});
```

> The prop table is generated from `src/index.d.ts`; the examples use only documented props.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `text` | `string` | Visible text content. |
| `source` | `string` | Markdown source string to render. |
| `content` | `string` | Main content of the overlay. |
| `children` | `string` | An array of child widgets. Alias: `child` for a single child. |
| `fontSize` | `number` | Size of the font. |
| `fontFamily` | `string` | The `fontFamily` value for the widget. |
| `lineHeight` | `number` | Line height as a number multiplier or CSS value. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `linkColor` | `Color` | Color of links in rendered markdown. |
| `linkHoverColor` | `Color` | Color used for the link hover. |
| `linkUnderline` | `boolean` | The `linkUnderline` value for the widget. |
| `codeBgColor` | `Color` | Background color of inline code. |
| `codeColor` | `Color` | Color used for the code. |
| `codeFontSize` | `number` | Size of the code font. |
| `codeFontFamily` | `string` | The `codeFontFamily` value for the widget. |
| `codeBorderRadius` | `number` | Corner radius for the code. |
| `codePadding` | `Padding` | Padding for the code. |
| `preBgColor` | `Color` | Background color of code blocks. |
| `preBorderRadius` | `number` | Corner radius for the pre. |
| `prePadding` | `Padding` | Padding for the pre. |
| `preMargin` | `Padding` | Margin for the pre. |
| `blockquoteBorderColor` | `Color` | Border color for the blockquote. |
| `blockquoteBorderWidth` | `number` | Border width for the blockquote. |
| `blockquoteColor` | `Color` | Color used for the blockquote. |
| `blockquotePadding` | `Padding` | Padding for the blockquote. |
| `blockquoteMargin` | `Padding` | Margin for the blockquote. |
| `tableBorderColor` | `Color` | Border color for the table. |
| `tableHeaderBgColor` | `Color` | Background color for the table header. |
| `tableCellPadding` | `Padding` | Padding for the table cell. |
| `headingColor` | `Color` | Color of markdown headings. |
| `headingMargin` | `Padding` | Margin for the heading. |
| `listMargin` | `Padding` | Margin for the list. |
| `listPadding` | `Padding` | Padding for the list. |
| `listItemMargin` | `Padding` | Margin for the list item. |
| `imageMaxWidth` | `string` | Width of the image max. |
| `imageBorderRadius` | `number` | Corner radius for the image. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `maxHeight` | `number` | Maximum height the widget may grow to. |
| `overflow` | `string` | How overflowing content is handled (`hidden`, `auto`, `scroll`). |
| `backgroundColor` | `Color` | Background color. Alias of `bgColor`. |
| `borderRadius` | `number` | Rounds the corners of the widget. |
| `allowDangerousHtml` | `boolean` | Allows raw HTML inside markdown output. |

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
import { Markdown } from "flet-box";

const readme = Markdown({
  content: `# Getting started

Edit the **props** and render.`,
  fontSize: 15,
  lineHeight: 1.7,
  linkColor: "#2563eb",
});
```

### Full

```javascript
import { Markdown } from "flet-box";

const guide = Markdown({
  content: `# Guide

- Install FletBox
- Write declarative UI`,
  fontSize: 16,
  lineHeight: 1.8,
  color: "#1f2937",
  linkColor: "#2563eb",
  codeBgColor: "#f3f4f6",
  preBgColor: "#111827",
  preBorderRadius: 8,
  blockquoteBorderColor: "#e5e7eb",
  tableHeaderBgColor: "#f9fafb",
  headingColor: "#111827",
  padding: 16,
  borderRadius: 12,
  backgroundColor: "#ffffff",
  maxHeight: 480,
  overflow: "auto",
});
```

## Tips

- text, source, and content are interchangeable aliases for the markdown source.
- Tune the palette with the per-instance props (codeBgColor, preBgColor, linkColor),
- and set maxHeight with overflow to keep long pages scrollable.
- Code blocks are syntax-highlighted and get a one-click copy action out of the box.

## Accessibility

- Keep link text descriptive; rendered links stay real anchors that the keyboard can
- tab to.
- Heading levels map to real h1-h6 elements, so keep the document hierarchy sensible.

## Behavior

- Generated styles are scoped to each instance, so several Markdown blocks never leak
- CSS into each other.
- Rendered HTML is sanitized before insert; allowDangerousHtml stays false by default
- for untrusted input.

## Related widgets

- [Text](Text.md)
- [CodeViewer](CodeViewer.md)
- [Card](Card.md)

---

## Continue reading

- **Previous:** [CircularChart](CircularChart.md)
- **Next:** [CodeViewer](CodeViewer.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 6 · Data, rich content & effects** (4 of 13).
