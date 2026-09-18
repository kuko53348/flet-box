# Divider

## Overview
`Divider` renders a `<div>` used as a thin rule. Horizontal (the default) it spans the full width and is `thickness` tall; vertical it is `thickness` wide and fills the available height. The line color comes from `color`, applied as `background-color`. It is a styled bar, not a native `<hr>`.

## When to use
- Separate stacked sections of content with a thin horizontal rule.
- Split items inside a `Row` with a vertical rule (`orientation: "vertical"`).

## Import

```javascript
import { Divider } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Divider } from "flet-box";

Divider();
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `color` | Color | `colors.surface` | Line color (applied as `background-color`). |
| `thickness` | number | `1` | Cross-axis thickness in pixels — the height when horizontal, the width when vertical. |
| `orientation` | `'horizontal'`, `'vertical'` | `'horizontal'` | Direction of the rule. |
| `margin` | number, object, or string | `16` | Space around the rule. A number applies to the two cross-axis sides (top/bottom when horizontal, left/right when vertical); an object accepts `{ top, bottom, left, right }`; a string is applied verbatim and overrides the rest. |
| `width` | Size | `'100%'` | Length of a horizontal rule. |
| `height` | Size | `'100%'` | Length of a vertical rule. |
| `flexShrink` | number | `0` | Keeps the rule from shrinking inside flex layouts. |
| `marginTop / marginBottom / marginLeft / marginRight` | number | — | Per-side margins; these take priority over the `margin` number/object. |

These are the props specific to `Divider`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Examples

### Everyday example

```javascript
import { Column, Divider, Text, colors } from "flet-box";

Column({
  gap: 12,
  children: [
    Text({ text: "Section one" }),
    Divider({ color: colors.border, margin: 4 }),
    Text({ text: "Section two" }),
  ],
});
```

### Full example

```javascript
import { Divider, Row, Text, colors } from "flet-box";

Row({
  gap: 12,
  alignItems: "center",
  children: [
    Text({ text: "Left" }),
    Divider({
      orientation: "vertical",
      height: 24,
      thickness: 2,
      color: colors.border,
      margin: 0,
    }),
    Text({ text: "Right" }),
  ],
});
```

## Notes

- Renders a `<div>`, not a native `<hr>`.
- The default `color` is `colors.surface` (a very light gray), so on a white background the default rule is nearly invisible. Pass `color: colors.border` (or your own) for a visible line.
- Horizontal rules set `height: thickness` and `width: width`; vertical rules set `width: thickness`, `height: height`, and `minHeight: 1`.
- Margin priority is: individual `marginTop`/`marginBottom`/`marginLeft`/`marginRight` first, then a `margin` object, then a `margin` number, then defaults. A string `margin` overrides everything.
- Numeric values are pixels via the rem/16 system: `thickness: 2` computes to `2px`.

## Related widgets
- [Card](Card.md)
- [Column](Column.md)
- [Row](Row.md)
- [ListTile](ListTile.md)
- [Container](Container.md)

---

## Continue reading

- **Previous:** [Card](Card.md)
- **Next:** [ListTile](ListTile.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 3 · Layout, cards and lists** (2 of 8).
