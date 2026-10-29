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
| `full` | `boolean` | Stretches the widget to fill its parent on both axes in stack mode. |
| `fullHeight` | `boolean` | Stretches the widget to the full height of its parent in stack mode. |
| `fullWidth` | `boolean` | Stretches the widget to the full width of its parent. |
| `center` | `boolean` | Centres the widget on both axes in stack mode. |
| `centerY` | `boolean` | Centres the widget vertically in stack mode. |
| `centerX` | `boolean` | Centres the widget horizontally in stack mode. |
| `zIndex` | `number` | Stacking order: a widget with a higher value paints above lower ones. |
| `z` | `number` | Alias of `zIndex`. |
| `end` | `Size` | Logical alias of `right`, used by the stack placement shorthands. |
| `start` | `Size` | Logical alias of `left`, used by the stack placement shorthands. |
| `inset` | `Size` | Shorthand for the four edge offsets (`top`/`right`/`bottom`/`left`). |
| `left` | `Size` | Offset from the left edge. A number is pixels; a string uses any CSS unit. |
| `bottom` | `Size` | Offset from the bottom edge. A number is pixels; a string uses any CSS unit. |
| `right` | `Size` | Offset from the right edge. A number is pixels; a string uses any CSS unit. |
| `top` | `Size` | Offset from the top edge. A number is pixels; a string uses any CSS unit. |
| `pos` | `'static' \| 'relative' \| 'absolute' \| 'fixed' \| 'sticky' \| 'stack'` | Alias of `position`. |
| `position` | `'static' \| 'relative' \| 'absolute' \| 'fixed' \| 'sticky' \| 'stack'` | CSS `position` value, or `stack` for centered stacking. |
| `width` | `Size` | Width of the widget. A number is pixels; a string uses any CSS unit. |
| `height` | `Size` | Height of the widget. A number is pixels; a string uses any CSS unit. |
| `size` | `Size` | Overall size preset or pixel value, depending on the widget. |
| `flex` | `number` | Flex grow/shrink/basis shorthand for a flex child. |
| `minWidth` | `Size` | Minimum width the widget may shrink to. |
| `maxWidth` | `Size` | Maximum width the widget may grow to. |
| `minHeight` | `Size` | Minimum height the widget may shrink to. |
| `maxHeight` | `Size` | Maximum height the widget may grow to. |
| `border` | `string` | CSS `border` shorthand for all four edges: width, style and color in one string. |
| `borderTop` | `string` | The top edge of the border alone, for a widget whose rim differs per side. |
| `borderBottom` | `string` | The bottom edge of the border alone, for a widget whose rim differs per side. |
| `borderLeft` | `string` | The left edge of the border alone, for a widget whose rim differs per side. |
| `borderRight` | `string` | The right edge of the border alone, for a widget whose rim differs per side. |
| `cursor` | `string` | CSS `cursor` value: what the pointer becomes over the widget (`pointer`, `grab`, `not-allowed`). |
| `display` | `string` | CSS `display` value for the container. |
| `boxSizing` | `'border-box' \| 'content-box'` | Which box `width` and `height` measure: `border-box` keeps the size you asked for and pushes padding inward. |
| `flexDirection` | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'` | Main axis of a flex container: `row` places children side by side, `column` stacks them. |
| `flexGrow` | `number` | Share of the leftover space this child takes, relative to its siblings. |
| `flexShrink` | `number` | How readily the child gives space back when the row overflows; `0` keeps its size. |
| `gap` | `number \| string` | Space between children along the layout axis. |
| `fontSize` | `number` | Size of the font. |
| `borderColor` | `Color` | Color used for the border. |
| `borderWidth` | `number` | Width of the border. |
| `padding` | `Padding` | Space inside the widget, between its content and its border. |
| `paddingTop` | `Size` | Space inside the widget, on the top edge only. |
| `paddingRight` | `Size` | Space inside the widget, on the right edge only. |
| `paddingBottom` | `Size` | Space inside the widget, on the bottom edge only. |
| `paddingLeft` | `Size` | Space inside the widget, on the left edge only. |
| `pt` | `Size` | Alias of `paddingTop`. |
| `pr` | `Size` | Alias of `paddingRight`. |
| `pb` | `Size` | Alias of `paddingBottom`. |
| `pl` | `Size` | Alias of `paddingLeft`. |
| `margin` | `Margin` | Space outside the widget, between it and its neighbors. |
| `marginTop` | `Size` | Space outside the widget, on the top edge only. |
| `marginRight` | `Size` | Space outside the widget, on the right edge only. |
| `marginBottom` | `Size` | Space outside the widget, on the bottom edge only. |
| `marginLeft` | `Size` | Space outside the widget, on the left edge only. |
| `mt` | `Size` | Alias of `marginTop`. |
| `mr` | `Size` | Alias of `marginRight`. |
| `mb` | `Size` | Alias of `marginBottom`. |
| `ml` | `Size` | Alias of `marginLeft`. |
| `bgColor` | `Color` | Background color. Alias: `backgroundColor`. |
| `backgroundColor` | `Color` | Background color. Alias of `bgColor`. |
| `color` | `Color` | Foreground color, usually the text or icon color. |
| `borderRadius` | `number \| string` | Rounds the corners of the widget. |
| `elevation` | `number` | Shadow depth. Higher values lift the widget off the page. |
| `shadow` | `string` | Raw CSS `box-shadow` value, for a custom shadow. |
| `filter` | `string` | Raw CSS `filter` value applied to the widget itself, e.g. `blur(4px)`. |
| `backdropFilter` | `string` | Raw CSS `backdrop-filter` value: what sits behind the widget is blurred through it, which is what makes a translucent card frosted glass. |
| `maskImage` | `string` | Raw CSS `mask-image` value, used to fade a widget out at its edges instead of cutting it. |
| `bgImage` | `string` | Image painted behind the widget's content (CSS `background-image`), placed with `bgSize` and `bgPosition`. |
| `bgSize` | `string` | How the background image fills its box (`cover`, `contain`, or a length). |
| `bgPosition` | `string` | Where the background image is anchored (`center`, `top`, `50% 20%`). |
| `bgRepeat` | `string` | Whether the background image tiles; `no-repeat` for a single cover. |
| `opacity` | `number` | Opacity from 0 (invisible) to 1 (fully opaque). |
| `visible` | `boolean` | Whether the widget is rendered and visible. |
| `disabled` | `boolean` | Disables interaction and shows the non-interactive state. |
| `onPress` | `(event?: Event) => void` | Callback fired when the widget is pressed. Alias: `onClick`. |
| `onClick` | `(event?: Event) => void` | Callback fired when the widget is clicked. Alias: `onPress`. |
| `onclick` | `(event?: Event) => void` | Lowercase alias of `onClick`, kept because the shipped templates and the HTML habit write it. |
| `alignSelf` | `AlignSelf` | Overrides the parent's `alignItems` for this child alone (CSS `align-self`). Alias: `selfAlign`. |
| `selfAlign` | `AlignSelf` | Alias of `alignSelf`. |
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
- Tune the palette with the per-instance props (codeBgColor, preBgColor, linkColor), and set maxHeight with overflow to keep long pages scrollable.
- Code blocks are syntax-highlighted and get a one-click copy action out of the box.

## Accessibility

- Keep link text descriptive; rendered links stay real anchors that the keyboard can tab to.
- Heading levels map to real h1-h6 elements, so keep the document hierarchy sensible.

## Behavior

- Generated styles are scoped to each instance, so several Markdown blocks never leak CSS into each other.
- Rendered HTML is sanitized before insert; allowDangerousHtml stays false by default for untrusted input.
- Inline code writes the palette's readable red, so 12px words clear 4.5:1 on the code plate in both themes.
- A link takes the palette's readable blue, because in light `primary` is the page's own ink and the link would vanish into the sentence.

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
