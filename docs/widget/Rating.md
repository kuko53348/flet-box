# Rating

## Overview
`Rating` renders a row of star (or custom) icons for scoring. It supports mouse and touch, half values, a live value readout, and read-only display. Colors follow the theme by default. The returned element exposes `setValue`/`getValue` and a `value` property.

## When to use
- Collect or display a 1–`max` score (5 by default).
- Show a read-only rating with `readOnly`.

## Import

```javascript
import { Rating } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Rating } from "flet-box";

Rating({ onChange: (value) => console.log("rated:", value) });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | number | `0` | Current rating (clamped `0`–`max`). |
| `max` | number | `5` | Number of stars. |
| `onChange` | `(value: number) => void` | — | Fires when the rating changes. |
| `readOnly` | boolean | `false` | Display only; disables interaction. |
| `size` | number | `20` | Star size in pixels. |
| `activeColor` | Color | `colors.warning` | Filled star color. |
| `inactiveColor` | Color | `colors.border` | Empty star color. |
| `iconActive` | string | `'star'` | Material icon for a full star. |
| `iconInactive` | string | `'star_border'` | Material icon for an empty star. |
| `iconHalf` | string | `'star_half'` | Material icon for a half star. |
| `allowHalf` | boolean | `false` | Allow `.5` values. |
| `gap` | number | `2` | Space between stars. |
| `showValue` | boolean | `false` | Show the numeric value next to the stars. |
| `valueColor` | Color | `colors.textSecondary` | Color of the value label. |
| `valueSize` | number | `size * 0.7` | Font size of the value label. |

These are the props specific to `Rating`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Instance methods

The returned element exposes:

- `value` — get or set as a property.
- `setValue(v) / getValue()` — sets or returns the current rating.
- `updateStars()` — repaints the stars from the current value.

## Examples

### Everyday example

```javascript
import { Rating } from "flet-box";

Rating({ value: 4, max: 5, showValue: true, allowHalf: true, onChange: (v) => console.log(v) });
```

### Full example

```javascript
import { Column, Rating, Text } from "flet-box";

const rating = Rating({
  max: 5,
  value: 3.5,
  allowHalf: true,
  showValue: true,
  size: 28,
  activeColor: "#f59e0b",
  onChange: (v) => console.log("score:", v),
});

Column({
  gap: 8,
  children: [Text({ text: "Rate your experience", weight: "bold" }), rating],
});

// rating.value = 5;  rating.getValue();
```

## Notes

- Uses Material Icons glyphs, so the font must be loaded (see [Icon](Icon.md)).
- Default colors are theme-aware and update on light/dark changes.
- Supports mouse hover preview and touch/swipe selection.

## Related widgets
- [Slider](Slider.md)
- [Icon](Icon.md)
- [Text](Text.md)
- [Chip](Chip.md)

---

## Continue reading

- **Previous:** [Dropdown](Dropdown.md)
- **Next:** [Card](Card.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (8 of 8).
