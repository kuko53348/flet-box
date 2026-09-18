# Markdown

## Overview
`Markdown` turns a markdown string into HTML with a small built-in regex parser — no markdown library, no virtual DOM. It renders a `<div>` (your typography and container props) holding one `.markdown-content` `<div>` whose `innerHTML` is the parsed result, plus a single document-wide `<style id="markdown-styles">` that styles headings, lists, code, links, blockquotes, images, and tables. The source text comes from `text`, with `source`, `content`, and `children` accepted as aliases.

## When to use
- Render documentation, release notes, or a README string inside your app.
- Show server-provided rich text (headings, bold/italic, lists, links, quotes) without writing HTML.
- Swap content at runtime with `updateContent()` instead of rebuilding the widget.

## Import

```javascript
import { Markdown } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Markdown } from "flet-box";

Markdown({ text: "# Hello\nThis is **bold** and `inline code`." });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | string | `""` | Markdown source. Aliases: `source`, `content`, `children`. The first truthy one wins, in that order. |
| `fontSize` | number or string | `14` | Base font size in pixels for the container. |
| `fontFamily` | string | `'system-ui, -apple-system, sans-serif'` | Container font stack. |
| `lineHeight` | number | `1.6` | Container line height (unitless). |
| `color` | Color | `colors.text` | Base text color. |
| `linkColor` | Color | `colors.primary` | `<a>` color (injected stylesheet). |
| `linkHoverColor` | Color | `colors.primary` | `<a>:hover` color. |
| `linkUnderline` | boolean | `false` | Underlines links; hover always underlines. |
| `codeBgColor` | Color | `colors.gray100` | Inline `<code>` background. |
| `codeColor` | Color | `colors.danger` | Inline `<code>` color. |
| `codeFontSize` | number or string | `12` | Inline `<code>` font size in pixels. |
| `codeFontFamily` | string | `'monospace, "Courier New", Courier'` | Inline `<code>` font stack. |
| `codeBorderRadius` | number or string | `4` | Inline `<code>` corner radius in pixels. |
| `codePadding` | string | `'0.2em 0.4em'` | Inline `<code>` padding. |
| `preBgColor` | Color | `colors.gray100` | `<pre>` background. |
| `preBorderRadius` | number or string | `8` | `<pre>` corner radius in pixels. |
| `prePadding` | string | `'1em'` | `<pre>` padding. |
| `preMargin` | string | `'1em 0'` | `<pre>` margin. |
| `blockquoteBorderColor` | Color | `colors.primary` | Blockquote left border color. |
| `blockquoteBorderWidth` | number | `4` | Blockquote left border width in pixels. |
| `blockquoteColor` | Color | `colors.textSecondary` | Blockquote text color. |
| `blockquotePadding` | string | `'0 1em'` | Blockquote padding. |
| `blockquoteMargin` | string | `'1em 0'` | Blockquote margin. |
| `headingColor` | Color | `colors.text` | `h1`–`h6` color. |
| `headingMargin` | string | `'0.67em 0'` | `h1`–`h6` margin. |
| `listMargin` | string | `'1em 0'` | `ul`/`ol` margin. |
| `listPadding` | string | `'0 0 0 2em'` | `ul`/`ol` padding. |
| `listItemMargin` | string | `'0.25em 0'` | `li` margin. |
| `imageMaxWidth` | string | `'100%'` | `img` max width. |
| `imageBorderRadius` | number or string | `0` | `img` corner radius in pixels. |
| `padding` | number or string | `0` | Container padding; a number becomes px. |
| `maxHeight` | number or string | — | Container max height in pixels; pairs with `overflow`. |
| `overflow` | string | `'auto'` | Container overflow. |
| `backgroundColor` | Color | `'transparent'` | Container background. Alias: `bgColor` as a common prop. |
| `borderRadius` | number or string | `0` | Container corner radius in pixels. |
| `allowDangerousHtml` | boolean | `false` | Skips the built-in HTML stripping. |

These are the props specific to `Markdown`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`. Common props land on the outer container.

## Instance methods

The returned container exposes:

- `updateContent(newText)` — re-parses a new markdown string into the same `.markdown-content` div (with the same sanitizing rules).
- `getContent()` — returns the current inner HTML string.
- `getSource()` — returns the markdown source the widget was created with.

## Examples

### Everyday example

```javascript
import { Markdown, colors } from "flet-box";

Markdown({
  text: [
    "## Release 1.4",
    "",
    "Shipped **dark mode** and a faster `ListView`.",
    "",
    "- Fixed scroll jitter",
    "- Improved theming",
    "",
    "> Read the [full changelog](https://example.com/changelog).",
  ].join("\n"),
  fontSize: 15,
  lineHeight: 1.6,
  color: colors.text,
  linkColor: colors.primary,
  linkUnderline: true,
});
```

### Full example

```javascript
import { Button, Column, Markdown, Row, colors } from "flet-box";

const doc = Markdown({
  text: [
    "# Getting started",
    "",
    "FletBox widgets are **plain functions** that return real DOM elements.",
    "",
    "### Install",
    "",
    "Run `npm install flet-box` and import what you need.",
    "",
    "1. Create a widget",
    "2. Nest it in a layout",
    "3. Mount it with runApp",
    "",
    "---",
    "",
    "> No virtual DOM, no build step required.",
  ].join("\n"),
  fontSize: 15,
  fontFamily: "system-ui, -apple-system, sans-serif",
  lineHeight: 1.7,
  color: colors.text,
  linkColor: colors.primary,
  linkHoverColor: colors.secondary,
  linkUnderline: false,
  codeBgColor: colors.gray100,
  codeColor: colors.danger,
  codeFontSize: 12,
  codeBorderRadius: 4,
  blockquoteBorderColor: colors.primary,
  blockquoteBorderWidth: 4,
  blockquoteColor: colors.textSecondary,
  headingColor: colors.text,
  padding: 16,
  maxHeight: 320,
  overflow: "auto",
  backgroundColor: colors.surface,
  borderRadius: 12,
  allowDangerousHtml: false,
});

// doc.getSource();          // the markdown string
// doc.getContent();         // the generated HTML
// doc.updateContent("# New title");

Column({
  gap: 12,
  children: [
    doc,
    Row({
      gap: 8,
      children: [
        Button({ text: "Load changelog", onPress: () => doc.updateContent("# Changelog\n- 1.4\n- 1.3") }),
      ],
    }),
  ],
});
```

## Notes

- `Markdown` is exported from the package entry (`flet-box`) and re-exported through `src/widgets/index.js`.
- Supported syntax: `#`/`##`/`###` headings, `**bold**`/`__bold__`, `*italic*`/`_italic_`, `` `inline code` ``, `[text](url)` links (opened with `target="_blank" rel="noopener"`), `- ` bullet items, `1. ` numbered items, `> ` blockquotes, `---` rules, and paragraphs.
- Fenced code blocks (three backticks) do **not** produce `<pre><code>`: the inline-code rule runs first and eats the backticks. Use [CodeViewer](CodeViewer.md) for code samples.
- `![alt](src)` images do **not** produce `<img>`: the link rule matches first, so you get a literal `!` followed by a link. The `img` styles in the injected sheet only apply to raw HTML you pass in.
- Lists are fragile: any run of `<li>` also gets wrapped in an `<ol>` inside the `<ul>`, and mixing bullet and numbered items in one document produces malformed nesting. Keep one list style per block.
- Only `h1`–`h3` are generated (`h4`–`h6` are styled but never emitted), and `####`+ markers render as literal text.
- The stylesheet is injected **once per document** (`#markdown-styles`). The first `Markdown` instance created on the page decides `headingColor`, `linkColor`, `codeBgColor`, list spacing, and so on for every instance; only container-level props (`fontSize`, `color`, `lineHeight`, `padding`, `maxHeight`, `backgroundColor`, `borderRadius`) are per-instance.
- Sanitizing is a regex pass that strips `<script>` blocks, `on*=` attributes, and `javascript:` URLs. It is **not** a real HTML sanitizer — never enable `allowDangerousHtml` for untrusted input.
- Table CSS exists in the injected sheet, but the parser never generates tables; pipe tables render as plain paragraph text.

## Related widgets
- [CodeViewer](CodeViewer.md)
- [Text](Text.md)
- [Accordion](Accordion.md)
- [Card](Card.md)
- [Container](Container.md)

---

## Continue reading

- **Previous:** [CircularChart](CircularChart.md)
- **Next:** [CodeViewer](CodeViewer.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 6 · Data and rich content** (4 of 7).
