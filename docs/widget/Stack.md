# Stack

## Overview
`Stack` layers its children on top of each other. It renders a `<div>` with `position: relative` and `display: block`. Children given `position: "absolute"` with `top`/`right`/`bottom`/`left` are placed relative to the stack, which is ideal for badges over avatars, image overlays, and floating labels.

## When to use
- Overlay one widget on top of another (a badge on an avatar, a caption over an image).
- Absolutely position children within a bounded area.
- Build layered visuals without manual CSS positioning.

## Import

```javascript
import { Stack } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Stack, Text } from "flet-box";

Stack({
  width: 140,
  height: 120,
  children: [
    Text({ text: "Background" }),
    Text({ text: "On top", position: "absolute", top: 8, left: 8 }),
  ],
});
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | array of Widget | — | Child widgets; later children paint above earlier ones. |
| `position` | string | `'relative'` | Positioning context for absolutely placed children. |
| `display` | string | `'block'` | CSS `display`. |
| `boxSizing` | string | `'border-box'` | Box-sizing model. |

These are the props specific to `Stack`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Examples

### Everyday example

```javascript
import { Container, Stack, Text } from "flet-box";

Stack({
  width: 220,
  height: 120,
  children: [
    Container({ width: "100%", height: "100%", bgColor: "#2563eb", borderRadius: 12 }),
    Text({ text: "Overlay label", color: "#ffffff", position: "absolute", bottom: 10, left: 12 }),
  ],
});
```

### Full example

```javascript
import { Container, Icon, Stack, Text } from "flet-box";

Stack({
  width: 56,
  height: 56,
  children: [
    Container({
      width: 56, height: 56, borderRadius: 28, bgColor: "#e0e7ff",
      alignItems: "center", justifyContent: "center",
      child: Icon({ name: "person", color: "#4338ca" }),
    }),
    Container({
      position: "absolute", top: 0, right: 0,
      width: 20, height: 20, borderRadius: 10, bgColor: "#ef4444",
      alignItems: "center", justifyContent: "center",
      child: Text({ text: "3", size: 11, color: "#ffffff", weight: "bold" }),
    }),
  ],
});
```

## Notes

- To place a child at a specific spot, give that child `position: "absolute"` plus `top`/`right`/`bottom`/`left`.
- Children later in the array render above earlier ones; use `zIndex` to override the order.

## Related widgets
- [Container](Container.md)
- [Row](Row.md)
- [Column](Column.md)
- [Badge](Badge.md)
- [Avatar](Avatar.md)

---

## Continue reading

- **Previous:** [Column](Column.md)
- **Next:** [Icon](Icon.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 1 · First steps: the core mental model** (5 of 7).
