# Icon

## Overview
`Icon` renders a Material Icons glyph by name. It outputs a `<span class="material-icons">` whose text is the icon ligature, so the Material Icons font must be loaded in your page for glyphs to appear. Set the glyph with `name` (or `icon`) and size/color it like text.

## When to use
- Show a recognizable symbol (search, settings, favorite) next to text or inside a button.
- Render status or action glyphs consistently across the app.

## Import

```javascript
import { Icon } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Icon } from "flet-box";

Icon({ name: "favorite" });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | string | `''` | Material Icons ligature name, e.g. `"favorite"`, `"search"`. Alias: `icon`. |
| `size` | number | `24` | Icon size in pixels. |
| `color` | Color | `colors.textSecondary` | Icon color. |

These are the props specific to `Icon`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Examples

### Everyday example

```javascript
import { Icon, Row, Text } from "flet-box";

Row({
  gap: 6,
  alignItems: "center",
  children: [
    Icon({ name: "star", color: "#f59e0b", size: 20 }),
    Text({ text: "4.8", size: 14 }),
  ],
});
```

### Full example

```javascript
import { Container, Icon } from "flet-box";

Container({
  width: 48,
  height: 48,
  borderRadius: 24,
  bgColor: "#eef2ff",
  alignItems: "center",
  justifyContent: "center",
  child: Icon({ name: "notifications", size: 24, color: "#4338ca" }),
});
```

## Notes

- Requires the Material Icons font. Add it to your HTML: `<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">`.
- `Button`, `Input`, `Dropdown`, and `Rating` use `Icon` internally, so they need the font too.
- `name` is the icon ligature — the same names listed in the Material Icons library.

## Related widgets
- [Text](Text.md)
- [Button](Button.md)
- [Image](Image.md)
- [Avatar](Avatar.md)

---

## Continue reading

- **Previous:** [Stack](Stack.md)
- **Next:** [Image](Image.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 1 · First steps: the core mental model** (6 of 7).
