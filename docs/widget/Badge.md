# Badge

## Overview
`Badge` decorates a `child` with a small count pill. When there is something to show, it wraps `child` in a `Stack` (`display: inline-block`, `position: relative`) and overlays an absolutely-positioned pill on one of four corners. When there is nothing to show (no `value`, or a `value` of `0`/`""` while `showZero` is false), it returns `child` unchanged — no wrapper. So the returned element is either the `Stack` wrapper or your bare `child`.

## When to use
- Show an unread count or alert on an icon (a bell, a cart, an avatar).
- Overlay a small numeric or string label on the corner of another widget.

## Import

```javascript
import { Badge } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Badge, Icon } from "flet-box";

Badge({ value: 3, child: Icon({ name: "notifications" }) });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | number or string | — | Badge content. Numbers above `max` render as `"<max>+"`. |
| `child` | Widget | — | The element to decorate (must be an `HTMLElement`). |
| `bgColor` | Color | `colors.secondary` | Pill background color. |
| `color` | Color | `colors.text` | Pill text color. |
| `size` | number | `20` | Pill height and min-width in pixels; the text is `size * 0.55`. |
| `position` | `'top-right'`, `'top-left'`, `'bottom-right'`, `'bottom-left'` | `'top-right'` | Corner the pill sits on. |
| `offset` | number | `0` | Pushes the pill outward from the corner. |
| `borderWidth` | number | `2` | Pill border width in pixels. |
| `borderColor` | Color | `colors.surface` | Pill border color (the ring that separates it from the child). |
| `showZero` | boolean | `false` | Whether a `value` of `0` is shown. |
| `max` | number | `99` | Numeric values above this render as `"<max>+"`. |

These are the props specific to `Badge`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Instance methods

When the badge is shown (a `Stack` wrapper is returned), that wrapper exposes:

- `updateValue(newValue)` — sets the pill text (applying `max`) and shows or hides the pill.

If `Badge` returned the bare `child` instead (nothing to show), there is no `updateValue`.

## Examples

### Everyday example

```javascript
import { Badge, Icon, colors } from "flet-box";

Badge({
  value: 5,
  bgColor: colors.danger,
  child: Icon({ name: "shopping_cart", size: 28 }),
});
```

### Full example

```javascript
import { Badge, Icon, colors } from "flet-box";

const bell = Badge({
  value: 120,
  max: 99,
  size: 22,
  position: "top-right",
  offset: 4,
  bgColor: colors.danger,
  borderColor: colors.surface,
  child: Icon({ name: "notifications", size: 32 }),
});

// value 120 with max 99 renders "99+"
// bell.updateValue(0); // hides the pill (showZero defaults to false)
```

## Notes

- When there is nothing to show, `Badge` returns `child` directly (or `null` if there is no child) — no `Stack` wrapper and no `updateValue`. The pill is hidden when `value` is `undefined`/`null`/`""`, or when it is the number `0` and `showZero` is false.
- When shown with a valid `child`, the return value is a `Stack` (`display: inline-block`, `position: relative`) containing your child plus the absolutely-positioned pill.
- `max` only affects numbers: a numeric `value` greater than `max` renders as `"<max>+"` (for example `120` → `"99+"`). Strings are shown as-is.
- The pill is a factory `div` with a `Text` inside; `borderWidth`/`borderColor` draw the ring that separates it from the child.
- If `child` is not an `HTMLElement`, `Badge` logs a warning and returns just the pill.
- The pill does not subscribe to theme changes. `bgColor` defaults to `colors.secondary` and `color` to `colors.text`, so the pill always renders with those (or whatever you pass) and keeps them on theme switches.
- The pill overlays the child with absolute positioning plus a `transform`, so it can extend beyond the child's box; `offset` nudges it further out.

## Related widgets
- [Avatar](Avatar.md)
- [Chip](Chip.md)
- [Icon](Icon.md)
- [Stack](Stack.md)
- [Text](Text.md)

---

## Continue reading

- **Previous:** [Avatar](Avatar.md)
- **Next:** [Chip](Chip.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 3 · Layout, cards and lists** (7 of 8).
