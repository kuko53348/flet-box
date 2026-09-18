# Checkbox

## Overview
`Checkbox` renders a custom (non-native) check box drawn with FletBox widgets. It toggles its own visual state on click and reports changes through `onCheck`. The returned element exposes `setChecked` and `getChecked`.

## When to use
- Let the user toggle a single boolean option on or off.
- Build multi-select lists where several options can be true at once.

## Import

```javascript
import { Checkbox } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Checkbox } from "flet-box";

Checkbox({ onCheck: (checked) => console.log("checked:", checked) });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | boolean | `false` | Initial checked state. |
| `onCheck` | `(checked: boolean) => void` | — | Fires with the new state after a toggle. |
| `disabled` | boolean | `false` | Disables interaction (opacity 0.5, `not-allowed` cursor). |
| `size` | number | `20` | Box size in pixels. |

These are the props specific to `Checkbox`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Instance methods

The returned element exposes:

- `setChecked(value, triggerCallback = true)` — sets the state; fires `onCheck` unless `triggerCallback` is `false`.
- `getChecked()` — returns the current state.

## Examples

### Everyday example

```javascript
import { Checkbox, Row, Text } from "flet-box";

Row({
  gap: 8,
  alignItems: "center",
  children: [
    Checkbox({ checked: true, onCheck: (v) => console.log("agree:", v) }),
    Text({ text: "I accept the terms" }),
  ],
});
```

### Full example

```javascript
import { Checkbox, Column, Text } from "flet-box";

const box = Checkbox({ size: 24, onCheck: (v) => console.log(v) });

Column({
  gap: 8,
  children: [
    box,
    Text({ text: "Toggle me, then read the state in code." }),
  ],
});

// box.setChecked(true);  // set without user interaction
// box.getChecked();      // -> true
```

## Notes

- Custom-drawn (a styled box with a `✓`), not a native `<input type="checkbox">`.
- The checked state uses the theme `primary` color.
- The event prop is `onCheck` (not `onChange`).

## Related widgets
- [Radio](Radio.md)
- [Switch](Switch.md)
- [Input](Input.md)
- [Text](Text.md)

---

## Continue reading

- **Previous:** [Input](Input.md)
- **Next:** [Radio](Radio.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (3 of 8).
