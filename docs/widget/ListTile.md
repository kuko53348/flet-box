# ListTile

## Overview
`ListTile` renders a `<div>` row made of three parts: an optional `leftItem`, a center column of up to three text lines (`title`, `subtitle`, `description`), and an optional `rightItem`. Internally it composes `Row`, `Column`, and `Text`. Pass `onPress` to make the tile tappable (pointer cursor plus a hover background); `selected` and `disabled` change its appearance.

## When to use
- Build a settings or menu row with a leading icon, a title, supporting text, and a trailing control.
- Render tappable rows inside a `ListView`, `Column`, or `Card`.

## Import

```javascript
import { ListTile } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { ListTile } from "flet-box";

ListTile({ title: "Home" });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | string | — | Primary line. Rendered as a `Text` (size 16, `colors.primary`). |
| `subtitle` | string | — | Second line. `Text` size 13, `colors.textSecondary`. |
| `description` | string | — | Third line. `Text` size 12, `colors.textDisabled`. |
| `leftItem` | Widget | — | Leading slot (e.g. an `Icon` or `Avatar`), placed before the text. |
| `rightItem` | Widget | — | Trailing slot (e.g. a chevron), placed after the text. |
| `onPress` | function | — | Click handler. Makes the tile interactive (pointer cursor + hover). Ignored when `disabled`. |
| `selected` | boolean | `false` | Selected state: uses `selectedBgColor` and renders the title at weight 600. |
| `disabled` | boolean | `false` | Dims the tile (opacity 0.6) and ignores `onPress`. |
| `divider` | boolean | `false` | Appends a 1px `colors.border` line under the tile. |
| `paddingHorizontal` | number | `16` | Left/right inner padding in pixels. |
| `paddingVertical` | number | `12` | Top/bottom inner padding in pixels. |
| `gap` | number | `12` | Space between the leading slot, the text column, and the trailing slot. |
| `elevation` | number | `0` | When greater than 0, adds a `box-shadow` and a hover lift. |
| `borderRadius` | number | `0` | Corner radius in pixels. |
| `bgColor` | Color | `colors.surface` | Background when not selected. |
| `selectedBgColor` | Color | `` `${colors.primary}20` `` | Background when `selected`. |
| `hoverColor` | Color | `colors.border` | Background on hover (interactive and not selected). |
| `titleProps / subtitleProps / descriptionProps` | object | `{}` | Extra props forwarded to each line's `Text`. |

These are the props specific to `ListTile`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Examples

### Everyday example

```javascript
import { Avatar, Icon, ListTile } from "flet-box";

ListTile({
  leftItem: Avatar({ name: "Jane Doe", size: 40 }),
  title: "Jane Doe",
  subtitle: "jane@example.com",
  rightItem: Icon({ name: "chevron_right" }),
  onPress: () => console.log("open profile"),
});
```

### Full example

```javascript
import { Column, Icon, ListTile, colors } from "flet-box";

Column({
  children: [
    ListTile({
      leftItem: Icon({ name: "notifications" }),
      title: "Notifications",
      subtitle: "Push and email",
      rightItem: Icon({ name: "chevron_right" }),
      divider: true,
      onPress: () => console.log("notifications"),
    }),
    ListTile({
      leftItem: Icon({ name: "lock" }),
      title: "Privacy",
      description: "Manage your data",
      selected: true,
      elevation: 2,
      borderRadius: 8,
      hoverColor: colors.gray100,
      titleProps: { size: 18 },
      onPress: () => console.log("privacy"),
    }),
  ],
});
```

## Notes

- The leading and trailing slots are named `leftItem` and `rightItem` — not `leading`/`trailing`.
- The tile composes a `Row` (`leftItem` · text `Column` · `rightItem`); the text column holds up to three `Text` lines built from `title`, `subtitle`, and `description`.
- It is interactive only when `onPress` is set and `disabled` is false; that adds the pointer cursor and the `hoverColor` hover background.
- `disabled` sets opacity 0.6, a default cursor, and ignores `onPress`.
- `divider: true` changes what is returned: the tile is wrapped in a flex-column container with a 1px `colors.border` line beneath it.
- `elevation > 0` builds a real `box-shadow` (`0 Npx 2Npx rgba(0,0,0,0.1)`) and a hover lift — unlike `Card`, this shadow does render.
- When neither `bgColor` nor `selectedBgColor` is passed, the tile subscribes to theme changes and recolors itself; the subscription is torn down on cleanup.
- Icons require the Material Icons font (see [Icon](Icon.md)).

## Related widgets
- [ListView](ListView.md)
- [Avatar](Avatar.md)
- [Icon](Icon.md)
- [Divider](Divider.md)
- [Card](Card.md)
- [Text](Text.md)

---

## Continue reading

- **Previous:** [Divider](Divider.md)
- **Next:** [ListView](ListView.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 3 · Layout, cards and lists** (3 of 8).
