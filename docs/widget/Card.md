# Card

## Overview
`Card` renders a `<div>` pre-styled as a raised surface: a `colors.surface` background, `12px` rounded corners, `16px` of inner padding, and a 1px `colors.border` border. Think of it as a `Container` with sensible card defaults — you compose any widgets inside it with `child`/`children`. It has no behavior of its own beyond styling.

## When to use
- Group related content (a profile, a product, a form section) on a distinct bordered surface.
- Wrap content that should read as a "card" with rounded corners and breathing room, without hand-writing the styles.

## Import

```javascript
import { Card } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Card, Text } from "flet-box";

Card({ child: Text({ text: "Card content" }) });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `padding` | number | `16` | Inner spacing in pixels. |
| `borderRadius` | number | `12` | Corner radius in pixels. |
| `bgColor` | Color | `colors.surface` | Background color. |
| `showBorder` | boolean | `true` | When `false`, the border is removed (`border: none`). |
| `borderWidth` | number | `1` | Border thickness in pixels (only when `showBorder`). |
| `borderStyle` | string | `'solid'` | CSS border style (only when `showBorder`). |
| `borderColor` | Color | `colors.border` | Border color (only when `showBorder`). |
| `elevation` | number | `2` | Shadow level forwarded to the factory. See Notes — it does not currently render a visible shadow. |

These are the props specific to `Card`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Examples

### Everyday example

```javascript
import { Card, Column, Text, colors } from "flet-box";

Card({
  padding: 20,
  borderRadius: 16,
  bgColor: colors.surface,
  child: Column({
    gap: 6,
    children: [
      Text({ text: "Account", size: 18, weight: "bold" }),
      Text({ text: "jane@example.com", color: colors.textSecondary }),
    ],
  }),
});
```

### Full example

```javascript
import { Button, Card, Column, Divider, Row, Text, colors } from "flet-box";

Card({
  width: 320,
  padding: 0,
  borderRadius: 20,
  showBorder: false,
  child: Column({
    children: [
      Text({ text: "Pro plan", size: 20, weight: "bold", padding: 20 }),
      Divider({ margin: 0, color: colors.border }),
      Column({
        gap: 8,
        padding: 20,
        children: [
          Text({ text: "Unlimited projects", color: colors.textSecondary }),
          Text({ text: "Priority support", color: colors.textSecondary }),
        ],
      }),
      Row({
        padding: 20,
        justifyContent: "flex-end",
        children: [
          Button({ text: "Upgrade", onPress: () => console.log("upgrade") }),
        ],
      }),
    ],
  }),
});
```

## Notes

- Renders a plain `<div>`; it is effectively a `Container` pre-styled with `colors.surface`, `borderRadius: 12`, `padding: 16`, and a 1px `colors.border` border.
- `showBorder: false` sets `border: none`. Otherwise the border string is built from `borderWidth`, `borderStyle`, and `borderColor`.
- `elevation` is forwarded to the widget factory, but unlike `Button` (which maps `0`–`5` to a preset shadow table) `Card` does not convert it into a real `box-shadow`, so it has no visible effect. Use the common `shadow`/`boxShadow` prop when you need an actual shadow.
- Numeric props are pixels via the framework's rem/16 system: `padding: 16` becomes `1rem`, which computes to `16px`.

## Related widgets
- [Container](Container.md)
- [Column](Column.md)
- [Row](Row.md)
- [Divider](Divider.md)
- [ListTile](ListTile.md)
- [Text](Text.md)

---

## Continue reading

- **Previous:** [Rating](Rating.md)
- **Next:** [Divider](Divider.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 3 · Layout, cards and lists** (1 of 8).
