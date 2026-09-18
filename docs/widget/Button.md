# Button

## Overview
`Button` renders a clickable `<button>` with built-in variants, sizes, icons, and elevation. It composes a `Text` label and optional Material `Icon`s, and supports filled, outlined, and text styles. Use `onPress` (or `onClick`) for the click handler.

## When to use
- Trigger an action: submit, save, cancel, or navigate.
- Present a primary or secondary choice with `variant` and `size`.
- Add an icon with `icon` + `iconPosition`, or `iconLeft`/`iconRight`/`iconTop`/`iconBottom`.

## Import

```javascript
import { Button } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Button } from "flet-box";

Button({ text: "Click me", onPress: () => console.log("pressed") });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | string | — | Button label. |
| `onPress` | function | — | Click handler. Aliases: `onClick`, `onclick`. Ignored when `disabled`. |
| `variant` | `'filled'`, `'outlined'`, `'text'` | `'filled'` | Visual style. |
| `size` | `'small'`, `'medium'`, `'large'` | `'medium'` | Preset for padding, font size, gap, and icon size. |
| `bgColor` | Color | `colors.surface` | Background. Filled uses `gradient`, else `bgColor`, else `colors.primary`. |
| `color` | Color | `colors.text` | Text and icon color. |
| `borderRadius` | number | `24` | Corner radius in pixels. |
| `elevation` | number `0`–`5` | `2` | Preset shadow level (not a CSS value). |
| `disabled` | boolean | `false` | Disables clicks and shows the non-interactive state. |
| `fullWidth` | boolean | `false` | Stretch to 100% width. |
| `gradient` | string | — | CSS gradient background; overrides `bgColor` when set. |
| `icon` | string | — | Material Icon name; placed by `iconPosition`. |
| `iconPosition` | `'left'`, `'right'`, `'top'`, `'bottom'` | `'left'` | Where `icon` is placed. |
| `iconLeft / iconRight / iconTop / iconBottom` | string | — | Explicit icon name per side. |
| `padding` | number or `[v, h]` | size preset | Overrides the preset padding. A number `n` becomes `[n, n*2]`. |
| `margin` | number or `[v, h]` | — | Outer spacing. |

These are the props specific to `Button`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Examples

### Everyday example

```javascript
import { Button } from "flet-box";

Button({
  text: "Save changes",
  variant: "filled",
  size: "medium",
  bgColor: "#2563eb",
  color: "#ffffff",
  onPress: () => console.log("saved"),
});
```

### Full example

```javascript
import { Button, Row } from "flet-box";

Row({
  gap: 12,
  children: [
    Button({ text: "Download", icon: "download", iconPosition: "left", elevation: 3, onPress: () => console.log("download") }),
    Button({ text: "Outlined", variant: "outlined", bgColor: "#2563eb", onPress: () => console.log("outlined") }),
    Button({ text: "Disabled", disabled: true }),
  ],
});
```

## Notes

- `filled` uses `bgColor` (default theme `surface`); `outlined` draws a 2px border in `color`/`bgColor`; `text` has no background or border.
- `elevation` maps `0`–`5` to preset shadows, not a pixel value.
- Icons require the Material Icons font (see [Icon](Icon.md)).
- `disabled` sets a `not-allowed` cursor, opacity 0.6, and ignores `onPress`.

## Related widgets
- [Input](Input.md)
- [Icon](Icon.md)
- [Text](Text.md)
- [FloatingActionButton](FloatingActionButton.md)
- [Row](Row.md)

---

## Continue reading

- **Previous:** [Image](Image.md)
- **Next:** [Input](Input.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (1 of 8).
