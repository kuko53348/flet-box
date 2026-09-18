# Switch

## Overview
`Switch` renders an iOS-style on/off toggle drawn with FletBox widgets. It flips its own state on click and reports changes through `onToggle`. The returned element exposes `updateValue` and `getValue`.

## When to use
- Toggle a setting on or off with immediate effect.
- Present a binary preference in a settings screen.

## Import

```javascript
import { Switch } from "flet-box";
```

## Basic example

The smallest useful version. Start here if this widget is new to you.

```javascript
import { Switch } from "flet-box";

Switch({ onToggle: (on) => console.log("on:", on) });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | boolean | `false` | Initial on/off state. |
| `onToggle` | `(value: boolean) => void` | — | Fires with the new state after a toggle. |
| `disabled` | boolean | `false` | Disables interaction. |
| `size` | `'small'`, `'medium'`, `'large'` | `'medium'` | Preset dimensions (a string here, not a number). |

These are the props specific to `Switch`. It also accepts every [common prop](COMMON_PROPS.md): layout, spacing, size, color, typography, borders, shadow, events, `child`/`children`, `ref`, and `style`.

## Instance methods

The returned element exposes:

- `updateValue(value)` — sets the state programmatically.
- `getValue()` — returns the current state.

## Examples

### Everyday example

```javascript
import { Row, Switch, Text } from "flet-box";

Row({
  gap: 12,
  alignItems: "center",
  justifyContent: "space-between",
  children: [
    Text({ text: "Enable notifications" }),
    Switch({ value: true, onToggle: (v) => console.log(v) }),
  ],
});
```

### Full example

```javascript
import { Column, Switch, Text } from "flet-box";

const toggle = Switch({ size: "large", onToggle: (v) => console.log(v) });

Column({
  gap: 8,
  children: [toggle, Text({ text: "A large switch you can control in code." })],
});

// toggle.updateValue(false);  toggle.getValue();
```

## Notes

- Custom-drawn, not a native checkbox input.
- The on state uses the theme `success` color; the off state uses gray.
- `size` is a string preset (`small`/`medium`/`large`), unlike the numeric `size` of `Checkbox`/`Radio`.

## Related widgets
- [Checkbox](Checkbox.md)
- [Radio](Radio.md)
- [Input](Input.md)
- [Text](Text.md)

---

## Continue reading

- **Previous:** [Radio](Radio.md)
- **Next:** [Slider](Slider.md)
- **Index:** [Widget index](README.md) · [Start here](START_HERE.md)

You are reading **Chapter 2 · Interaction basics** (5 of 8).
