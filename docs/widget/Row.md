# Row

## Overview
`Row` lays out its children horizontally, left to right. It renders a `<div>` with `display: flex` and `flexDirection: row`, and is full-width by default. Use `gap` for spacing and `justifyContent`/`alignItems` to position children along and across the axis.

## When to use
- Place widgets side by side (icon + label, label + control).
- Distribute horizontal space with `justifyContent` (e.g. `"space-between"`).
- Align children vertically with `alignItems` (alias `align`).

## Import

```javascript
import { Row } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Row, Text } from "flet-box";

Row({
  gap: 8,
  children: [Text({ text: "Left" }), Text({ text: "Right" })],
});
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | array of Widget | — | Child widgets laid out left to right. |
| `child` | Widget | — | A single child. |
| `gap` | number | — | Space between children, in pixels. |
| `justifyContent` | string | — | Main-axis (horizontal) distribution. Alias: `justify`. |
| `alignItems` | string | — | Cross-axis (vertical) alignment. Alias: `align`. |
| `width` | Size | `'100%'` | Row width; full width by default. |
| `height` | Size | `'auto'` | Row height. |
| `display` | string | `'flex'` | CSS `display`. |
| `flexDirection` | string | `'row'` | Main-axis direction. |
| `boxSizing` | string | `'border-box'` | CSS `box-sizing` model. |

These are the props specific to `Row`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Examples

### Everyday example

```javascript
import { Button, Row, Text } from "flet-box";

Row({
  gap: 12,
  justifyContent: "space-between",
  alignItems: "center",
  children: [
    Text({ text: "Account", size: 18, weight: "bold" }),
    Button({ text: "Save", onPress: () => console.log("saved") }),
  ],
});
```

### Full example

```javascript
import { Icon, Row, Text } from "flet-box";

Row({
  gap: 10,
  alignItems: "center",
  padding: 12,
  bgColor: "#f8fafc",
  borderRadius: 10,
  children: [
    Icon({ name: "favorite", color: "#e11d48" }),
    Text({ text: "Liked by 128 people", size: 14 }),
  ],
});
```

## Notes

- Full width (`100%`) by default — set `width` to shrink it to content.
- For vertical stacking, use [Column](Column.md). Add `wrap: "wrap"` to let children flow onto new lines.

## Related widgets
- [Column](Column.md)
- [Container](Container.md)
- [Stack](Stack.md)
- [Icon](Icon.md)
- [Text](Text.md)

---

## Continue reading

- **Previous:** [Container](Container.md)
- **Next:** [Column](Column.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 1 · First steps: the core mental model** (3 of 7).
