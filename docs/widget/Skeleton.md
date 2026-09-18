# Skeleton

## Overview
`Skeleton` renders loading placeholders: gray `<div>` blocks that mimic the shape of content that hasn't arrived yet. It returns a full-width flex-column container holding `count` copies of the chosen `variant` — simple blocks (`text`, `circular`, `avatar`, `image`, `button`) or pre-composed layouts (`card`, `listTile`). Each block animates with a CSS `pulse` (opacity breathe) or a `wave` (moving gradient shimmer) injected once into `document.head` as `#skeleton-styles`.

## When to use
- Show a loading state that mirrors the real layout: article lines, avatars, cards, list rows.
- Replace spinners when you know the shape of the incoming content.
- Render N repeated placeholders with `count` and `gap` while a list loads.

## Import

```javascript
import { Skeleton } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Skeleton } from "flet-box";

Skeleton({ variant: "text", count: 3 });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'text'`, `'circular'`, `'avatar'`, `'image'`, `'card'`, `'listTile'`, `'button'` | `'text'` | Placeholder shape. `card` and `listTile` are composite layouts; the rest are single blocks. |
| `width` | number or string | variant default | Block width (numbers are pixels). Ignored by the composite `card`/`listTile` variants. |
| `height` | number or string | variant default | Block height. Ignored by `card`/`listTile`. |
| `borderRadius` | number or string | variant default | Corner radius (`'50%'` for circular shapes). Ignored by `card`/`listTile`. |
| `animation` | `'pulse'`, `'wave'`, `'none'` | `'pulse'` | `pulse` breathes opacity 1→0.5→1; `wave` slides a `bgColor`/`highlightColor` gradient; `none` is static. |
| `count` | number | `1` | How many placeholder blocks to render. |
| `gap` | number | `8` | Vertical gap between blocks in pixels. |
| `bgColor` | Color | `colors.gray200` | Base block color (and the wave's edge color). |
| `highlightColor` | Color | `colors.gray100` | Wave shimmer highlight. |
| `shimmerColor` | Color | `colors.gray300` | Accepted but currently unused by the pulse/wave styles. |
| `pulseDuration` | string | `'1.5s'` | CSS duration of the pulse loop. |
| `waveDuration` | string | `'1.5s'` | CSS duration of the wave loop. |

Variant defaults: `text` 100%×16px (r4), `circular` 48×48px (round), `avatar` 40×40px (round), `image` 100%×150px (r8), `button` 120×36px (r24), `card` 100%×120px image area + two text lines, `listTile` 40px avatar + two text lines.

`Skeleton` builds a fixed internal structure and does not forward extra props, so [common props](COMMON_PROPS.md) do not reach the container — wrap it in a `Container` when you need outer spacing or styling.

## Examples

### Everyday example

```javascript
import { Column, Skeleton } from "flet-box";

// Fake "loading article" placeholder
Column({
  gap: 12,
  children: [
    Skeleton({ variant: "image", height: 180 }),
    Skeleton({ variant: "text", count: 3, gap: 8 }),
  ],
});
```

### Full example

```javascript
import { Column, Row, Skeleton, colors } from "flet-box";

const listPlaceholder = Row({
  gap: 12,
  alignItems: "center",
  children: [
    Skeleton({ variant: "avatar", animation: "wave" }),
    Column({
      gap: 6,
      children: [
        Skeleton({ variant: "text", width: "60%", height: 14 }),
        Skeleton({ variant: "text", width: "40%", height: 12 }),
      ],
    }),
  ],
});

Column({
  gap: 16,
  children: [
    Skeleton({ variant: "card", animation: "wave", waveDuration: "1.8s" }),
    Skeleton({ variant: "listTile", count: 3, gap: 12 }),
    Skeleton({ variant: "button", bgColor: colors.gray300, animation: "none" }),
    listPlaceholder,
  ],
});
```

## Notes

- The returned element is always the outer column container, even for `count: 1` — the placeholder block is its first child.
- `card` and `listTile` ignore `width`/`height`/`borderRadius`; their internal parts (avatar 40px, image 120px, text lines at 80%/60%/90%/70% widths) are fixed. Use `count` to repeat them.
- The `skeleton-pulse` and `skeleton-wave` keyframes are injected once into `document.head` (`#skeleton-styles`) and shared by all skeletons.
- `wave` sets its own `background` gradient, which replaces the flat `bgColor` background while animating.
- Unknown `variant` values fall back to a 100%×20px block (r4).

## Related widgets
- [ProgressBar](ProgressBar.md)
- [CircularBar](CircularBar.md)
- [Card](Card.md)
- [ListTile](ListTile.md)
- [Column](Column.md)

---

## Continue reading

- **Previous:** [CircularBar](CircularBar.md)
- **Next:** [FloatingActionButton](FloatingActionButton.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 4 · Feedback and overlays** (8 of 10).
