# CodeViewer

## Overview
`CodeViewer` shows a syntax-highlighted, read-only block of code built from plain `<div>`s — no `<pre>`, no canvas, no highlighting library. It splits `code` on newlines, runs each line through FletBox's shared tokenizer (`generateHighlightedHtml`, a One-Dark-style palette that knows JS keywords, strings, numbers, comments, functions, plus FletBox widget names and color literals), escapes the HTML, and injects the result into a scrollable panel. An optional title bar and an optional line-number gutter are added around it.

## When to use
- Show a snippet of source code in docs, tutorials, or a settings screen.
- Pretty-print any JavaScript value: a non-string `code` is rendered as `JSON.stringify(code, null, 2)`.
- Display long output in a capped, scrollable box via `maxHeight`.

## Import

```javascript
import { CodeViewer } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { CodeViewer } from "flet-box";

CodeViewer({ code: 'const greet = () => "hello";' });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `code` | string or any | — | Source to display. A non-string is serialized with `JSON.stringify(code, null, 2)`. |
| `title` | string | — | Header bar text. The header only renders when `title` and `showHeader` are both set. |
| `maxHeight` | number or string | `400` | Max height of the scroll area in pixels; content beyond it scrolls. |
| `fontSize` | number or string | `12` | Code (and line-number) font size in pixels. |
| `backgroundColor` | Color | `colors.gray100` | Panel and gutter background. |
| `padding` | number | `12` | Inner padding in pixels; the gutter uses half of it on the right. |
| `borderRadius` | number | `8` | Panel corner radius in pixels. |
| `showHeader` | boolean | `true` | Shows the title bar (needs `title`). |
| `showLineNumbers` | boolean | `false` | Renders a fixed-width gutter with one number per line and one div per code line. |
| `startingLineNumber` | number | `1` | First gutter number; useful for excerpts. |
| `lineNumberWidth` | number | `40` | Gutter width in pixels. |
| `lineNumberColor` | Color | `colors.secondary` | Gutter number color. |

These are the props specific to `CodeViewer`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`. Common props land on the outer container, which is `width: 100%` and a flex column.

## Instance methods

The returned container exposes:

- `updateCode(newCode)` — replaces the code (non-strings are JSON-stringified) and re-renders the panel or the gutter.
- `updateTitle(newTitle)` — changes the header text. It only works if a header was rendered at creation time.
- `scrollTo(x, y)` — scrolls the panel to a pixel offset.
- `scrollToStart()` — scrolls the panel to the left edge.
- `scrollToEnd()` — scrolls the panel to the right edge.

## Examples

### Everyday example

```javascript
import { CodeViewer, colors } from "flet-box";

CodeViewer({
  code: [
    'import { Button } from "flet-box";',
    "",
    'Button({ text: "Save", onPress: () => console.log("saved") });',
  ].join("\n"),
  title: "app.js",
  showLineNumbers: true,
  fontSize: 13,
  backgroundColor: colors.gray100,
});
```

### Full example

```javascript
import { Button, CodeViewer, Column, Row, colors } from "flet-box";

const snippet = `function total(items) {
  // sum the prices
  return items.reduce((sum, item) => sum + item.price, 0);
}

const orders = [{ price: 12.5 }, { price: 7 }];
console.log(total(orders)); // 19.5`;

const viewer = CodeViewer({
  code: snippet,
  title: "total.js",
  maxHeight: 320,
  fontSize: 12,
  backgroundColor: "#1e1e1e",
  padding: 16,
  borderRadius: 12,
  showHeader: true,
  showLineNumbers: true,
  startingLineNumber: 1,
  lineNumberWidth: 44,
  lineNumberColor: colors.secondary,
});

Column({
  gap: 12,
  children: [
    viewer,
    Row({
      gap: 8,
      children: [
        Button({ text: "Show config", onPress: () => viewer.updateCode({ theme: "dark", tabs: 2 }) }),
        Button({ text: "Rename", onPress: () => viewer.updateTitle("config.json") }),
        Button({ text: "To start", onPress: () => viewer.scrollToStart() }),
        Button({ text: "To end", onPress: () => viewer.scrollToEnd() }),
      ],
    }),
  ],
});
```

## Notes

- There is **no `language` prop**: highlighting always uses the JavaScript/FletBox tokenizer, so other languages get partial coloring only.
- Highlighting is per line. Multi-line template literals and block comments are tokenized line by line, so their colors can differ from a real parser.
- All code is HTML-escaped before it is inserted, so `<script>` in your snippet is shown as text, not executed.
- The header renders only when `title` **and** `showHeader` are both truthy, but the panel's corner radius is decided by `title` alone: with `title` set and `showHeader: false` the top corners stay square.
- `updateTitle` cannot create a header that was not rendered initially.
- With `showLineNumbers: false` the code goes into a single `white-space: pre` div; with it on, you get one div per line in two columns (gutter + code).
- Line height is fixed at `1.5` and the font family at `monospace`; both are set inline and are not exposed as props.

## Related widgets
- [Markdown](Markdown.md)
- [Text](Text.md)
- [Container](Container.md)
- [Card](Card.md)
- [Inspector](Inspector.md)

---

## Continue reading

- **Previous:** [Markdown](Markdown.md)
- **Next:** [QRCode](QRCode.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 6 · Data and rich content** (5 of 7).
