# Chip

## Overview
`Chip` renders a compact pill for a tag, filter, or attribute. The returned element is an outer `<div>` (`display: inline-block`) wrapping an inner `Row` that holds an optional leading `Icon`, the `label` `Text`, and an optional delete ("close") icon. `variant` switches between filled (a colored background) and outlined (transparent with a colored border).

## When to use
- Show tags, keywords, filters, or selected attributes.
- Offer a removable token (with `onDelete`) or a tappable filter chip (with `onPress`).

## Import

```javascript
import { Chip } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Chip } from "flet-box";

Chip({ label: "Tag" });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | string | — | Chip text. |
| `icon` | string | — | Leading Material icon name. |
| `variant` | `'filled'`, `'outlined'` | `'filled'` | Filled = colored background; outlined = transparent with a colored border. |
| `color` | Color | `colors.primary` | Filled background, or the outlined border/text color. |
| `textColor` | Color | — | Overrides the label/icon color. Defaults: filled → `#fff`, outlined → `color`. |
| `borderColor` | Color | — | Outlined border color (defaults to `color`). |
| `onPress` | function | — | Click handler; makes the chip tappable (pointer cursor + hover). |
| `onDelete` | function | — | Adds a trailing "close" icon; clicking it fires `onDelete` and stops propagation. |
| `borderRadius` | number | `32` | Corner radius in pixels. |
| `padding` | number or string | `'4px 12px'` | Inner padding of the pill. |
| `gap` | number | `4` | Space between the icon, label, and delete button. |
| `size` | number | `12` | Font size (and icon size) in pixels. |
| `elevation` | number | `0` | When greater than 0, adds a `box-shadow` to the pill. |

These are the props specific to `Chip`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Examples

### Everyday example

```javascript
import { Chip, Row } from "flet-box";

Row({
  gap: 8,
  children: [
    Chip({ label: "React", icon: "star" }),
    Chip({ label: "Vue", variant: "outlined" }),
    Chip({ label: "Svelte", onDelete: () => console.log("removed") }),
  ],
});
```

### Full example

```javascript
import { Chip, Row, colors } from "flet-box";

Row({
  gap: 8,
  children: [
    Chip({
      label: "FletBox",
      icon: "rocket_launch",
      variant: "filled",
      color: colors.primary,
      size: 14,
      elevation: 2,
      onPress: () => console.log("filter by fletbox"),
    }),
    Chip({
      label: "Removable",
      variant: "outlined",
      color: colors.danger,
      borderColor: colors.danger,
      textColor: colors.danger,
      borderRadius: 8,
      onDelete: () => console.log("remove"),
    }),
  ],
});
```

## Notes

- Two layers: the returned element is an outer `<div>` (`display: inline-block`) that carries the cursor and click handler, wrapping an inner `Row` that draws the visible pill. Visual props such as `borderRadius`, `padding`, and `elevation` land on the inner pill, not the outer element.
- `variant: "filled"` (default) uses `color` as the background with white text; `variant: "outlined"` is transparent with a `1px solid` border in `borderColor` (default `color`) and text in `textColor` (default `color`).
- `onDelete` appends a Material `"close"` icon; clicking it calls `onDelete` and `stopPropagation`, so it will not also trigger `onPress`.
- `onPress` adds a pointer cursor and a hover effect (filled dims to 0.85 opacity; outlined tints the background).
- `size` is the label font size in pixels and also the leading icon size; the delete icon is `size - 2`.
- `elevation > 0` builds a real `box-shadow` on the pill (`0 Npx 2Npx rgba(0,0,0,0.1)`).
- Icons require the Material Icons font (see [Icon](Icon.md)).

## Related widgets
- [Badge](Badge.md)
- [Button](Button.md)
- [Row](Row.md)
- [Icon](Icon.md)
- [Text](Text.md)

---

## Continue reading

- **Previous:** [Badge](Badge.md)
- **Next:** [AlertDialog](AlertDialog.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 3 · Layout, cards and lists** (8 of 8).
