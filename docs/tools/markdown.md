# Markdown, code & HTML

## Overview
Render markdown as HTML or as real FletBox widgets, highlight code, and escape untrusted text. These helpers power the [Markdown](../widget/Markdown.md) and [CodeViewer](../widget/CodeViewer.md) widgets.

## When to use
- Show user-written or file-provided markdown in your app.
- Render highlighted code snippets.
- Sanitize text before inserting it into the DOM (`escapeHtml`).

## Import

```javascript
import { parseMarkdown, markdownToWidgets, escapeHtml } from "flet-box";
```

## Functions

| Function | Signature | Returns | Description |
| --- | --- | --- | --- |
| `markdownToWidgets` | `markdownToWidgets(text, options?)` | `Widget[]` | Markdown → FletBox widgets. This is the real renderer. |
| `parseMarkdownToWidgets` | `parseMarkdownToWidgets(text, options?)` | `Widget[]` | Alias of `markdownToWidgets`. |
| `parseInlineToWidgets` | `parseInlineToWidgets(text)` | `Widget[]` | Inline markdown (bold, links, code) → FletBox widgets. |
| `parseMarkdown` | `parseMarkdown(text)` | `string` | Reserved API: currently returns the input unchanged. Use `markdownToWidgets`. |
| `parseInlineMarkdown` | `parseInlineMarkdown(text)` | `string` | Reserved API: currently returns the input unchanged. Use `parseInlineToWidgets`. |
| `tokenize` | `tokenize(code)` | `{ type, value }[]` | Split code into token objects. |
| `generateHighlightedHtml` | `generateHighlightedHtml(code)` | `string` | Code → highlighted HTML. |
| `escapeHtml` | `escapeHtml(text)` | `string` | Escape `<`, `>`, `&`, quotes so text is safe as HTML. |
| `highlightColors` | const | `Record<string, string>` | The token color map used by the highlighter. |

`markdownToWidgets` options: `{ codeMaxHeight?: number, codeFontSize?: number }`.

## Examples

### Everyday example

```javascript
import { Column, markdownToWidgets } from "flet-box";

Column({
  padding: 16,
  children: markdownToWidgets("# Hello\n\n**bold** and a [link](https://example.com)"),
});
```

### Full example

```javascript
import { Column, parseInlineToWidgets, generateHighlightedHtml, escapeHtml } from "flet-box";

const note = Column({
  children: parseInlineToWidgets("Read the **docs** today"),
});

const code = generateHighlightedHtml("const x = 1;");
const safe = escapeHtml(userInput); // safe to put into innerHTML
```

## Notes

- `markdownToWidgets` builds real widget elements (headings, paragraphs, code blocks, lists) that you can place inside any container — this is what the `Markdown` widget uses.
- `parseMarkdown` and `parseInlineMarkdown` are reserved placeholders that currently pass text through unchanged; the widget rendering is `markdownToWidgets`/`parseInlineToWidgets`.
- `escapeHtml` should be used for **any** text you insert into the DOM that you did not write yourself. Never trust raw input.
- `tokenize` returns flat token objects and is the base for custom highlighters; `highlightColors` lets you theme them.

## Related pages
- [Themes](theme.md) — previous chapter.
- [Visual effects](visual-effects.md) — next chapter.
- [Markdown widget](../widget/Markdown.md) and [CodeViewer widget](../widget/CodeViewer.md).

---

## Continue reading

- **Previous:** [Themes](theme.md)
- **Next:** [Visual effects](visual-effects.md)
- **Index:** [Tools index](README.md) · [The FletBox Book](../README.md)

You are reading **Chapter 10 · Tools & Utilities** (8 of 12).