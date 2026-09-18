# Column

## Overview
`Column` lays out its children vertically, top to bottom. It renders a `<div>` with `display: flex` and `flexDirection: column`, and is full-width by default. Use `gap` for spacing and `justifyContent`/`alignItems` to position children.

## When to use
- Stack widgets one below another (a form, a list of sections, a page).
- Distribute vertical space with `justifyContent`.
- Align children horizontally with `alignItems` (alias `align`).

## Import

```javascript
import { Column } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Column, Text } from "flet-box";

Column({
  gap: 8,
  children: [Text({ text: "First line" }), Text({ text: "Second line" })],
});
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | array of Widget | — | Child widgets stacked top to bottom. |
| `child` | Widget | — | A single child. |
| `gap` | number | — | Space between children, in pixels. |
| `justifyContent` | string | — | Main-axis (vertical) distribution. Alias: `justify`. |
| `alignItems` | string | — | Cross-axis (horizontal) alignment. Alias: `align`. |
| `width` | Size | `'100%'` | Column width; full width by default. |
| `height` | Size | `'auto'` | Column height. |
| `display` | string | `'flex'` | CSS `display`. |
| `flexDirection` | string | `'column'` | Main-axis direction. |

These are the props specific to `Column`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Examples

### Everyday example

```javascript
import { Button, Column, Input, Text } from "flet-box";

Column({
  gap: 16,
  children: [
    Text({ text: "Sign in", type: "h2", size: 24, weight: "bold" }),
    Input({ label: "Email", placeholder: "you@example.com", fullWidth: true }),
    Input({ label: "Password", type: "password", fullWidth: true }),
    Button({ text: "Continue", fullWidth: true, onPress: () => console.log("submit") }),
  ],
});
```

### Full example

```javascript
import { Column, Container, Text } from "flet-box";

Container({
  padding: 24,
  bgColor: "#ffffff",
  child: Column({
    gap: 12,
    alignItems: "flex-start",
    children: [
      Text({ text: "Settings", type: "h2", size: 22, weight: "bold" }),
      Text({ text: "Profile" }),
      Text({ text: "Notifications" }),
      Text({ text: "Privacy" }),
    ],
  }),
});
```

## Notes

- Full width (`100%`) by default — set `width` to shrink it to content.
- For horizontal layouts, use [Row](Row.md).

## Related widgets
- [Row](Row.md)
- [Container](Container.md)
- [Stack](Stack.md)
- [ListView](ListView.md)
- [Text](Text.md)

---

## Continue reading

- **Previous:** [Row](Row.md)
- **Next:** [Stack](Stack.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 1 · First steps: the core mental model** (4 of 7).
