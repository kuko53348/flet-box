# Radio

## Overview
`Radio` renders a custom (non-native) radio dot. Radios that share a `name` form a group: selecting one deselects the others in the same group. The returned element exposes `select`, `unselect`, and `isSelected`.

## When to use
- Let the user choose exactly one option from a set.
- Build mutually exclusive options grouped by `name`.

## Import

```javascript
import { Radio } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Radio } from "flet-box";

Radio({ name: "color", onSelect: (sel) => console.log("selected:", sel) });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `selected` | boolean | `false` | Initial selected state. |
| `onSelect` | `(selected: boolean) => void` | — | Fires when the selection changes. |
| `name` | string | — | Group id. Radios with the same `name` are mutually exclusive. |
| `disabled` | boolean | `false` | Disables interaction. |
| `size` | number | `20` | Diameter in pixels. |

These are the props specific to `Radio`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Instance methods

The returned element exposes:

- `select()` — selects this radio only. It does **not** touch its siblings; group clearing happens when the user *clicks* a radio (see Notes).
- `unselect()` — clears this radio's selection.
- `isSelected()` — returns the current state.

## Examples

### Everyday example

```javascript
import { Column, Radio, Row, Text } from "flet-box";

const option = (label) => Row({
  gap: 8,
  alignItems: "center",
  children: [Radio({ name: "plan" }), Text({ text: label })],
});

Column({ gap: 8, children: [option("Free"), option("Pro"), option("Team")] });
```

### Full example

```javascript
import { Column, Radio, Row, Text } from "flet-box";

const selected = Radio({ name: "size", selected: true });

Column({
  gap: 8,
  children: [
    Row({ gap: 8, alignItems: "center", children: [selected, Text({ text: "Small" })] }),
    Row({ gap: 8, alignItems: "center", children: [Radio({ name: "size" }), Text({ text: "Medium" })] }),
    Row({ gap: 8, alignItems: "center", children: [Radio({ name: "size" }), Text({ text: "Large" })] }),
  ],
});

// selected.select();  selected.unselect();  selected.isSelected();
```

## Notes

- Custom-drawn, not a native `<input type="radio">`.
- Grouping uses a `data-radio-group` attribute keyed by `name`; clicking one clears the others via their `unselect()`.

## Related widgets
- [Checkbox](Checkbox.md)
- [Switch](Switch.md)
- [Dropdown](Dropdown.md)
- [Text](Text.md)

---

## Continue reading

- **Previous:** [Checkbox](Checkbox.md)
- **Next:** [Switch](Switch.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (4 of 8).
