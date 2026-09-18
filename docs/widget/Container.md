# Container

## Overview
`Container` is the basic box for grouping and styling content. It renders a `<div>` that is a flex **column** by default, so children stack vertically. Use it to wrap one `child` or several `children` with padding, margin, background, border, radius, and shadow.

## When to use
- Group and style a section of the screen (a card, a panel, a page wrapper).
- Add spacing (`padding`/`margin`), a background, border, radius, or shadow.
- Control layout direction with `display`/`flexDirection` (defaults to a vertical flex column).

## Import

```javascript
import { Container } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Container, Text } from "flet-box";

Container({
  padding: 16,
  child: Text({ text: "A simple box" }),
});
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `child` | Widget | — | A single child widget. |
| `children` | array of Widget | — | Multiple child widgets. |
| `display` | string | `'flex'` | CSS `display`. |
| `flexDirection` | string | `'column'` | Main-axis direction; children stack vertically by default. |
| `overflow` | string | `'auto'` | Overflow behavior. |
| `boxSizing` | string | `'border-box'` | Box-sizing model. |
| `bgColor` | Color | `colors.surface` | Background color. Aliases: `backgroundColor`, `bg`. |

These are the props specific to `Container`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Examples

### Everyday example

```javascript
import { Container, Text } from "flet-box";

Container({
  padding: 20,
  margin: 16,
  bgColor: "#eff6ff",
  borderRadius: 12,
  child: Text({ text: "A comfortable blue card" }),
});
```

### Full example

```javascript
import { Column, Container, Text } from "flet-box";

Container({
  width: 320,
  padding: 24,
  bgColor: "#ffffff",
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
  child: Column({
    gap: 8,
    children: [
      Text({ text: "Card title", type: "h3", size: 20, weight: "bold" }),
      Text({ text: "Container groups and styles its children." }),
    ],
  }),
});
```

## Notes

- Defaults to `display: flex` + `flexDirection: column`; use `flexDirection: "row"` (or `Row`) for horizontal flow.
- The background defaults to the theme `surface` color, so it adapts to light/dark automatically.

## Related widgets
- [Row](Row.md)
- [Column](Column.md)
- [Stack](Stack.md)
- [Card](Card.md)
- [Text](Text.md)

---

## Continue reading

- **Previous:** [Text](Text.md)
- **Next:** [Row](Row.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 1 · First steps: the core mental model** (2 of 7).
