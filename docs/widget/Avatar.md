# Avatar

## Overview
`Avatar` renders a `<div>` (inline-flex, centered, `overflow: hidden`) that shows a user's picture, an icon, or their initials. Content is chosen by priority: `src` renders a cover-fit `Image`; otherwise `icon` renders a Material `Icon`; otherwise `name` renders an initials `Text`; otherwise a default `"person"` icon is shown. `shape` controls the corner radius.

## When to use
- Show a user's profile picture, or fall back to their initials when there is no picture.
- Represent a person, team, or account in a list, header, or comment.

## Import

```javascript
import { Avatar } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Avatar } from "flet-box";

Avatar({ name: "Jane Doe" });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | string | — | Image URL. When set, renders a cover-fit `Image`. |
| `name` | string | — | Full name; its initials are shown when there is no `src`/`icon`. |
| `icon` | string | — | Material icon name; used when there is no `src`. |
| `size` | number | `40` | Width and height in pixels. Also scales the initials (`size * 0.4`) and icon (`size * 0.5`). |
| `fontSize` | number | `16` | Base font-size on the container. |
| `shape` | `'circle'`, `'rounded'`, `'square'` | `'circle'` | Corner radius: `50%`, `size * 0.2`px, or `0`. |
| `bgColor` | Color | `colors.primary` | Background color. |
| `textColor` | Color | `colors.text` | Color of the initials or icon. |
| `onPress` | function | — | Click handler; adds a pointer cursor and a hover scale. |

These are the props specific to `Avatar`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Instance methods

The returned element exposes:

- `updateContent(newProps)` — updates `src`/`name`/`icon`/`bgColor`/`size` and rebuilds the inner content (image, icon, or initials) in place.

## Examples

### Everyday example

```javascript
import { Avatar, Row, Text } from "flet-box";

Row({
  gap: 12,
  alignItems: "center",
  children: [
    Avatar({ src: "/jane.jpg", size: 48 }),
    Text({ text: "Jane Doe", weight: "bold" }),
  ],
});
```

### Full example

```javascript
import { Avatar, Column, colors } from "flet-box";

const avatar = Avatar({
  name: "John Doe",
  size: 64,
  shape: "rounded",
  bgColor: colors.secondary,
  textColor: "#ffffff",
  onPress: () => console.log("open profile"),
});

Column({
  gap: 12,
  alignItems: "center",
  children: [
    avatar,
    Avatar({ icon: "group", size: 48, bgColor: colors.info }),
    Avatar({ size: 40 }), // no src/icon/name -> default "person" icon
  ],
});

// avatar.updateContent({ name: "Alice Smith" }); // initials become "AS"
```

## Notes

- Renders a `<div>` with `display: inline-flex`, centered content, and `overflow: hidden`.
- Content priority is `src` → `icon` → `name` → a default `"person"` icon. Only one is shown.
- Initials: two or more words take the first initial of the first and last word, uppercased ("John Doe" → "JD"); a single word takes its first character; an empty or missing name yields "?".
- `shape` sets the radius: `circle` → `50%`, `rounded` → `size * 0.2`px, `square` → `0`.
- `size` drives width/height and scales the inner content (initials use `size * 0.4`, icons use `size * 0.5`); `fontSize` only sets the container's base font-size.
- `onPress` adds a pointer cursor and a hover `scale(1.05)` effect.
- Icons require the Material Icons font (see [Icon](Icon.md)).

## Related widgets
- [Badge](Badge.md)
- [Icon](Icon.md)
- [Image](Image.md)
- [ListTile](ListTile.md)
- [Text](Text.md)

---

## Continue reading

- **Previous:** [GridView](GridView.md)
- **Next:** [Badge](Badge.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 3 · Layout, cards and lists** (6 of 8).
